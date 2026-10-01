import { supabase } from './supabase'
import { formatDate, parseDate, toDateInput } from './format'
import type { EventItem } from './types'

/**
 * Acceso a datos de `events`.
 * Esquema real: SOLO id, title, event_date, organization_id, created_at.
 */

export type Frequency = 'semanal' | 'quincenal'

export interface EventFormValues {
  title: string
  event_date: string
  is_recurring: boolean
  frequency: Frequency
  end_date: string
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: '',
  event_date: '',
  is_recurring: false,
  frequency: 'semanal',
  end_date: '',
}

export interface EventProgram {
  title: string
  sessions: EventItem[]
  rangeLabel: string
  upcoming: number
}

/** Fecha 'YYYY-MM-DD' → ISO a medianoche local (formato histórico de la columna). */
const normalizeDate = (raw: string): string => {
  const d = new Date(`${raw}T00:00:00`)
  return isNaN(d.getTime()) ? raw : d.toISOString()
}

export async function listEvents(orgId: string): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_date')
    .eq('organization_id', orgId)
    .order('event_date', { ascending: true })
    .limit(200)
  if (error) throw error
  return (data ?? []) as EventItem[]
}

export function validateEventForm(f: EventFormValues, editing: boolean): string | null {
  if (!f.title.trim() || !f.event_date) return 'Título y fecha son obligatorios.'
  if (!editing && f.is_recurring) {
    if (!f.end_date) return 'Indicá la fecha límite de repetición.'
    if (f.end_date <= f.event_date) return 'La fecha límite debe ser posterior a la fecha del evento.'
  }
  return null
}

/** Genera las fechas de una recurrencia semanal/quincenal. */
export function buildRecurringDates(start: string, end: string, frequency: Frequency): string[] {
  const step = frequency === 'quincenal' ? 14 : 7
  const dates: string[] = []
  const cursor = new Date(`${start}T00:00:00`)
  const last = new Date(`${end}T00:00:00`)
  while (cursor <= last) {
    dates.push(toDateInput(cursor))
    cursor.setDate(cursor.getDate() + step)
  }
  return dates
}

/** Crea el evento (o la serie). Devuelve cuántos eventos se insertaron. */
export async function createEvents(orgId: string, f: EventFormValues): Promise<number> {
  const title = f.title.trim()
  if (!f.is_recurring) {
    const { error } = await supabase
      .from('events')
      .insert({ organization_id: orgId, title, event_date: normalizeDate(f.event_date) })
    if (error) throw error
    return 1
  }
  const rows = buildRecurringDates(f.event_date, f.end_date, f.frequency).map((event_date) => ({
    organization_id: orgId,
    title,
    event_date,
  }))
  if (rows.length === 0) throw new Error('No se pudo generar ninguna fecha para la recurrencia.')
  const { error } = await supabase.from('events').insert(rows)
  if (error) throw error
  return rows.length
}

export async function updateEvent(orgId: string, id: string, f: EventFormValues): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({ title: f.title.trim(), event_date: normalizeDate(f.event_date) })
    .eq('id', id)
    .eq('organization_id', orgId)
  if (error) throw error
}

export async function deleteEvent(orgId: string, id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id).eq('organization_id', orgId)
  if (error) throw error
}

export async function deleteProgram(orgId: string, title: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('organization_id', orgId).eq('title', title)
  if (error) throw error
}

export async function deletePastEvents(orgId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('organization_id', orgId)
    .lt('event_date', toDateInput(new Date()))
  if (error) throw error
}

/** Agrupa eventos por título ("programas") ordenados por su primera clase. */
export function groupPrograms(events: EventItem[]): EventProgram[] {
  const today = toDateInput(new Date())
  const grouped = new Map<string, EventItem[]>()
  for (const evt of events) {
    const list = grouped.get(evt.title) ?? []
    list.push(evt)
    grouped.set(evt.title, list)
  }
  return Array.from(grouped.entries())
    .map(([title, sessions]) => {
      sessions.sort((a, b) => a.event_date.localeCompare(b.event_date))
      const first = sessions[0].event_date
      const last = sessions[sessions.length - 1].event_date
      return {
        title,
        sessions,
        rangeLabel: first === last ? formatDate(first) : `${formatDate(first)} — ${formatDate(last)}`,
        upcoming: sessions.filter((s) => s.event_date.slice(0, 10) >= today).length,
      }
    })
    .sort((a, b) => a.sessions[0].event_date.localeCompare(b.sessions[0].event_date))
}

export function isUpcoming(evt: EventItem): boolean {
  return parseDate(evt.event_date).getTime() >= new Date(new Date().toDateString()).getTime()
}

// ---------------------------------------------------------------------------
// Estadísticas del dashboard
// ---------------------------------------------------------------------------

export interface DashboardStats {
  memberCount: number
  newMembers30d: number
  studentCount: number
  stageCounts: { 'niño': number; adolescente: number; adulto: number }
  lastEvent: { title: string; date: string; attendance: number } | null
}

export async function loadDashboardStats(orgId: string): Promise<DashboardStats> {
  const today = toDateInput(new Date())
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const count = (build: (q: any) => any) =>
    build(supabase.from('congregados').select('*', { count: 'exact', head: true }).eq('organization_id', orgId)).then(
      (r: { count: number | null }) => r.count ?? 0,
    )

  const [memberCount, newMembers30d, studentCount, niño, adolescente, adulto, lastEventRes] = await Promise.all([
    count((q) => q),
    count((q) => q.gte('created_at', since)),
    count((q) => q.eq('is_student', true)),
    count((q) => q.eq('is_student', true).eq('student_stage', 'niño')),
    count((q) => q.eq('is_student', true).eq('student_stage', 'adolescente')),
    count((q) => q.eq('is_student', true).eq('student_stage', 'adulto')),
    supabase
      .from('events')
      .select('id, title, event_date')
      .eq('organization_id', orgId)
      .lte('event_date', today)
      .order('event_date', { ascending: false })
      .limit(1),
  ])

  let lastEvent: DashboardStats['lastEvent'] = null
  const last = lastEventRes.data?.[0]
  if (last) {
    const { count: attendance } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', last.id)
      .eq('organization_id', orgId)
    lastEvent = { title: last.title, date: last.event_date, attendance: attendance ?? 0 }
  }

  return {
    memberCount,
    newMembers30d,
    studentCount,
    stageCounts: { 'niño': niño, adolescente, adulto },
    lastEvent,
  }
}

import { supabase } from './supabase'
import { needsGuardian } from './congregados'
import type { CongregadoInput } from './types'

export interface ChurchInfo {
  id: string
  name: string
  address?: string | null
  logo_url?: string | null
  motto?: string | null
}

export const churchLabel = (c: ChurchInfo) => c.name + (c.address ? ` · ${c.address}` : '')

export async function listChurches(): Promise<ChurchInfo[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, address, logo_url, motto')
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as ChurchInfo[]
}

export interface Credential {
  id: string
  qr_code: string
  phone: string
  name: string
}

/** Auto-inscripción de un miembro: valida cupo del plan, inserta y guarda el código local. */
export async function registerMember(churchId: string, f: CongregadoInput): Promise<Credential> {
  const { count } = await supabase
    .from('congregados')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', churchId)

  const { data: org } = await supabase.from('organizations').select('member_limit').eq('id', churchId).maybeSingle()

  const limit = org?.member_limit ?? 50
  if (count !== null && count >= limit) {
    throw new Error(
      'Esta congregación alcanzó el límite de miembros de su plan actual. Por favor contactá al pastor o administrador.',
    )
  }

  const qr = crypto.randomUUID()
  const guardian = needsGuardian(f)
  const { data, error } = await supabase
    .from('congregados')
    .insert({
      organization_id: churchId,
      first_name: f.first_name.trim(),
      last_name: f.last_name.trim(),
      phone: f.phone.trim(),
      is_student: f.is_student,
      student_stage: f.is_student ? f.student_stage : null,
      guardian_name: guardian ? f.guardian_name.trim() || null : null,
      guardian_phone: guardian ? f.guardian_phone.trim() || null : null,
      qr_code: qr,
      status: 'activo',
    })
    .select('id, qr_code')
  if (error) throw error

  localStorage.setItem('asistapp_congregado_code', qr)
  return {
    id: data?.[0]?.id || qr,
    qr_code: qr,
    phone: f.phone.trim(),
    name: `${f.first_name.trim()} ${f.last_name.trim()}`,
  }
}

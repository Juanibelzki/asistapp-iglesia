import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarCheck,
  CalendarDays,
  Check,
  Download,
  Eraser,
  GraduationCap,
  Link2,
  Plus,
  Users,
} from 'lucide-react'
import { useOrg } from '../lib/org'
import { useCopy, useResource } from '../lib/hooks'
import {
  createEvents,
  deleteEvent,
  deletePastEvents,
  deleteProgram,
  groupPrograms,
  listEvents,
  loadDashboardStats,
  updateEvent,
  type EventFormValues,
  type EventProgram,
} from '../lib/events'
import { exportAttendanceReport } from '../lib/export'
import { errorMessage, formatDate, greeting } from '../lib/format'
import { STAGES, STAGE_LABELS, STAGE_RANGES, type EventItem } from '../lib/types'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/button'
import { Card, CardHeader } from '../components/ui/card'
import { Alert, Skeleton } from '../components/ui/feedback'
import { ConfirmDialog } from '../components/ui/modal'
import { useToast } from '../components/ui/toast'
import { StatCard } from '../components/dashboard/StatCard'
import { ProgramList } from '../components/dashboard/ProgramList'
import { EventFormModal } from '../components/dashboard/EventFormModal'

export const Route = createFileRoute('/_app/dashboard')({
  head: () => ({ meta: [{ title: 'Panel general · Ecclesiahs' }] }),
  component: DashboardPage,
})

type Pending =
  | { kind: 'event'; event: EventItem; label: string }
  | { kind: 'program'; program: EventProgram }
  | { kind: 'past' }

function DashboardPage() {
  const { orgId, fullName, churchName } = useOrg()
  const toast = useToast()

  const stats = useResource(() => loadDashboardStats(orgId), [orgId])
  const events = useResource(() => listEvents(orgId), [orgId])
  const programs = useMemo(() => groupPrograms(events.data ?? []), [events.data])
  const activePrograms = programs.filter((p) => p.upcoming > 0).length

  const [modal, setModal] = useState<{ open: boolean; editing?: EventItem }>({ open: false })
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { copied, copy } = useCopy()

  const staffLink = `${window.location.origin}/registerstaff?org=${orgId}`
  const firstName = fullName.split(' ')[0]
  const s = stats.data

  const refresh = async () => {
    await Promise.all([events.reload(), stats.reload()])
  }

  const handleSave = async (values: EventFormValues) => {
    if (modal.editing) {
      await updateEvent(orgId, modal.editing.id, values)
      toast('Evento actualizado.')
    } else {
      const n = await createEvents(orgId, values)
      toast(n === 1 ? 'Evento programado.' : `Se programaron ${n} clases.`)
    }
    setModal({ open: false })
    await refresh()
  }

  const handleConfirm = async () => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'event') {
        await deleteEvent(orgId, pending.event.id)
        toast('Clase eliminada.')
      } else if (pending.kind === 'program') {
        await deleteProgram(orgId, pending.program.title)
        toast(`Programa «${pending.program.title}» eliminado.`)
      } else {
        await deletePastEvents(orgId)
        toast('Eventos pasados eliminados.')
      }
      setPending(null)
      await refresh()
    } catch (err) {
      toast(errorMessage(err, 'No se pudo eliminar.'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    const now = new Date()
    const res = await exportAttendanceReport(orgId, now.getMonth(), now.getFullYear())
    setExporting(false)
    if (res.ok) toast(res.count > 0 ? `${res.count} registros exportados.` : 'No hay asistencias registradas este mes.')
    else toast(res.error || 'No se pudo exportar.', 'error')
  }

  const handleCopy = async () => {
    const ok = await copy(staffLink)
    toast(ok ? 'Enlace copiado.' : 'No se pudo copiar el enlace.', ok ? 'success' : 'error')
  }

  const confirmCopy = (() => {
    if (!pending) return { title: '', message: '' as React.ReactNode, label: 'Eliminar' }
    if (pending.kind === 'event')
      return {
        title: 'Eliminar clase',
        message: <>¿Eliminar <strong className="text-ink">{pending.label}</strong>? Esta acción no se puede deshacer.</>,
        label: 'Eliminar clase',
      }
    if (pending.kind === 'program')
      return {
        title: 'Eliminar programa',
        message: (
          <>
            ¿Eliminar <strong className="text-ink">«{pending.program.title}»</strong> con sus{' '}
            {pending.program.sessions.length} clases? Esta acción no se puede deshacer.
          </>
        ),
        label: 'Eliminar programa',
      }
    return {
      title: 'Limpiar eventos pasados',
      message: 'Se eliminarán todos los eventos con fecha anterior a hoy. Esta acción no se puede deshacer.',
      label: 'Limpiar',
    }
  })()

  const totalStage = s ? STAGES.reduce((acc, k) => acc + s.stageCounts[k], 0) : 0

  return (
    <>
      <PageHeader
        eyebrow={`${greeting()}, ${firstName}`}
        title="Panel general"
        description={
          <>
            Así va la actividad de <strong className="font-semibold text-ink">{churchName}</strong>.
          </>
        }
        actions={
          <>
            <Button variant="secondary" onClick={handleExport} loading={exporting} leftIcon={<Download className="h-4 w-4" />}>
              Exportar mes
            </Button>
            <Button onClick={() => setModal({ open: true })} leftIcon={<Plus className="h-4 w-4" />}>
              Nuevo evento
            </Button>
          </>
        }
      />

      {(stats.error || events.error) && (
        <Alert className="mb-6">No pudimos cargar todos los datos: {stats.error || events.error}</Alert>
      )}

      <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Congregados"
          value={s?.memberCount ?? 0}
          hint={s ? `+${s.newMembers30d} en los últimos 30 días` : undefined}
          icon={<Users className="h-[18px] w-[18px]" />}
          loading={stats.loading}
        />
        <StatCard
          label="Alumnos formativos"
          value={s?.studentCount ?? 0}
          hint="Niños, adolescentes y adultos"
          icon={<GraduationCap className="h-[18px] w-[18px]" />}
          tone="accent"
          loading={stats.loading}
        />
        <StatCard
          label="Última asistencia"
          value={s?.lastEvent?.attendance ?? 0}
          hint={s?.lastEvent ? `${s.lastEvent.title} · ${formatDate(s.lastEvent.date)}` : 'Aún sin eventos pasados'}
          icon={<CalendarCheck className="h-[18px] w-[18px]" />}
          tone="success"
          loading={stats.loading}
        />
        <StatCard
          label="Programas activos"
          value={activePrograms}
          hint="Con clases por venir"
          icon={<CalendarDays className="h-[18px] w-[18px]" />}
          tone="neutral"
          loading={events.loading}
        />
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <CardHeader
            title="Programas y eventos"
            description="Tus clases agrupadas por programa."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPending({ kind: 'past' })}
                leftIcon={<Eraser className="h-4 w-4" />}
                className="-mr-2"
              >
                <span className="hidden sm:inline">Limpiar pasados</span>
              </Button>
            }
          />
          <div className="mt-4 border-t border-line">
            {events.loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : (
              <ProgramList
                programs={programs}
                onCreate={() => setModal({ open: true })}
                onEdit={(evt) => setModal({ open: true, editing: evt })}
                onDeleteEvent={(evt, p, i) =>
                  setPending({ kind: 'event', event: evt, label: `la clase ${i + 1} de «${p.title}» (${formatDate(evt.event_date)})` })
                }
                onDeleteProgram={(program) => setPending({ kind: 'program', program })}
              />
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Alumnos por etapa" description={`${totalStage} alumnos registrados`} />
            <ul className="space-y-5 p-5 pt-4 sm:p-6 sm:pt-5">
              {STAGES.map((stage) => {
                const n = s?.stageCounts[stage] ?? 0
                const pct = totalStage ? Math.round((n / totalStage) * 100) : 0
                return (
                  <li key={stage}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <p className="text-sm font-semibold text-ink">
                        {STAGE_LABELS[stage]} <span className="font-normal text-ink-faint">· {STAGE_RANGES[stage]}</span>
                      </p>
                      <p className="text-sm font-bold tabular-nums text-ink">{stats.loading ? '–' : n}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-sunken" role="img" aria-label={`${pct}% del total`}>
                      <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card className="bg-primary-soft/60">
            <div className="p-5 sm:p-6">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-ink">
                <Link2 className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold text-ink">Sumá a tu equipo</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Compartí este enlace con maestros y ujieres para que creen su acceso al panel de asistencia.
              </p>
              <Button
                className="mt-4 w-full"
                variant={copied ? 'secondary' : 'primary'}
                onClick={handleCopy}
                leftIcon={copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              >
                {copied ? '¡Enlace copiado!' : 'Copiar enlace de equipo'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <EventFormModal
        open={modal.open}
        initial={modal.editing ? { title: modal.editing.title, event_date: modal.editing.event_date } : undefined}
        onClose={() => setModal({ open: false })}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={!!pending}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.label}
        loading={busy}
        onCancel={() => setPending(null)}
        onConfirm={handleConfirm}
      />
    </>
  )
}

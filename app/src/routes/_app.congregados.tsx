import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Download, Plus, Search, UserPlus, UsersRound } from 'lucide-react'
import { useOrg } from '../lib/org'
import { useDebounced, useResource } from '../lib/hooks'
import {
  createCongregado,
  deleteCongregado,
  listCongregados,
  memberToInput,
  updateCongregado,
} from '../lib/congregados'
import { exportAttendanceReport } from '../lib/export'
import { errorMessage } from '../lib/format'
import { STAGES, STAGE_LABELS, STAGE_RANGES, type Congregado, type CongregadoInput, type StudentStage } from '../lib/types'
import { PageHeader } from '../components/layout/PageHeader'
import { Button, LinkButton } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/field'
import { Alert, EmptyState, Skeleton } from '../components/ui/feedback'
import { ConfirmDialog } from '../components/ui/modal'
import { Segmented } from '../components/ui/segmented'
import { useToast } from '../components/ui/toast'
import { MemberList } from '../components/congregados/MemberList'
import { MemberFormModal } from '../components/congregados/MemberFormModal'
import { QrModal } from '../components/congregados/QrModal'
import { cn } from '../lib/cn'

export const Route = createFileRoute('/_app/congregados')({
  head: () => ({ meta: [{ title: 'Congregados · Ecclesiahs' }] }),
  component: CongregadosPage,
})

type Tab = 'todos' | 'alumnos'
type StageFilter = 'todos' | StudentStage

const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function CongregadosPage() {
  const { orgId, churchName, memberLimit } = useOrg()
  const toast = useToast()
  const members = useResource(() => listCongregados(orgId), [orgId])
  const list = members.data ?? []

  const [tab, setTab] = useState<Tab>('todos')
  const [stage, setStage] = useState<StageFilter>('todos')
  const [query, setQuery] = useState('')
  const q = useDebounced(query, 150)

  const [form, setForm] = useState<{ open: boolean; editing?: Congregado }>({ open: false })
  const [qrMember, setQrMember] = useState<Congregado | null>(null)
  const [toDelete, setToDelete] = useState<Congregado | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const students = list.filter((m) => m.is_student)
  const atLimit = list.length >= memberLimit
  const usage = Math.min(100, Math.round((list.length / memberLimit) * 100))

  const filtered = useMemo(() => {
    const needle = normalize(q.trim())
    return list.filter((m) => {
      if (tab === 'alumnos') {
        if (!m.is_student) return false
        if (stage !== 'todos' && m.student_stage !== stage) return false
      }
      if (!needle) return true
      const haystack = normalize(
        [m.first_name, m.last_name, m.phone, m.guardian_name, m.guardian_phone].filter(Boolean).join(' '),
      )
      return haystack.includes(needle)
    })
  }, [list, tab, stage, q])

  const handleSave = async (values: CongregadoInput) => {
    const name = `${values.first_name.trim()} ${values.last_name.trim()}`
    if (form.editing) {
      await updateCongregado(orgId, form.editing.id, values)
      toast(`${name} fue actualizado.`)
    } else {
      if (atLimit) {
        throw new Error(
          `Alcanzaste el límite de ${memberLimit} congregados de tu plan. Actualizá tu suscripción en Ajustes.`,
        )
      }
      await createCongregado(orgId, values)
      toast(`${name} fue registrado.`)
    }
    setForm({ open: false })
    await members.reload()
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteCongregado(orgId, toDelete.id)
      toast(`${toDelete.first_name} ${toDelete.last_name} fue eliminado.`)
      setToDelete(null)
      await members.reload()
    } catch (err) {
      toast(errorMessage(err, 'No se pudo eliminar.'), 'error')
    } finally {
      setDeleting(false)
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

  const openCreate = () => setForm({ open: true })
  const isFiltering = tab !== 'todos' || q.trim() !== ''

  return (
    <>
      <PageHeader
        title="Congregados"
        description={
          <>
            Miembros y alumnos formativos de <strong className="font-semibold text-ink">{churchName}</strong>.
          </>
        }
        actions={
          <>
            <Button variant="secondary" onClick={handleExport} loading={exporting} leftIcon={<Download className="h-4 w-4" />}>
              Exportar lista
            </Button>
            <Button onClick={openCreate} disabled={atLimit} leftIcon={<Plus className="h-4 w-4" />}>
              Registrar
            </Button>
          </>
        }
      />

      {members.error && <Alert className="mb-6">No pudimos cargar el directorio: {members.error}</Alert>}

      {/* Uso del plan */}
      {!members.loading && !members.error && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4 shadow-card sm:flex-row sm:items-center sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <p className="font-semibold text-ink">
                {list.length} <span className="font-normal text-ink-soft">de {memberLimit} congregados de tu plan</span>
              </p>
              <p className="font-semibold tabular-nums text-ink-soft">{usage}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sunken">
              <div
                className={cn('h-full rounded-full transition-all duration-700', usage >= 90 ? 'bg-danger' : usage >= 70 ? 'bg-accent' : 'bg-primary')}
                style={{ width: `${usage}%` }}
              />
            </div>
          </div>
          {usage >= 70 && (
            <LinkButton to="/ajustes" variant={atLimit ? 'primary' : 'secondary'} size="sm">
              {atLimit ? 'Ampliar plan' : 'Ver planes'}
            </LinkButton>
          )}
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Barra de herramientas */}
        <div className="space-y-4 border-b border-line p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Segmented<Tab>
              label="Tipo de congregado"
              value={tab}
              onChange={(v) => {
                setTab(v)
                setStage('todos')
              }}
              options={[
                { value: 'todos', label: 'Todos', count: list.length },
                { value: 'alumnos', label: 'Alumnos formativos', count: students.length },
              ]}
            />
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o teléfono"
                aria-label="Buscar congregados"
                className="pl-10"
              />
            </div>
          </div>

          {tab === 'alumnos' && (
            <Segmented<StageFilter>
              label="Etapa"
              value={stage}
              onChange={setStage}
              options={[
                { value: 'todos', label: 'Todas las etapas' },
                ...STAGES.map((s) => ({
                  value: s,
                  label: `${STAGE_LABELS[s]} (${STAGE_RANGES[s]})`,
                  count: students.filter((m) => m.student_stage === s).length,
                })),
              ]}
            />
          )}
        </div>

        {/* Contenido */}
        {members.loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          isFiltering && list.length > 0 ? (
            <EmptyState
              icon={<Search className="h-7 w-7" />}
              title="Sin resultados"
              description="Probá con otro nombre o cambiá los filtros."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('')
                    setTab('todos')
                    setStage('todos')
                  }}
                >
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<UsersRound className="h-7 w-7" />}
              title="Todavía no hay congregados"
              description="Registrá a las familias, jóvenes y miembros para centralizar tu directorio y generar sus códigos QR."
              action={
                <Button onClick={openCreate} leftIcon={<UserPlus className="h-4 w-4" />}>
                  Registrar primer miembro
                </Button>
              }
            />
          )
        ) : (
          <MemberList
            items={filtered}
            onQr={setQrMember}
            onEdit={(m) => setForm({ open: true, editing: m })}
            onDelete={setToDelete}
          />
        )}
      </Card>

      <MemberFormModal
        open={form.open}
        initial={form.editing ? memberToInput(form.editing) : undefined}
        onClose={() => setForm({ open: false })}
        onSubmit={handleSave}
      />
      <QrModal member={qrMember} onClose={() => setQrMember(null)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar congregado"
        message={
          toDelete && (
            <>
              ¿Eliminar a <strong className="text-ink">{toDelete.first_name} {toDelete.last_name}</strong>? Esta acción no se puede deshacer.
            </>
          )
        }
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

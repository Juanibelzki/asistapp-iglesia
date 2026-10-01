import { Pencil, QrCode, Trash2 } from 'lucide-react'
import type { Congregado } from '../../lib/types'
import { STAGE_SINGULAR } from '../../lib/types'
import { initials } from '../../lib/format'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface Props {
  items: Congregado[]
  onQr: (m: Congregado) => void
  onEdit: (m: Congregado) => void
  onDelete: (m: Congregado) => void
}

function CategoryBadge({ m }: { m: Congregado }) {
  if (!m.is_student) return <Badge>Congregado</Badge>
  return (
    <Badge tone="accent">
      Alumno{m.student_stage ? ` · ${STAGE_SINGULAR[m.student_stage]}` : ''}
    </Badge>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const active = !status || status.toLowerCase() === 'activo'
  return <Badge tone={active ? 'success' : 'neutral'}>{active ? 'Activo' : status}</Badge>
}

function contact(m: Congregado) {
  if (m.guardian_name) return { primary: m.guardian_name, secondary: m.guardian_phone || 'Tutor' }
  return { primary: m.phone || 'Sin contacto', secondary: null }
}

function Actions({ m, onQr, onEdit, onDelete }: { m: Congregado } & Omit<Props, 'items'>) {
  const name = `${m.first_name} ${m.last_name}`
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button variant="ghost" size="icon" onClick={() => onQr(m)} aria-label={`Ver QR de ${name}`} title="Ver QR">
        <QrCode className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onEdit(m)} aria-label={`Editar ${name}`} title="Editar">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(m)}
        aria-label={`Eliminar ${name}`}
        title="Eliminar"
        className="hover:!bg-danger-soft hover:!text-danger"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function MemberList({ items, ...actions }: Props) {
  return (
    <>
      {/* Tabla (≥ md) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wider text-ink-faint">
              <th className="px-6 py-3">Nombre</th>
              <th className="px-3 py-3">Categoría</th>
              <th className="px-3 py-3">Contacto</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-6 py-3 text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((m) => {
              const c = contact(m)
              return (
                <tr key={m.id} className="transition-colors hover:bg-sunken/60">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {initials(`${m.first_name} ${m.last_name}`)}
                      </span>
                      <span className="font-semibold text-ink">
                        {m.first_name} {m.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <CategoryBadge m={m} />
                  </td>
                  <td className="px-3 py-3.5">
                    <p className="text-ink">{c.primary}</p>
                    {c.secondary && <p className="text-xs text-ink-faint">{c.secondary}</p>}
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <Actions m={m} {...actions} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas (< md) */}
      <ul className="divide-y divide-line md:hidden">
        {items.map((m) => {
          const c = contact(m)
          return (
            <li key={m.id} className="px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                  {initials(`${m.first_name} ${m.last_name}`)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">
                    {m.first_name} {m.last_name}
                  </p>
                  <p className="truncate text-xs text-ink-faint">
                    {c.primary}
                    {c.secondary ? ` · ${c.secondary}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <CategoryBadge m={m} />
                    <StatusBadge status={m.status} />
                  </div>
                </div>
              </div>
              <div className="mt-2 -mr-2">
                <Actions m={m} {...actions} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

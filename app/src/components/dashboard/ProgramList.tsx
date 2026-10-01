import { useState } from 'react'
import { CalendarPlus, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import type { EventProgram } from '../../lib/events'
import type { EventItem } from '../../lib/types'
import { formatDate } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { EmptyState } from '../ui/feedback'

interface Props {
  programs: EventProgram[]
  onCreate: () => void
  onEdit: (evt: EventItem) => void
  onDeleteEvent: (evt: EventItem, program: EventProgram, index: number) => void
  onDeleteProgram: (program: EventProgram) => void
}

export function ProgramList({ programs, onCreate, onEdit, onDeleteEvent, onDeleteProgram }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({})

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={<CalendarPlus className="h-7 w-7" />}
        title="Todavía no hay eventos"
        description="Creá tu primera clase o culto para empezar a tomar asistencia con QR."
        action={<Button onClick={onCreate}>Crear primer evento</Button>}
      />
    )
  }

  return (
    <ul className="divide-y divide-line">
      {programs.map((p) => {
        const isOpen = !!open[p.title]
        const panelId = `program-${p.title.replace(/\W+/g, '-')}`
        return (
          <li key={p.title}>
            <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen((o) => ({ ...o, [p.title]: !o[p.title] }))}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-sunken"
              >
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 text-ink-faint transition-transform', isOpen && 'rotate-180')}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{p.title}</span>
                  <span className="block truncate text-xs text-ink-faint">{p.rangeLabel}</span>
                </span>
              </button>
              <Badge tone={p.upcoming > 0 ? 'primary' : 'neutral'} className="hidden shrink-0 sm:inline-flex">
                {p.sessions.length} {p.sessions.length === 1 ? 'clase' : 'clases'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Eliminar programa ${p.title}`}
                title="Eliminar programa"
                onClick={() => onDeleteProgram(p)}
                className="hover:!bg-danger-soft hover:!text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {isOpen && (
              <ul id={panelId} className="mx-4 mb-3 ml-9 space-y-0.5 border-l-2 border-line pl-3 sm:ml-11">
                {p.sessions.map((evt, i) => (
                  <li key={evt.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-sunken">
                    <p className="min-w-0 text-sm">
                      <span className="mr-2 font-semibold text-ink-faint">Clase {i + 1}</span>
                      <span className="text-ink">{formatDate(evt.event_date)}</span>
                    </p>
                    <div className="flex shrink-0 gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="!h-8 !w-8"
                        aria-label={`Editar clase ${i + 1} de ${p.title}`}
                        onClick={() => onEdit(evt)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="!h-8 !w-8 hover:!bg-danger-soft hover:!text-danger"
                        aria-label={`Eliminar clase ${i + 1} de ${p.title}`}
                        onClick={() => onDeleteEvent(evt, p, i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}

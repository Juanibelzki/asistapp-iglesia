import { useEffect, useState } from 'react'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import { Field, Input, SwitchRow } from '../ui/field'
import { Alert } from '../ui/feedback'
import { cn } from '../../lib/cn'
import { toDateInput } from '../../lib/format'
import { EMPTY_EVENT_FORM, validateEventForm, type EventFormValues, type Frequency } from '../../lib/events'

interface Props {
  open: boolean
  /** Valores iniciales cuando se edita; undefined = nuevo evento. */
  initial?: Pick<EventFormValues, 'title' | 'event_date'>
  onClose: () => void
  onSubmit: (values: EventFormValues) => Promise<void>
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'semanal', label: 'Cada semana' },
  { value: 'quincenal', label: 'Cada 14 días' },
]

export function EventFormModal({ open, initial, onClose, onSubmit }: Props) {
  const editing = !!initial
  const [form, setForm] = useState<EventFormValues>(EMPTY_EVENT_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_EVENT_FORM, ...initial, event_date: initial.event_date.slice(0, 10) } : EMPTY_EVENT_FORM)
      setError('')
    }
  }, [open, initial])

  const set = <K extends keyof EventFormValues>(k: K, v: EventFormValues[K]) => setForm((f) => ({ ...f, [k]: v }))

  const minEnd = form.event_date
    ? (() => {
        const d = new Date(`${form.event_date}T00:00:00`)
        d.setDate(d.getDate() + 1)
        return toDateInput(d)
      })()
    : ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = validateEventForm(form, editing)
    if (problem) return setError(problem)
    setSaving(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : (err as any)?.message || 'No se pudo guardar el evento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar evento' : 'Nuevo evento'}
      description={editing ? 'Cambiá el título o la fecha de esta clase.' : 'Programá una clase o culto, único o repetido.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="event-form" loading={saving}>
            {editing ? 'Guardar cambios' : 'Crear evento'}
          </Button>
        </>
      }
    >
      <form id="event-form" onSubmit={submit} className="space-y-5">
        <Field label="Título" required>
          {(id) => (
            <Input
              id={id}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ej: Escuela bíblica de niños"
              required
            />
          )}
        </Field>

        <Field label="Fecha" required>
          {(id) => (
            <Input id={id} type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} required />
          )}
        </Field>

        {!editing && (
          <>
            <SwitchRow
              checked={form.is_recurring}
              onChange={(v) => set('is_recurring', v)}
              label="¿Es un evento recurrente?"
              description="Se repetirá automáticamente hasta la fecha límite."
            />

            {form.is_recurring && (
              <div className="space-y-5 rounded-xl border border-line p-4">
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-ink">Frecuencia</p>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Frecuencia">
                    {FREQUENCIES.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        role="radio"
                        aria-checked={form.frequency === f.value}
                        onClick={() => set('frequency', f.value)}
                        className={cn(
                          'h-11 cursor-pointer rounded-xl border text-sm font-semibold transition-colors',
                          form.frequency === f.value
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-line-strong text-ink-soft hover:bg-sunken',
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Field
                  label="Repetir hasta"
                  required
                  error={
                    form.end_date && form.end_date <= form.event_date
                      ? 'La fecha límite debe ser posterior a la fecha del evento.'
                      : undefined
                  }
                >
                  {(id) => (
                    <Input id={id} type="date" min={minEnd} value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
                  )}
                </Field>
              </div>
            )}
          </>
        )}

        {error && <Alert>{error}</Alert>}
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import { Field, Input, SwitchRow } from '../ui/field'
import { Alert } from '../ui/feedback'
import { cn } from '../../lib/cn'
import { EMPTY_MEMBER, needsGuardian, validateMember } from '../../lib/congregados'
import { STAGES, STAGE_LABELS, STAGE_RANGES, type CongregadoInput, type StudentStage } from '../../lib/types'

interface Props {
  open: boolean
  /** Si viene, se edita; si no, se registra un nuevo congregado. */
  initial?: CongregadoInput
  onClose: () => void
  onSubmit: (values: CongregadoInput) => Promise<void>
}

export function MemberFormModal({ open, initial, onClose, onSubmit }: Props) {
  const editing = !!initial
  const [form, setForm] = useState<CongregadoInput>(EMPTY_MEMBER)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY_MEMBER)
      setError('')
    }
  }, [open, initial])

  const set = <K extends keyof CongregadoInput>(k: K, v: CongregadoInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const guardian = needsGuardian(form)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = validateMember(form)
    if (problem) return setError(problem)
    setSaving(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : (err as any)?.message || 'Error al guardar el congregado.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar congregado' : 'Registrar congregado'}
      description={editing ? undefined : 'Se generará su código QR de asistencia automáticamente.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="member-form" loading={saving}>
            {editing ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </>
      }
    >
      <form id="member-form" onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" required>
            {(id) => <Input id={id} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} autoComplete="off" required />}
          </Field>
          <Field label="Apellido" required>
            {(id) => <Input id={id} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} autoComplete="off" required />}
          </Field>
        </div>

        <Field label="Teléfono / WhatsApp">
          {(id) => (
            <Input id={id} type="tel" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Ej: 3794 123456" />
          )}
        </Field>

        <SwitchRow
          checked={form.is_student}
          onChange={(v) => set('is_student', v)}
          label="Es alumno formativo"
          description="Los alumnos se organizan por etapa y tienen seguimiento de clases."
        />

        {form.is_student && (
          <div className="space-y-5 rounded-xl border border-line p-4">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink">Etapa</p>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Etapa">
                {STAGES.map((stage: StudentStage) => (
                  <button
                    key={stage}
                    type="button"
                    role="radio"
                    aria-checked={form.student_stage === stage}
                    onClick={() => set('student_stage', stage)}
                    className={cn(
                      'cursor-pointer rounded-xl border px-2 py-2 text-center transition-colors',
                      form.student_stage === stage
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-line-strong text-ink-soft hover:bg-sunken',
                    )}
                  >
                    <span className="block text-sm font-bold">{STAGE_LABELS[stage]}</span>
                    <span className="block text-[11px] opacity-80">{STAGE_RANGES[stage]}</span>
                  </button>
                ))}
              </div>
            </div>

            {guardian && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tutor / responsable">
                  {(id) => <Input id={id} value={form.guardian_name} onChange={(e) => set('guardian_name', e.target.value)} />}
                </Field>
                <Field label="Teléfono del tutor">
                  {(id) => (
                    <Input id={id} type="tel" inputMode="tel" value={form.guardian_phone} onChange={(e) => set('guardian_phone', e.target.value)} />
                  )}
                </Field>
              </div>
            )}
          </div>
        )}

        {error && <Alert>{error}</Alert>}
      </form>
    </Modal>
  )
}

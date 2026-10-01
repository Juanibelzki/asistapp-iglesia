import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BadgeCheck, MapPin } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { listChurches, registerMember, type ChurchInfo, type Credential } from '../lib/registro'
import { EMPTY_MEMBER, needsGuardian } from '../lib/congregados'
import { STAGES, STAGE_LABELS, STAGE_RANGES, type CongregadoInput } from '../lib/types'
import { cn } from '../lib/cn'
import { CenteredLayout } from '../components/layout/CenteredLayout'
import { ChurchPicker } from '../components/registro/ChurchPicker'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Field, Input, SwitchRow } from '../components/ui/field'
import { Alert, Skeleton } from '../components/ui/feedback'

export const Route = createFileRoute('/registro')({
  head: () => ({ meta: [{ title: 'Auto-inscripción · Ecclesiahs' }] }),
  component: RegistroPage,
})

function RegistroPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [churches, setChurches] = useState<ChurchInfo[]>([])
  const [selected, setSelected] = useState<ChurchInfo | null>(null)
  const [locked, setLocked] = useState<ChurchInfo | null>(null)
  const [form, setForm] = useState<CongregadoInput>({ ...EMPTY_MEMBER, is_student: true })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [credential, setCredential] = useState<Credential | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const orgParam = new URLSearchParams(window.location.search).get('org')
        const list = await listChurches()
        if (!alive) return
        setChurches(list)
        if (orgParam) {
          const match = list.find((c) => c.id === orgParam)
          if (match) {
            setLocked(match)
            setSelected(match)
          } else setError('La iglesia indicada no fue encontrada. Seleccioná otra o registrala.')
        }
      } catch (err) {
        console.error('Error al cargar iglesias:', err)
        if (alive) setError('No se pudo cargar la lista de iglesias. Intentá nuevamente.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const set = <K extends keyof CongregadoInput>(k: K, v: CongregadoInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const guardian = needsGuardian(form)
  const church = selected

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!church) return setError('Seleccioná tu iglesia / congregación para continuar.')
    if (!form.first_name.trim() || !form.last_name.trim()) return setError('Nombre y apellido son obligatorios.')
    if (!form.phone.trim()) return setError('El teléfono es obligatorio para acceder a tu credencial.')
    if (guardian && !form.guardian_name.trim()) return setError('Para menores de edad, el nombre del tutor es obligatorio.')

    setSubmitting(true)
    setError('')
    try {
      setCredential(await registerMember(church.id, form))
    } catch (err) {
      console.error('Error al inscribirse:', err)
      setError(err instanceof Error ? err.message : (err as any)?.message || 'Error al guardar tu inscripción. Intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CenteredLayout>
      {/* Cabecera de la iglesia */}
      <div className="mb-6 flex flex-col items-center text-center">
        {church?.logo_url ? (
          <img src={church.logo_url} alt="Logo de la iglesia" className="h-16 w-16 rounded-2xl border border-line bg-surface object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent font-display text-2xl font-extrabold text-accent-ink">
            {church ? church.name.charAt(0).toUpperCase() : '✝'}
          </span>
        )}
        <p className="mt-4 text-sm font-semibold text-primary">Auto-inscripción</p>
        <h1 className="font-display text-2xl font-extrabold text-ink">{church?.name || 'Seleccioná tu iglesia'}</h1>
        {church?.motto && <p className="mt-1 text-sm text-ink-soft">{church.motto}</p>}
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        ) : credential ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success">
              <BadgeCheck className="h-7 w-7" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">¡Inscripción exitosa!</h2>
              <p className="mt-1 text-sm text-ink-soft">Tu credencial digital está lista.</p>
              <p className="mt-2 font-semibold text-ink">{credential.name}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <QRCodeSVG value={JSON.stringify(credential)} size={190} level="M" />
            </div>
            <Button size="lg" className="w-full" onClick={() => navigate({ to: '/portal' })}>
              Guardar / descargar QR
            </Button>
            <p className="text-xs text-ink-faint">Mostrá este código en la entrada o guardá una captura de pantalla.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {locked ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-soft px-4 py-3">
                <MapPin className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Iglesia confirmada</p>
                  <p className="truncate text-sm font-semibold text-ink">{locked.name}</p>
                  {locked.address && <p className="truncate text-xs text-ink-soft">{locked.address}</p>}
                </div>
              </div>
            ) : (
              <Field label="Tu iglesia / congregación" required>
                {(id) => <ChurchPicker id={id} churches={churches} selected={selected} onSelect={setSelected} />}
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" required>
                {(id) => <Input id={id} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="Ej: María" autoComplete="given-name" required />}
              </Field>
              <Field label="Apellido" required>
                {(id) => <Input id={id} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Ej: García" autoComplete="family-name" required />}
              </Field>
            </div>

            <Field label="Teléfono / WhatsApp" required hint="Con este número vas a poder recuperar tu credencial.">
              {(id) => <Input id={id} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Ej: 3794 123456" required />}
            </Field>

            <SwitchRow
              checked={form.is_student}
              onChange={(v) => set('is_student', v)}
              label="¿Te inscribís a un curso formativo?"
              description="Ej: escuela bíblica, clases o discipulado."
            />

            {form.is_student && (
              <div className="space-y-5 rounded-xl border border-line p-4">
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-ink">Etapa formativa</p>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Etapa formativa">
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={form.student_stage === s}
                        onClick={() => set('student_stage', s)}
                        className={cn(
                          'cursor-pointer rounded-xl border px-2 py-2 text-center transition-colors',
                          form.student_stage === s ? 'border-primary bg-primary-soft text-primary' : 'border-line-strong text-ink-soft hover:bg-sunken',
                        )}
                      >
                        <span className="block text-sm font-bold">{STAGE_LABELS[s]}</span>
                        <span className="block text-[11px] opacity-80">{STAGE_RANGES[s]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {guardian && (
                  <>
                    <Field label="Tutor / responsable" required>
                      {(id) => <Input id={id} value={form.guardian_name} onChange={(e) => set('guardian_name', e.target.value)} placeholder="Ej: Ana Fernández" />}
                    </Field>
                    <Field label="Teléfono del tutor">
                      {(id) => <Input id={id} type="tel" inputMode="tel" value={form.guardian_phone} onChange={(e) => set('guardian_phone', e.target.value)} placeholder="Ej: 3794 123456" />}
                    </Field>
                  </>
                )}
              </div>
            )}

            {error && <Alert>{error}</Alert>}

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              {submitting ? 'Inscribiendo…' : 'Inscribirme'}
            </Button>
          </form>
        )}
      </Card>

      {!credential && (
        <div className="mt-6 space-y-2 text-center text-sm text-ink-soft">
          <p>
            ¿Ya te inscribiste?{' '}
            <Link to="/portal" className="font-semibold text-primary hover:underline">
              Ver mi credencial
            </Link>
          </p>
          {!locked && (
            <p>
              ¿Sos pastor o líder y querés registrar tu iglesia?{' '}
              <Link to="/registerCongregacion" className="font-semibold text-primary hover:underline">
                Crear congregación aquí
              </Link>
            </p>
          )}
        </div>
      )}
    </CenteredLayout>
  )
}

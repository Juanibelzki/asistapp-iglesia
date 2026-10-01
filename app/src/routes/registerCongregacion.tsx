import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, Copy, PartyPopper } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { useCopy } from '../lib/hooks'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button, LinkButton } from '../components/ui/button'
import { Field, Input } from '../components/ui/field'
import { Alert } from '../components/ui/feedback'

export const Route = createFileRoute('/registerCongregacion')({
  head: () => ({ meta: [{ title: 'Registrar mi iglesia · Ecclesiahs' }] }),
  component: RegisterCongregacionPage,
})

interface OrgForm {
  name: string
  cityProvince: string
  address: string
  pastorName: string
  phone: string
}

const EMPTY_FORM: OrgForm = { name: '', cityProvince: '', address: '', pastorName: '', phone: '' }

function RegisterCongregacionPage() {
  const [form, setForm] = useState<OrgForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null)
  const { copied, copy } = useCopy()

  const set = <K extends keyof OrgForm>(k: K, v: OrgForm[K]) => setForm((f) => ({ ...f, [k]: v }))
  const link = created && typeof window !== 'undefined' ? `${window.location.origin}/registro?org=${created.id}` : ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.cityProvince.trim() || !form.pastorName.trim() || !form.phone.trim()) {
      setError('Completá los campos obligatorios para continuar.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const base = { name: form.name.trim(), address: form.address.trim() || null, phone: form.phone.trim() }

      let result = await supabase
        .from('organizations')
        .insert({ ...base, city: form.cityProvince.trim() || null, pastor_name: form.pastorName.trim() || null })
        .select('id, name')
        .single()

      // Columnas opcionales inexistentes en la BD real → reintentar con las básicas
      if (result.error && (result.error.code === '42703' || result.error.code === 'PGRST204')) {
        result = await supabase.from('organizations').insert(base).select('id, name').single()
      }
      if (result.error) throw result.error

      setCreated(result.data as { id: string; name: string })
    } catch (err) {
      console.error('Error al registrar la congregación:', err)
      const msg = err instanceof Error ? err.message : (err as any)?.message || 'Error al registrar la congregación.'
      setError(
        /row-level security/i.test(msg)
          ? 'Aún no se habilitaron los permisos para registrar congregaciones. Contactá al administrador de Ecclesiahs para activar esta función.'
          : msg,
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <AuthLayout title="¡Congregación registrada!" width="md">
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-2xl bg-success-soft p-4 text-success">
            <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm font-medium">
              <strong>{created.name}</strong> ya está en Ecclesiahs. Compartí el enlace de auto-inscripción con tus miembros para que
              generen su credencial con código QR.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <QRCodeSVG value={link} size={150} level="M" />
            </div>
          </div>

          <Field label="Enlace de auto-inscripción (único para tu iglesia)" hint="Enviálo por WhatsApp o email a cada miembro.">
            {(id) => (
              <div className="flex gap-2">
                <Input id={id} readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="text-sm" />
                <Button
                  onClick={() => copy(link)}
                  variant={copied ? 'secondary' : 'primary'}
                  className="shrink-0"
                  leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                >
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            )}
          </Field>

          <LinkButton to="/asistencia" size="lg" className="w-full">
            Ir al panel de asistencia
          </LinkButton>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      width="md"
      title="Registrá tu congregación"
      subtitle="Dá de alta tu iglesia y obtené tu enlace único de auto-inscripción para miembros."
      footer={
        <p>
          ¿Sos miembro y querés inscribirte?{' '}
          <Link to="/registro" className="font-semibold text-primary hover:underline">
            Auto-inscripción aquí
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Nombre de la congregación / iglesia" required>
          {(id) => <Input id={id} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Iglesia Vida Nueva" autoFocus required />}
        </Field>
        <Field label="Ciudad y provincia" required>
          {(id) => <Input id={id} value={form.cityProvince} onChange={(e) => set('cityProvince', e.target.value)} placeholder="Ej: Corrientes, Corrientes" required />}
        </Field>
        <Field label="Dirección de la sede principal">
          {(id) => <Input id={id} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Ej: Av. Costanera 1234" />}
        </Field>
        <Field label="Pastor o administrador responsable" required>
          {(id) => <Input id={id} value={form.pastorName} onChange={(e) => set('pastorName', e.target.value)} placeholder="Ej: Pastor Juan Pérez" required />}
        </Field>
        <Field label="Teléfono / WhatsApp de contacto" required hint="Lo usaremos solo para contactarte por dudas sobre tu cuenta.">
          {(id) => <Input id={id} type="tel" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Ej: 3794 123456" required />}
        </Field>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {submitting ? 'Registrando…' : 'Registrar congregación'}
        </Button>
      </form>
    </AuthLayout>
  )
}

import { useState } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { loginWithPin } from '../lib/login'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/button'
import { Field, Input } from '../components/ui/field'
import { Alert } from '../components/ui/feedback'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Ingresar · Ecclesiahs' }] }),
  component: Login,
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) throw redirect({ to: '/dashboard' })
  },
})

function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const res = await loginWithPin(phone, pin)
    setSubmitting(false)
    if (res.ok) navigate({ to: res.destination })
    else setError(res.error)
  }

  return (
    <AuthLayout
      title="Te damos la bienvenida"
      subtitle="Ingresá con tu teléfono y el PIN de 4 dígitos de tu equipo."
      footer={
        <>
          <p>
            ¿Sos miembro de la congregación?{' '}
            <Link to="/portal" className="font-semibold text-primary hover:underline">
              Ver mi credencial QR
            </Link>
          </p>
          <p>
            ¿Tu iglesia aún no está registrada?{' '}
            <Link to="/registerCongregacion" className="font-semibold text-primary hover:underline">
              Crear congregación
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && <Alert>{error}</Alert>}

        <Field label="Teléfono / WhatsApp" required>
          {(id) => (
            <Input
              id={id}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 3794 123456"
              autoFocus
              required
            />
          )}
        </Field>

        <Field label="PIN de 4 dígitos" required>
          {(id) => (
            <div className="relative">
              <Input
                id={id}
                name="pin"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="pr-11 font-mono tracking-[0.5em]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-faint hover:bg-sunken hover:text-ink"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {submitting ? 'Ingresando…' : (
            <>
              Ingresar <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}

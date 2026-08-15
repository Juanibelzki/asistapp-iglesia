import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

const USER_SESSION_KEY = 'asistapp_user_session'
const STAFF_SESSION_KEY = 'asistapp_staff_session'

function Login() {
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const navigate = useNavigate()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const cleanPhone = phone.replace(/\D/g, '').trim()
    const cleanPin = pin.trim()
    if (!cleanPhone) {
      setErrorMsg('Ingresá tu número de teléfono / WhatsApp.')
      return
    }
    if (!/^\d{4}$/.test(cleanPin)) {
      setErrorMsg('El PIN debe tener exactamente 4 dígitos.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, organization_id, role, full_name, phone, organizations(name)')
        .eq('phone', cleanPhone)
        .eq('pin', cleanPin)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error al consultar profiles en login:', error)
        setErrorMsg('Error al conectar con el servidor. Revisá los permisos de la base de datos.')
        return
      }

      if (!data) {
        setErrorMsg('Teléfono o PIN incorrectos. Si no tenés cuenta, registrate con tu iglesia.')
        return
      }

      const session = {
        id: data.id,
        organization_id: data.organization_id,
        role: data.role,
        full_name: data.full_name,
        phone: data.phone,
        church_name: (data.organizations as any)?.name || '',
      }
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session))

      const role = data.role || 'staff'
      if (role === 'admin') {
        navigate({ to: '/dashboard' })
      } else {
        localStorage.setItem(
          STAFF_SESSION_KEY,
          JSON.stringify({
            organization_id: data.organization_id,
            full_name: data.full_name,
            role,
            pin,
            church_name: (data.organizations as any)?.name || '',
          }),
        )
        navigate({ to: '/asistencia' })
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      setErrorMsg('No se pudo iniciar sesión. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600'

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <form
        onSubmit={login}
        className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xl mb-4 shadow-lg shadow-emerald-500/20">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ingresar</h1>
          <p className="text-sm text-zinc-400 mt-1">Accedé con tu teléfono y PIN de equipo</p>
        </div>

        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <input
          name="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Teléfono / WhatsApp"
          className={`${inputClass} mb-4`}
          autoFocus
          required
        />
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="PIN de 4 dígitos"
          className={`${inputClass} mb-6 text-center tracking-[0.6em] font-mono`}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
              Ingresando...
            </>
          ) : (
            'Ingresar'
          )}
        </button>

        <div className="mt-6 space-y-3 text-sm text-zinc-400 text-center">
          <p>
            ¿Sos miembro de la congregación?{' '}
            <Link to="/portal" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Acceder a mi Credencial QR →
            </Link>
          </p>
          <p>
            ¿Tu iglesia no está registrada?{' '}
            <Link to="/registerCongregacion" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Crear Congregación →
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
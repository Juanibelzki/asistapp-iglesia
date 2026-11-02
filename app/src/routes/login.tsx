import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AppLogo } from '../components/AppLogo'
import { isStaffRole, LoginError, loginWithPin, resolveCurrentProfile } from '../lib/session'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const navigate = useNavigate()

  // Si el dispositivo ya tiene una sesión válida, ir directo a su pantalla.
  useEffect(() => {
    resolveCurrentProfile().then((me) => {
      if (me) navigate({ to: isStaffRole(me.role) ? '/asistencia' : '/dashboard' })
    })
  }, [navigate])

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
      const me = await loginWithPin(cleanPhone, cleanPin)
      navigate({ to: isStaffRole(me.role) ? '/asistencia' : '/dashboard' })
    } catch (err) {
      if (err instanceof LoginError && err.code !== 'network') {
        setErrorMsg(err.message)
      } else {
        console.error('Error al iniciar sesión:', err)
        setErrorMsg('No se pudo iniciar sesión. Verificá tu conexión e intentá de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-[#0B0F17] border border-slate-700 text-white text-base focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all placeholder:text-zinc-600'

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center px-4 sm:px-6">
      <form
        onSubmit={login}
        className="bg-[#141C2B] border border-slate-700/50 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0B0F17]/80 border border-slate-700/60 p-2 shadow-inner">
            <AppLogo className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bienvenido a Ecclesiahs</h1>
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
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
              Ingresando...
            </>
          ) : (
            'Ingresar'
          )}
        </button>

        <div className="mt-6 space-y-3 text-sm text-zinc-400 text-center">
          <p>
            ¿Sos miembro de la congregación?{' '}
            <Link to="/portal" className="text-yellow-500 hover:text-yellow-400 font-semibold">
              Acceder a mi Credencial QR →
            </Link>
          </p>
          <p>
            ¿Tu iglesia no está registrada?{' '}
            <Link to="/registerCongregacion" className="text-yellow-500 hover:text-yellow-400 font-semibold">
              Crear Congregación →
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
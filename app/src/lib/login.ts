import { supabase } from './supabase'
import { STAFF_SESSION_KEY, USER_SESSION_KEY } from './session'

export type LoginResult =
  | { ok: true; destination: '/dashboard' | '/asistencia' }
  | { ok: false; error: string }

const normalize = (s?: string | null) => (s || '').replace(/\D/g, '')

/** Login por teléfono + PIN de 4 dígitos contra `profiles`. */
export async function loginWithPin(phoneInput: string, pinInput: string): Promise<LoginResult> {
  const phone = normalize(phoneInput)
  const pin = pinInput.trim()
  if (!phone) return { ok: false, error: 'Ingresá tu número de teléfono / WhatsApp.' }
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'El PIN debe tener exactamente 4 dígitos.' }

  try {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .eq('pin', pin)
      .limit(1)
      .maybeSingle()

    if (error) return { ok: false, error: error.message || 'Error al conectar con la base de datos' }

    // Coincidencia flexible (con/sin código de país, 0, 15, etc.)
    if (!data && phone.length >= 8) {
      const { data: candidates, error: flexError } = await supabase
        .from('profiles')
        .select('*')
        .eq('pin', pin)
        .not('phone', 'is', null)
        .limit(20)
      if (flexError) return { ok: false, error: flexError.message || 'Error al conectar con la base de datos' }

      data =
        (candidates || []).find((c) => {
          const stored = normalize(c.phone)
          return (
            !!stored &&
            (stored === phone ||
              stored.endsWith(phone) ||
              phone.endsWith(stored) ||
              stored.slice(-8) === phone.slice(-8))
          )
        }) ?? null
    }

    if (!data) return { ok: false, error: 'Teléfono o PIN incorrectos.' }

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(data))

    const role = (data.role || '').toLowerCase()
    if (role === 'staff' || role === 'usher' || role === 'ujier') {
      localStorage.setItem(
        STAFF_SESSION_KEY,
        JSON.stringify({
          organization_id: data.organization_id,
          full_name: data.full_name,
          role: data.role || 'staff',
          pin,
          church_name: '',
        }),
      )
      return { ok: true, destination: '/asistencia' }
    }
    return { ok: true, destination: '/dashboard' }
  } catch (err) {
    console.error('Error al iniciar sesión:', err)
    return { ok: false, error: 'No se pudo iniciar sesión. Verificá tu conexión e intentá de nuevo.' }
  }
}

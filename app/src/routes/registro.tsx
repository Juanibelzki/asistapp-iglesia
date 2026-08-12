import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/registro')({
  component: Registro,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function Registro() {
  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const { email, password, full_name, org_name } = Object.fromEntries(new FormData(form))
    
    // 1. Registro Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email as string,
      password: password as string,
    })
    if (authError) return alert(authError.message)
    if (!authData.user) return

    // 2. Crear Organización
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: org_name as string })
      .select()
      .single()
    if (orgError) return alert(orgError.message)

    // 3. Crear Perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ 
        organization_id: org.id,
        auth_user_id: authData.user.id,
        full_name: full_name as string,
        email: email as string,
        role: 'admin'
      })
    if (profileError) return alert(profileError.message)

    window.location.href = '/dashboard'
  }

  return (
    <div className="demo-center">
      <form onSubmit={registrar} className="demo-panel w-full max-w-sm">
        <h1 className="demo-title mb-6">Registro</h1>
        <input name="full_name" placeholder="Nombre completo" className="demo-input mb-4" required />
        <input name="email" type="email" placeholder="Email" className="demo-input mb-4" required />
        <input name="password" type="password" placeholder="Contraseña" className="demo-input mb-4" required />
        <input name="org_name" placeholder="Nombre de tu iglesia" className="demo-input mb-4" required />
        <button type="submit" className="demo-button w-full">Crear cuenta</button>
      </form>
    </div>
  )
}

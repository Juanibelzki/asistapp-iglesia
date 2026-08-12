import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { SocialButtons } from '../components/SocialButtons'

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <form onSubmit={registrar} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">Registro</h1>
        <input name="full_name" placeholder="Nombre completo" className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white mb-4 focus:outline-none focus:border-emerald-500" required />
        <input name="email" type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white mb-4 focus:outline-none focus:border-emerald-500" required />
        <input name="password" type="password" placeholder="Contraseña" className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white mb-4 focus:outline-none focus:border-emerald-500" required />
        <input name="org_name" placeholder="Nombre de tu iglesia" className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white mb-6 focus:outline-none focus:border-emerald-500" required />
        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl transition-all active:scale-95">Crear cuenta</button>
        <SocialButtons />
        <div className="text-center mt-6 text-sm text-zinc-400">
          ¿Ya tienes cuenta? <Link to="/login" className="text-emerald-400 hover:underline">Inicia Sesión</Link>
        </div>
      </form>
    </div>
  )
}


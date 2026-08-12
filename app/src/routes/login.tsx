import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { SocialButtons } from '../components/SocialButtons'

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function Login() {
  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const { email, password } = Object.fromEntries(new FormData(form))
    const { error } = await supabase.auth.signInWithPassword({
      email: email as string,
      password: password as string,
    })
    if (error) alert(error.message)
    else window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <form onSubmit={login} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">Iniciar sesión</h1>
        <input name="email" type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white mb-4 focus:outline-none focus:border-emerald-500" required />
        <input name="password" type="password" placeholder="Contraseña" className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white mb-6 focus:outline-none focus:border-emerald-500" required />
        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl transition-all active:scale-95">Entrar</button>
        <SocialButtons />
        <div className="text-center mt-6 text-sm text-zinc-400">
          ¿No tienes cuenta? <Link to="/registro" className="text-emerald-400 hover:underline">Regístrate</Link>
        </div>
      </form>
    </div>
  )
}

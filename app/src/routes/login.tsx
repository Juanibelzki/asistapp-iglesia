import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

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
    <div className="demo-center">
      <form onSubmit={login} className="demo-panel w-full max-w-sm">
        <h1 className="demo-title mb-6">Iniciar sesión</h1>
        <input name="email" type="email" placeholder="Email" className="demo-input mb-4" required />
        <input name="password" type="password" placeholder="Contraseña" className="demo-input mb-4" required />
        <button type="submit" className="demo-button w-full">Entrar</button>
      </form>
    </div>
  )
}

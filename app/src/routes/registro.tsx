import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { SocialButtons } from '../components/SocialButtons'
import { useState } from 'react'

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
  const [errorMsg, setErrorMsg] = useState('')

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const form = e.target as HTMLFormElement
    const { email, password, full_name, org_name } = Object.fromEntries(new FormData(form))

    const emailStr = email as string
    const fullName = full_name as string
    const churchName = org_name as string

    if (!emailStr || !password || !fullName || !churchName) {
      setErrorMsg('Por favor completa todos los campos.')
      return
    }
    
    // 1. Registro Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailStr,
      password: password as string,
    })
    if (authError) {
      setErrorMsg(authError.message)
      return
    }
    if (!authData.user) return
    
    // 2. RPC para registrar iglesia y perfil de manera atómica
    const { error: rpcError } = await supabase.rpc('register_church_admin', {
      p_auth_user_id: authData.user.id,
      p_full_name: fullName,
      p_email: emailStr,
      p_church_name: churchName,
    })

    if (rpcError) {
      setErrorMsg(rpcError.message)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <form onSubmit={registrar} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">Registro</h1>
        
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm">
            {errorMsg}
          </div>
        )}

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

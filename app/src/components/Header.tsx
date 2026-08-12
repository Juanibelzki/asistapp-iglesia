import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Header() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline sm:px-4 sm:py-2"
          >
            AsistApp
          </Link>
        </h2>

        {user && (
          <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
            <Link to="/dashboard" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>Dashboard</Link>
            <Link to="/ninos" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>Niños</Link>
            <Link to="/eventos" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>Eventos</Link>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <button onClick={logout} className="demo-button demo-button-secondary text-xs">Cerrar sesión</button>
          ) : (
            <>
              <Link to="/login" className="demo-button demo-button-secondary text-xs">Login</Link>
              <Link to="/registro" className="demo-button text-xs">Registro</Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}

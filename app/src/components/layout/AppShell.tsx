import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { BookOpen, CalendarCheck, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react'
import { useOrg } from '../../lib/org'
import { initials } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Logo, LogoMark } from '../brand/Logo'
import { Skeleton } from '../ui/feedback'
import { ThemeToggle } from './ThemeToggle'

const NAV = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/congregados', label: 'Congregados', icon: Users },
  { to: '/asistencia', label: 'Asistencia', icon: CalendarCheck },
  { to: '/materiales', label: 'Materiales', icon: BookOpen },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
] as const

/** Layout de la zona autenticada: sidebar en desktop, barra inferior en móvil. */
export function AppShell({ children }: { children: ReactNode }) {
  const { churchName, fullName, signOut } = useOrg()

  return (
    <div className="min-h-dvh lg:pl-68">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-6 pt-6 pb-5">
          <Logo />
        </div>

        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-sunken p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-lg font-extrabold text-accent-ink">
            {churchName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{churchName}</p>
            <p className="truncate text-xs text-ink-faint">Mi congregación</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4" aria-label="Principal">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
              activeProps={{ className: 'bg-primary-soft !text-primary hover:!bg-primary-soft' }}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
              {initials(fullName)}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{fullName}</p>
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <LogoMark className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-ink">{churchName}</p>
            <p className="truncate text-xs text-ink-faint">{fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={signOut}
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-ink-soft hover:bg-danger-soft hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10 lg:pb-12">{children}</main>

      {/* Tab bar (móvil) */}
      <nav
        aria-label="Principal"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-lg lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-ink-faint transition-colors',
                )}
                activeProps={{ className: '!text-primary' }}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/** Esqueleto del shell mientras se resuelve la sesión (y durante SSR). */
export function AppShellSkeleton() {
  return (
    <div className="min-h-dvh lg:pl-68" aria-busy="true">
      <aside className="fixed inset-y-0 left-0 hidden w-68 border-r border-line bg-surface p-6 lg:block">
        <Logo asLink={false} />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </aside>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

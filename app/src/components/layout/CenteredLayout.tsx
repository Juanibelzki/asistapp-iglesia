import type { ReactNode } from 'react'
import { Logo } from '../brand/Logo'
import { ThemeToggle } from './ThemeToggle'

/** Layout centrado, optimizado para móvil (auto-inscripción de miembros). */
export function CenteredLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary-soft to-transparent" />
      <header className="relative flex items-center justify-between px-5 py-4 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="relative mx-auto w-full max-w-md flex-1 px-4 pb-12 pt-2 sm:px-0">{children}</main>
    </div>
  )
}

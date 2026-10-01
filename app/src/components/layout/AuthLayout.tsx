import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, QrCode, ShieldCheck, WifiOff } from 'lucide-react'
import { Logo } from '../brand/Logo'
import { ThemeToggle } from './ThemeToggle'

const POINTS = [
  { icon: QrCode, text: 'Asistencia en segundos con código QR' },
  { icon: WifiOff, text: 'Funciona aunque se caiga la señal del templo' },
  { icon: ShieldCheck, text: 'Datos de tu congregación siempre protegidos' },
]

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  /** Ancho del formulario. */
  width?: 'sm' | 'md'
}

/** Layout dividido para login / registros: panel de marca + formulario. */
export function AuthLayout({ title, subtitle, children, footer, width = 'sm' }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-ink lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-24 h-[28rem] w-72 rounded-t-full border-[3px] border-primary-ink/15" />
          <div className="absolute -right-10 top-44 h-[24rem] w-56 rounded-t-full border-[3px] border-primary-ink/20" />
          <div className="absolute right-4 top-64 h-[20rem] w-40 rounded-t-full bg-primary-ink/10" />
          <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
        </div>

        <Link to="/" className="relative inline-flex w-fit items-center gap-2.5" aria-label="Ecclesiahs — inicio">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-ink text-primary">
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
              <path d="M9.5 24.5V14.2a6.5 6.5 0 0 1 13 0v10.3z" fill="currentColor" />
              <path d="M12.8 18.4l2.5 2.5 4.2-4.9" fill="none" stroke="var(--primary-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-xl font-extrabold">Ecclesiahs</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-[1.1] xl:text-5xl">
            Menos planillas.
            <br />
            Más tiempo para las personas.
          </h2>
          <ul className="mt-10 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px] font-medium text-primary-ink/90">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-ink/12">
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-ink/60">© {new Date().getFullYear()} Ecclesiahs</p>
      </aside>

      {/* Formulario */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            to="/"
            className="hidden items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink lg:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Volver al inicio
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className={width === 'sm' ? 'w-full max-w-sm' : 'w-full max-w-md'}>
            <div className="mb-8">
              <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
              {subtitle && <p className="mt-2 text-[15px] text-ink-soft">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-8 space-y-2 text-center text-sm text-ink-soft">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}

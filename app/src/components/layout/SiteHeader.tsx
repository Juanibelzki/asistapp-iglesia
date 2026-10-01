import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { Logo } from '../brand/Logo'
import { LinkButton } from '../ui/button'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { href: '/#funciones', label: 'Funciones' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#precios', label: 'Precios' },
  { href: '/#preguntas', label: 'Preguntas' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Logo />

        <nav aria-label="Secciones" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-1.5 sm:flex">
            <LinkButton to="/login" variant="ghost" size="sm">
              Ingresar
            </LinkButton>
            <LinkButton to="/registerCongregacion" size="sm">
              Registrar mi iglesia
            </LinkButton>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-ink hover:bg-sunken md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade border-t border-line bg-canvas px-5 pb-5 pt-2 md:hidden">
          <nav aria-label="Secciones móvil" className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-semibold text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/login" className="flex h-11 items-center justify-center rounded-xl border border-line-strong text-sm font-semibold text-ink">
              Ingresar
            </Link>
            <LinkButton to="/registerCongregacion">Registrar iglesia</LinkButton>
          </div>
        </div>
      )}
    </header>
  )
}

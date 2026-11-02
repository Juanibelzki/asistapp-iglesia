import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { AppLogo } from '../AppLogo'

const LINKS = [
  { href: '#producto', label: 'Producto' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#funciones', label: 'Funciones' },
  { href: '#planes', label: 'Planes' },
]

export function LandingNav() {
  const { scrollY, scrollYProgress } = useScroll()
  const [solid, setSolid] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 40))

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-rojo"
        aria-hidden="true"
      />
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border py-2 pl-3 pr-2 transition-all duration-500 ${
          solid
            ? 'border-white/10 bg-marino-deep/80 shadow-2xl shadow-black/30 backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5" aria-label="Ecclesiahs">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white p-1">
            <AppLogo className="h-full w-full object-contain" />
          </span>
          <span className="hidden font-display text-xl tracking-tight text-white sm:inline">Ecclesiahs</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Link to="/login" className="rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:text-white">
            Ingresar
          </Link>
          <Link
            to="/registerCongregacion"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-marino transition-colors hover:bg-rojo hover:text-white"
          >
            Empezar gratis
          </Link>
        </div>
      </nav>
    </header>
  )
}

import { Link } from '@tanstack/react-router'
import { AppLogo } from '../AppLogo'

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-marino-deep text-white/60">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white p-1">
                <AppLogo className="h-full w-full object-contain" />
              </span>
              <span className="font-display text-xl text-white">Ecclesiahs</span>
            </div>
            <p className="mt-4 text-sm">Asistencia, membresía y pastoreo para iglesias, en un solo lugar.</p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div className="space-y-3">
              <p className="font-chart text-[10px] uppercase tracking-[0.25em] text-white/40">Producto</p>
              <a href="#como-funciona" className="block hover:text-white">Cómo funciona</a>
              <a href="#funciones" className="block hover:text-white">Funciones</a>
              <a href="#planes" className="block hover:text-white">Planes</a>
            </div>
            <div className="space-y-3">
              <p className="font-chart text-[10px] uppercase tracking-[0.25em] text-white/40">Acceso</p>
              <Link to="/login" className="block hover:text-white">Ingresar</Link>
              <Link to="/registerCongregacion" className="block hover:text-white">Registrar iglesia</Link>
              <Link to="/portal" className="block hover:text-white">Mi credencial</Link>
            </div>
            <div className="space-y-3">
              <p className="font-chart text-[10px] uppercase tracking-[0.25em] text-white/40">Legal</p>
              <Link to="/terminos" className="block hover:text-white">Términos</Link>
              <Link to="/privacidad" className="block hover:text-white">Privacidad</Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Ecclesiahs. Todos los derechos reservados.</p>
          <p>
            Desarrollado por <span className="text-white/70">Juan Ignacio Belzki</span> ·{' '}
            <a href="mailto:juanignaciobelzki20@gmail.com" className="hover:text-white">
              juanignaciobelzki20@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

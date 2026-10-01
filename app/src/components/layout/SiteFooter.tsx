import { Link } from '@tanstack/react-router'
import { Logo } from '../brand/Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Asistencia por QR, membresía y gestión formativa para iglesias. Hecho para que tu equipo se dedique a las personas.
            </p>
          </div>

          <nav aria-label="Producto">
            <p className="mb-3 text-sm font-bold text-ink">Producto</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li><a className="hover:text-ink" href="/#funciones">Funciones</a></li>
              <li><a className="hover:text-ink" href="/#precios">Precios</a></li>
              <li><Link className="hover:text-ink" to="/portal">Soy miembro · Mi credencial</Link></li>
              <li><Link className="hover:text-ink" to="/login">Ingresar</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="mb-3 text-sm font-bold text-ink">Compañía</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li><Link className="hover:text-ink" to="/about">Sobre Ecclesiahs</Link></li>
              <li><Link className="hover:text-ink" to="/terminos">Términos y condiciones</Link></li>
              <li><Link className="hover:text-ink" to="/privacidad">Política de privacidad</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ecclesiahs. Todos los derechos reservados.</p>
          <p>
            Desarrollado por <span className="font-semibold text-ink-soft">Juan Ignacio Belzki</span> ·{' '}
            <a className="underline hover:text-ink" href="mailto:juanignaciobelzki20@gmail.com">
              juanignaciobelzki20@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

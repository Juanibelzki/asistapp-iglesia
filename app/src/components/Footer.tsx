import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="bg-slate-900/80 border-t border-white/10 text-white/70 py-6 text-center text-sm">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4">
        <div className="space-y-1">
          <p>
            Desarrollado por <span className="font-semibold text-white">Juan Ignacio Belzki</span>
          </p>
          <p className="text-xs text-white/50">Desarrollo de Software & Soluciones Web</p>
          <p>
            <a
              href="mailto:juanignaciobelzki20@gmail.com"
              className="hover:text-emerald-400 underline transition-colors"
            >
              juanignaciobelzki20@gmail.com
            </a>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/terminos" className="hover:text-white transition-colors">
            Términos y Condiciones
          </Link>
          <Link to="/privacidad" className="hover:text-white transition-colors">
            Política de Privacidad
          </Link>
        </div>
        <p className="text-xs text-white/40">&copy; 2026 AsistApp. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
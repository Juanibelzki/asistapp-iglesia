import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; 2026 AsistApp. Todos los derechos reservados.
        </p>
        <div className="flex gap-4">
          <Link to="/privacidad" className="nav-link text-sm">Privacidad</Link>
        </div>
      </div>
    </footer>
  )
}

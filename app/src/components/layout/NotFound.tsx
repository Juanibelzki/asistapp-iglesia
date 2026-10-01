import { SearchX } from 'lucide-react'
import { Logo } from '../brand/Logo'
import { LinkButton } from '../ui/button'

export function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo className="mb-12" />
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-soft text-warning">
        <SearchX className="h-8 w-8" aria-hidden />
      </div>
      <p className="font-display text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">No encontramos esta página</h1>
      <p className="mt-2 max-w-sm text-ink-soft">Es posible que el enlace haya cambiado o ya no exista.</p>
      <div className="mt-8 flex gap-3">
        <LinkButton to="/">Ir al inicio</LinkButton>
        <LinkButton to="/dashboard" variant="secondary">
          Ir al panel
        </LinkButton>
      </div>
    </div>
  )
}

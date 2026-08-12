import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="demo-page">
      <h1 className="demo-title mb-6">AsistApp Iglesia</h1>
      <p className="text-xl text-[var(--sea-ink-soft)] mb-10 max-w-2xl">
        Plataforma SaaS para el registro rápido de asistencia con código QR, gestión de niños y seguridad en iglesias.
      </p>
      <div className="flex gap-4">
        <Link to="/registro" className="demo-button">Registrar mi iglesia</Link>
        <Link to="/login" className="demo-button demo-button-secondary">Acceder</Link>
      </div>
    </div>
  )
}

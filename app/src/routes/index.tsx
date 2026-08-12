import { createFileRoute, Link } from '@tanstack/react-router'
import ThemeToggle from '../components/ThemeToggle'
import { QrCode, ShieldCheck, WifiOff, LayoutDashboard } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function FeatureCard({ title, description, icon: Icon }: { title: string, description: string, icon: any }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center">
      <div className="bg-zinc-800 p-3 rounded-full mb-4">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm">{description}</p>
    </div>
  )
}

function Home() {
  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">AsistApp</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-zinc-300 hover:text-white">Iniciar Sesión</Link>
            <Link to="/registro" className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200">Registro</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Gestión de asistencia y seguridad infantil para tu iglesia, sin complicaciones.
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Registra niños, controla ingresos con código QR y gestiona el equipo escolar dominical en tiempo real.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/registro" className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-emerald-400">Comenzar Prueba Gratis</Link>
          <Link to="/login" className="bg-zinc-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-zinc-700">Iniciar Sesión</Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard title="Escáner QR Rápido" description="Control de entrada/salida eficiente." icon={QrCode} />
          <FeatureCard title="Seguridad y RLS" description="Protección de datos de tutores y niños." icon={ShieldCheck} />
          <FeatureCard title="Modo Offline PWA" description="Toma asistencia sin conexión." icon={WifiOff} />
          <FeatureCard title="Dashboard Pastoral" description="Métricas de crecimiento y ausentismo." icon={LayoutDashboard} />
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4">Plan Iglesia</h2>
          <p className="text-5xl font-bold mb-6">$9<span className="text-xl text-zinc-500 font-normal">/mes</span></p>
          <Link to="/registro" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 block w-full">Suscribirse</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
        <p>© 2026 AsistApp. Todos los derechos reservados.</p>
        <Link to="/privacidad" className="hover:text-white">Política de Privacidad</Link>
      </footer>
    </div>
  )
}

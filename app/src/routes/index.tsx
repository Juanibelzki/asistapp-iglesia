import { createFileRoute, Link } from '@tanstack/react-router'
import AppleButton from '../components/AppleButton'
import FeatureCard from '../components/FeatureCard'
import { QrCode, ShieldCheck, WifiOff, LayoutDashboard } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="demo-page text-center py-24">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-[var(--sea-ink)]">
          Gestión de asistencia y seguridad infantil para tu iglesia, sin complicaciones.
        </h1>
        <p className="text-xl text-[var(--sea-ink-soft)] mb-10 max-w-2xl mx-auto">
          Optimiza el registro de niños con códigos QR y mantén el control total desde una plataforma intuitiva.
        </p>
        <div className="flex gap-4 justify-center">
            <Link to="/registro">
                <AppleButton text="COMENZAR PRUEBA GRATIS" />
            </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 w-full bg-[var(--surface-strong)]">
        <div className="page-wrap">
            <h2 className="text-3xl font-bold text-center mb-16">Todo lo que necesitas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 my-12">
                <FeatureCard title="Escáner QR Rápido" icon={QrCode} />
                <FeatureCard title="Seguridad & RLS" icon={ShieldCheck} />
                <FeatureCard title="Modo Offline PWA" icon={WifiOff} />
                <FeatureCard title="Dashboard Pastoral" icon={LayoutDashboard} />
            </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 w-full">
        <div className="page-wrap text-center">
            <h2 className="text-3xl font-bold mb-8">Plan único para iglesias</h2>
            <div className="demo-panel inline-block p-10">
                <p className="text-5xl font-bold mb-4">$9<span className="text-lg text-gray-500">/mes</span></p>
                <p className="text-gray-600 mb-8">Incluye 14 días de prueba gratis</p>
                <Link to="/registro">
                    <AppleButton text="SUSCRIBIRSE" variant="emerald" />
                </Link>
            </div>
        </div>
      </section>
    </div>
  )
}

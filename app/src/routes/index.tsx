import { createFileRoute, Link } from '@tanstack/react-router'
import ThemeToggle from '../components/ThemeToggle'
import { Reveal } from '../components/Reveal'
import {
  QrCode,
  ShieldCheck,
  WifiOff,
  BarChart3,
  ArrowRight,
  Check,
  Church,
  ScanLine,
  Play,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
        <Church className="w-5 h-5 text-zinc-950" />
      </div>
      <span className="text-lg font-extrabold tracking-tight text-white">
        Asist<span className="text-emerald-400">App</span>
      </span>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  tag,
  tagColor,
  variant,
  delay,
}: {
  icon: typeof QrCode
  title: string
  description: string
  tag: string
  tagColor: string
  variant: 'left' | 'right'
  delay: number
}) {
  return (
    <Reveal variant={variant} delay={delay}>
      <div className="group bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
        </div>
        <span
          className={`text-[10px] font-mono uppercase tracking-widest ${tagColor} mt-6 block`}
        >
          {tag}
        </span>
      </div>
    </Reveal>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950 pb-16 overflow-x-hidden">
      {/* 0. NAVBAR */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" aria-label="AsistApp">
            <LogoMark />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-zinc-300 hover:text-white transition-colors hidden sm:block"
            >
              Ingresar
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-center space-y-10">
        <Reveal variant="up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SaaS para Escuelas Dominicales y Ministerios
          </div>
        </Reveal>

        <Reveal variant="up" delay={120}>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Gestión de asistencia y seguridad infantil para tu iglesia,{' '}
            <span className="text-gradient">sin complicaciones.</span>
          </h1>
        </Reveal>

        <Reveal variant="up" delay={240}>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Toma asistencia en segundos con código QR, protege el retiro de los niños con
            validación de tutores y mantén informada a tu iglesia en tiempo real.
          </p>
        </Reveal>

        <Reveal variant="up" delay={360}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/registro"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest hover:bg-emerald-300 transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              Comenzar Prueba Gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/registro"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900/60 border border-white/10 text-zinc-300 font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white hover:border-white/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Play className="w-4 h-4" />
              Ver Demostración
            </Link>
          </div>
        </Reveal>

        {/* Mockup / Preview */}
        <Reveal variant="fade" delay={480}>
          <div className="relative max-w-2xl mx-auto mt-8">
            <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 blur-3xl rounded-3xl pointer-events-none" />
            <div className="relative animate-float bg-zinc-900/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-black/40 flex items-center gap-5 text-left">
              <div className="bg-white rounded-2xl p-4 shrink-0 shadow-inner">
                <QrCode className="w-20 h-20 text-zinc-900" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">
                  Iglesia Vida Nueva
                </p>
                <h3 className="text-xl font-bold text-white mt-1 truncate">María Gómez</h3>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3" /> Niño · Sala 3
                </div>
                <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
                  <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
                  Ingreso 10:02 · Tutor verificado
                </p>
              </div>
            </div>

            {/* Mini card flotante del escáner */}
            <div className="absolute -right-4 -top-6 hidden sm:flex items-center gap-2 bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md shadow-xl animate-float-slow">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ScanLine className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-zinc-300">Escaneo en vivo</span>
            </div>

            {/* Mini card del dashboard */}
            <div className="absolute -left-6 -bottom-6 hidden sm:flex items-center gap-2 bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md shadow-xl animate-float">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-zinc-300">128 presentes hoy</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 2. GRILLA DE FUNCIONALIDADES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <Reveal variant="up">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Diseñado para la agilidad en cada culto
            </h2>
            <p className="text-sm text-zinc-400 mt-3 max-w-lg mx-auto">
              Todo lo que tu equipo necesita en una sola plataforma.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={QrCode}
            title="Escáner QR Ultra Rápido"
            description="Registra la entrada de decenas de niños por minuto desde cualquier celular sin demoras."
            tag="01. Asistencia"
            tagColor="text-emerald-400"
            variant="left"
            delay={0}
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Seguridad y Tutores"
            description="Garantiza que solo las personas autorizadas puedan retirar a los niños con códigos de seguridad."
            tag="02. Protección"
            tagColor="text-cyan-400"
            variant="right"
            delay={120}
          />
          <FeatureCard
            icon={WifiOff}
            title="Modo Offline PWA"
            description="Sigue tomando asistencia en salones sin señal de internet. Se sincroniza solo al reconectarse."
            tag="03. Resiliencia"
            tagColor="text-indigo-400"
            variant="left"
            delay={240}
          />
          <FeatureCard
            icon={BarChart3}
            title="Dashboard Pastoral"
            description="Métricas claras de crecimiento, alertas de ausentismo y reportes descargables para el equipo."
            tag="04. Métricas"
            tagColor="text-amber-400"
            variant="right"
            delay={360}
          />
        </div>
      </section>

      {/* 3. PRECIOS */}
      <section className="max-w-md mx-auto px-6 py-12 text-center">
        <Reveal variant="up">
          <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-emerald-500/5">
            <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-400 text-zinc-950 font-mono text-[10px] font-bold uppercase rounded-bl-xl">
              Plan Único
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Plan Iglesia</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Acceso ilimitado a todas las funciones sin restricciones.
            </p>

            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$9</span>
              <span className="text-sm text-zinc-400">USD / mes</span>
            </div>

            <ul className="space-y-3 text-left text-xs text-zinc-300 mb-8 font-mono">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                Niños y tutores ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                Escáner QR ilimitado
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                Soporte PWA Offline
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                14 días de prueba gratis
              </li>
            </ul>

            <Link
              to="/registro"
              className="block w-full py-3.5 rounded-full bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest hover:bg-emerald-300 transition-all duration-200 active:scale-95"
            >
              Suscribirse Ahora
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
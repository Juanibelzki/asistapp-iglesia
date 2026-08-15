import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeToggle from '../components/ThemeToggle'
import { Reveal } from '../components/Reveal'
import {
  QrCode,
  WifiOff,
  BarChart3,
  ArrowRight,
  Check,
  Church,
  Play,
  BadgeCheck,
  CircleCheck,
  AlertTriangle,
  Clock,
  RefreshCw,
  Activity,
  Users,
  type LucideIcon,
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

/* ---------- Mockups ---------- */

const FAKE_QR = [
  '111110101',
  '100010101',
  '101110111',
  '101010001',
  '111110111',
  '000101010',
  '111011101',
  '100001101',
  '111111111',
]

function FakeQr({ className = 'w-32 h-32' }: { className?: string }) {
  return (
    <div className={`${className} bg-white rounded-xl p-2 shadow-inner shrink-0`}>
      <div className="grid grid-cols-9 gap-[3px] w-full h-full">
        {FAKE_QR.flatMap((row, r) =>
          row.split('').map((bit, c) => (
            <span
              key={`${r}-${c}`}
              className={bit === '1' ? 'bg-zinc-900 rounded-[1px]' : 'bg-transparent'}
            />
          )),
        )}
      </div>
    </div>
  )
}

function ScannerMockup() {
  return (
    <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-black/40 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Scanner QR
        </span>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono">
          99.8% más rápido
        </span>
      </div>
      <div className="relative mx-auto w-44 h-44 bg-zinc-950 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
        <FakeQr className="w-28 h-28" />
        <div className="absolute left-3 right-3 h-0.5 rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-scanline" />
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-emerald-400/70 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-emerald-400/70 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-emerald-400/70 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-emerald-400/70 rounded-br-lg" />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-400">
        <CircleCheck className="w-4 h-4" />
        <span className="font-semibold">Asistencia registrada en 1.8s</span>
      </div>
    </div>
  )
}

function MemberMockup() {
  return (
    <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-black/40 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Credencial de Miembro
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono">
          <BadgeCheck className="w-3.5 h-3.5" /> Miembro Activo
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-zinc-950 font-black text-xl shrink-0 shadow-lg shadow-emerald-500/20">
          L
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white truncate">Lucas Martínez</p>
          <p className="text-xs text-zinc-400">DNI 33.102.890</p>
          <p className="text-xs text-zinc-500 mt-0.5">Ministerio de Jóvenes</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-3">
        <span className="flex items-center gap-2 text-xs text-zinc-400">
          <Users className="w-4 h-4 text-emerald-400" /> Grupo Familiar
        </span>
        <span className="font-mono text-lg font-bold tracking-widest text-emerald-400">
          Martínez
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
        <Clock className="w-3.5 h-3.5" /> Registro actualizado hace 2 min
      </div>
    </div>
  )
}

function OfflineMockup() {
  return (
    <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Modo Offline
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Activo
        </span>
      </div>

      <div className="mt-5 bg-zinc-950/60 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Offline Cache Activo</p>
            <p className="text-xs text-zinc-400">24 registros en cola</p>
          </div>
          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin ml-auto shrink-0" />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1.5">
          <span>Sincronizando</span>
          <span>24 / 24</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-950/80 border border-white/10 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full" />
        </div>
        <p className="mt-3 text-xs text-zinc-400 flex items-center gap-1.5">
          <CircleCheck className="w-3.5 h-3.5 text-emerald-400" />
          Todo sincronizado al reconectarse
        </p>
      </div>
    </div>
  )
}

const CHART_BARS = [42, 68, 55, 82, 60, 92, 74]

function DashboardMockup() {
  return (
    <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Asistencia por servicio
        </span>
        <Activity className="w-4 h-4 text-indigo-400" />
      </div>

      <div className="mt-5 flex items-end gap-2 h-24">
        {CHART_BARS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-500/70 to-indigo-500/70 hover:from-emerald-400 hover:to-indigo-400 transition-colors"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs font-semibold text-amber-300">
          3 familias ausentes esta semana
        </p>
      </div>
      <p className="mt-3 text-xs text-zinc-400 flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
        Reporte exportable en un clic
      </p>
    </div>
  )
}

/* ---------- Showcase ---------- */

type ShowcaseProps = {
  index: number
  tag: string
  icon: LucideIcon
  title: string
  what: string
  why: string
  mockup: React.ReactNode
}

function ShowcaseBlock({ index, tag, icon: Icon, title, what, why, mockup }: ShowcaseProps) {
  const isEven = index % 2 === 0
  const text = (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
        <Icon className="w-3.5 h-3.5" /> {tag}
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
        {title}
      </h3>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
          Qué hace
        </p>
        <p className="text-zinc-400 leading-relaxed">{what}</p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
          Por qué lo hace
        </p>
        <p className="text-zinc-400 leading-relaxed">{why}</p>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
    >
      {isEven ? (
        <>
          <div>{text}</div>
          <div>{mockup}</div>
        </>
      ) : (
        <>
          <div className="order-2 lg:order-1">{mockup}</div>
          <div className="order-1 lg:order-2">{text}</div>
        </>
      )}
    </motion.div>
  )
}

/* ---------- Phone Demo (ciclo escaneo -> check-in -> métricas) ---------- */

type PhoneState = 'scan' | 'success' | 'metrics'

function PhoneDemo() {
  const [state, setState] = useState<PhoneState>('scan')

  useEffect(() => {
    const next: Record<PhoneState, PhoneState> = {
      scan: 'success',
      success: 'metrics',
      metrics: 'scan',
    }
    const delay = state === 'scan' ? 2500 : state === 'success' ? 2000 : 1500
    const t = setTimeout(() => setState(next[state]), delay)
    return () => clearTimeout(t)
  }, [state])

  return (
    <div className="relative mx-auto w-[300px] sm:w-[320px]">
      {/* Glow detrás del teléfono */}
      <div className="absolute -inset-10 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative animate-float rounded-[40px] border border-white/15 bg-zinc-900/90 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {/* Dynamic Island */}
        <div className="flex items-center justify-center pb-3">
          <div className="w-28 h-6 rounded-full bg-black/90 border border-white/10 flex items-center justify-end pr-5">
            <span className="w-2 h-2 rounded-full bg-zinc-800" />
          </div>
        </div>

        {/* Pantalla */}
        <div className="rounded-[28px] overflow-hidden bg-zinc-950 border border-white/5 aspect-[9/19] relative">
          <AnimatePresence mode="wait">
            {state === 'scan' && (
              <motion.div
                key="scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
              >
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-5">
                  Escáner QR
                </p>
                <div className="relative w-40 h-40 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl border border-dashed border-emerald-400/40" />
                  <FakeQr className="w-24 h-24" />
                  <div className="absolute left-3 right-3 h-0.5 rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-scanline" />
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 border-t-2 border-l-2 border-emerald-400/70 rounded-tl-lg" />
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 border-t-2 border-r-2 border-emerald-400/70 rounded-tr-lg" />
                  <div className="absolute bottom-1.5 left-1.5 w-5 h-5 border-b-2 border-l-2 border-emerald-400/70 rounded-bl-lg" />
                  <div className="absolute bottom-1.5 right-1.5 w-5 h-5 border-b-2 border-r-2 border-emerald-400/70 rounded-br-lg" />
                </div>
                <p className="mt-7 text-xs font-mono text-zinc-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Escaneando…
                </p>
              </motion.div>
            )}

            {state === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-emerald-500/5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
                  className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                  <Check className="w-8 h-8 text-zinc-950" strokeWidth={3} />
                </motion.div>
                <p className="mt-5 font-bold text-white text-sm">¡Asistencia Confirmada!</p>
                <p className="mt-1 text-xs text-zinc-400">Lucas Martínez · Ministerio de Jóvenes</p>
                <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Miembro Activo · Grupo Familiar Martínez
                </span>
              </motion.div>
            )}

            {state === 'metrics' && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Asistencia hoy
                </p>
                <p className="mt-1 text-2xl font-bold text-white">142 presentes</p>
                <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono">
                  +1
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
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
      <section className="relative max-w-6xl mx-auto px-6 pt-24 md:pt-28 pb-24">
        {/* Aurora Glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-44 left-[6%] w-[620px] h-[620px] rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900/10 to-transparent blur-3xl" />
          <div className="absolute -top-24 right-[2%] w-[560px] h-[560px] rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/10 to-transparent blur-3xl" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* Columna texto */}
          <div className="text-center lg:text-left space-y-8">
            <Reveal variant="up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Plataforma de Gestión y Asistencia Eclesial
              </div>
            </Reveal>

            <Reveal variant="up" delay={120}>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
                Gestión de asistencia y membresía para tu iglesia,{' '}
                <span className="text-gradient">sin complicaciones.</span>
              </h1>
            </Reveal>

            <Reveal variant="up" delay={240}>
              <p className="text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Tomá asistencia en segundos con código QR, organizá tus ministerios y grupos de
                conexión, y mantené informada a tu congregación en tiempo real.
              </p>
            </Reveal>

            <Reveal variant="up" delay={360}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
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
          </div>

          {/* Columna mockup celular */}
          <Reveal variant="right" delay={200}>
            <PhoneDemo />
          </Reveal>
        </div>
      </section>

      {/* 2. FEATURE SHOWCASES (Zig-Zag) */}
      <section className="max-w-6xl mx-auto px-6">
        <Reveal variant="up">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Diseñado para la agilidad en cada culto
            </h2>
            <p className="text-sm text-zinc-400 mt-3 max-w-lg mx-auto">
              Todo lo que tu equipo necesita en una sola plataforma.
            </p>
          </div>
        </Reveal>

        <div className="divide-y divide-white/5">
          <div className="py-20">
            <ShowcaseBlock
              index={0}
              tag="01. Asistencia"
              icon={QrCode}
              title="Escáner QR Ultra Rápido"
              what="Registra la entrada a tu culto general y eventos multitudinarios en menos de 2 segundos desde cualquier teléfono inteligente, sin lectores ni hardware costoso."
              why="Elimina las filas lentas en la entrada del auditorio y las planillas de papel extraviadas."
              mockup={<ScannerMockup />}
            />
          </div>
          <div className="py-20">
            <ShowcaseBlock
              index={1}
              tag="02. Membresía"
              icon={Users}
              title="Gestión de Familias y Membresía"
              what="Credenciales digitales unificadas para que cada familia gestione sus datos y registros desde un solo lugar."
              why="Centraliza la información de cada miembro y su grupo familiar, reduciendo planillas duplicadas y errores de registro."
              mockup={<MemberMockup />}
            />
          </div>
          <div className="py-20">
            <ShowcaseBlock
              index={2}
              tag="03. Resiliencia"
              icon={WifiOff}
              title="Modo Offline PWA"
              what="La app sigue tomando asistencia aunque se caiga el Wi-Fi o no haya señal en los salones, y sincroniza en segundo plano al volver la conexión."
              why="La infraestructura de red de los templos suele ser inestable; el registro no debe detenerse en ningún punto del auditorio."
              mockup={<OfflineMockup />}
            />
          </div>
          <div className="py-20">
            <ShowcaseBlock
              index={3}
              tag="04. Métricas"
              icon={BarChart3}
              title="Dashboard Pastoral en Tiempo Real"
              what="Métricas de crecimiento, seguimiento de nuevos creyentes y detección automática de ausentismo."
              why="Permite al equipo pastoral pastorear intencionalmente y contactar a las familias que llevan más de 2 semanas sin asistir."
              mockup={<DashboardMockup />}
            />
          </div>
        </div>
      </section>

      {/* 3. PRECIOS */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <Reveal variant="up">
          <p className="font-mono text-xs text-emerald-400 uppercase tracking-[0.3em] mb-3">
            Planes simples
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Precios que crecen con tu congregación
          </h2>
          <p className="text-sm text-zinc-400 mb-8">
            Sin guardias 24/7 ni promesas irreales: planes pensados para una operación
            sostenible, de inicio en solitario.
          </p>

          {/* Toggle mensual / anual */}
          <div className="inline-flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-full px-3 py-1.5 mb-12">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all duration-200 ${
                billing === 'monthly'
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all duration-200 ${
                billing === 'annual'
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Anual
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Plan Semilla */}
            <div className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl text-left">
              <h3 className="text-lg font-bold text-white mb-1">Semilla</h3>
              <p className="text-xs text-zinc-400 mb-2 font-mono">Hasta 40 miembros</p>
              <p className="text-xs text-zinc-400 mb-6">
                Ideal para grupos pequeños y pruebas dominicales.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-sm text-zinc-400">USD / mes</span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-300 mb-8 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Escaneo QR en vivo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Credencial digital
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  1 usuario admin
                </li>
              </ul>

              <Link
                to="/registro"
                className="mt-auto block w-full py-3 rounded-full bg-zinc-800 text-white font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all duration-200 active:scale-95"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan Comunidad [DESTACADO] */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative flex flex-col bg-gradient-to-b from-emerald-400/15 to-zinc-900/80 border border-emerald-500/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 text-left"
            >
              <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-400 text-zinc-950 font-mono text-[10px] font-bold uppercase rounded-bl-xl">
                Recomendado
              </div>

              <h3 className="text-lg font-bold text-white mb-1">Comunidad</h3>
              <p className="text-xs text-zinc-400 mb-2 font-mono">Hasta 250 miembros</p>
              <p className="text-xs text-zinc-400 mb-6">
                Para congregaciones en desarrollo que buscan orden y agilidad.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={billing}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-bold text-white"
                  >
                    ${billing === 'monthly' ? '24' : '19'}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-zinc-400">USD / mes</span>
              </div>
              {billing === 'annual' && (
                <p className="text-[10px] text-emerald-400 font-mono -mt-4 mb-4">
                  Facturado anualmente
                </p>
              )}

              <ul className="space-y-3 text-xs text-zinc-300 mb-8 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Modo Offline PWA
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Métricas de asistencia
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Reportes exportables
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Soporte vía WhatsApp / Email
                </li>
              </ul>

              <Link
                to="/registro"
                className="mt-auto block w-full py-3 rounded-full bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest hover:bg-emerald-300 transition-all duration-200 active:scale-95"
              >
                Iniciar Prueba Gratis
              </Link>
            </motion.div>

            {/* Plan Iglesia Pro */}
            <div className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl text-left">
              <h3 className="text-lg font-bold text-white mb-1">Iglesia Pro</h3>
              <p className="text-xs text-zinc-400 mb-2 font-mono">Hasta 800 miembros</p>
              <p className="text-xs text-zinc-400 mb-6">
                Auditorios medianos y múltiples ministerios bajo una misma cuenta.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={billing}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-bold text-white"
                  >
                    ${billing === 'monthly' ? '49' : '39'}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-zinc-400">USD / mes</span>
              </div>
              {billing === 'annual' && (
                <p className="text-[10px] text-emerald-400 font-mono -mt-4 mb-4">
                  Facturado anualmente
                </p>
              )}

              <ul className="space-y-3 text-xs text-zinc-300 mb-8 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Ministerios / áreas ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Alertas de ausentismo avanzadas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Backup automático
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Atención prioritaria
                </li>
              </ul>

              <Link
                to="/registro"
                className="mt-auto block w-full py-3 rounded-full bg-zinc-800 text-white font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all duration-200 active:scale-95"
              >
                Elegir Plan Pro
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
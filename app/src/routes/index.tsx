import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
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
  BadgeCheck,
  CircleCheck,
  AlertTriangle,
  KeyRound,
  Clock,
  RefreshCw,
  Activity,
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

function TutorMockup() {
  return (
    <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-black/40 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Credencial de Tutor
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono">
          <BadgeCheck className="w-3.5 h-3.5" /> Verificado
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-zinc-950 font-black text-xl shrink-0 shadow-lg shadow-emerald-500/20">
          M
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white truncate">Marcos Pérez</p>
          <p className="text-xs text-zinc-400">DNI 31.204.556</p>
          <p className="text-xs text-zinc-500 mt-0.5">Tutor autorizado · Sala 3</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-3">
        <span className="flex items-center gap-2 text-xs text-zinc-400">
          <KeyRound className="w-4 h-4 text-emerald-400" /> PIN de entrega
        </span>
        <span className="font-mono text-lg font-bold tracking-widest text-emerald-400">
          4821
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
        <Clock className="w-3.5 h-3.5" /> Retiro confirmado hace 2 min
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
              what="Registra la entrada en menos de 2 segundos desde cualquier teléfono inteligente, sin comprar lectores ni hardware costoso."
              why="Elimina las filas lentas en la entrada del culto y las planillas de papel extraviadas."
              mockup={<ScannerMockup />}
            />
          </div>
          <div className="py-20">
            <ShowcaseBlock
              index={1}
              tag="02. Protección"
              icon={ShieldCheck}
              title="Seguridad y Protección de Menores"
              what="Validación estricta de retiro mediante código QR dinámico y DNI del tutor autorizado."
              why="Garantiza tranquilidad total a los padres durante la predicación, evitando retiros no autorizados en el ministerio infantil."
              mockup={<TutorMockup />}
            />
          </div>
          <div className="py-20">
            <ShowcaseBlock
              index={2}
              tag="03. Resiliencia"
              icon={WifiOff}
              title="Modo Offline y Resiliencia"
              what="La app sigue tomando asistencia aunque se caiga el Wi-Fi o no haya señal en los salones y sincroniza en segundo plano al volver la conexión."
              why="La infraestructura de red de los templos suele ser inestable; el ingreso nunca debe detenerse."
              mockup={<OfflineMockup />}
            />
          </div>
          <div className="py-20">
            <ShowcaseBlock
              index={3}
              tag="04. Métricas"
              icon={BarChart3}
              title="Dashboard Pastoral en Tiempo Real"
              what="Gráficos de asistencia por servicio, detección automática de ausentismo y reportes exportables."
              why="Permite al equipo pastoral pastorear intencionalmente y contactar a familias que llevan más de 2 semanas sin asistir."
              mockup={<DashboardMockup />}
            />
          </div>
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
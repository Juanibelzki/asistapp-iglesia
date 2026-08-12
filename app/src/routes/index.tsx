import { Link } from '@tanstack/react-router';
import { QrCode, ShieldCheck, WifiOff, BarChart3, ArrowRight, Check } from 'lucide-react';


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* 1. HEADER FLOTANTE (Glassmorphism) */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-mono font-bold tracking-wider text-lg">AsistApp</span>
          </div>


          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors px-3 py-2"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registro"
              className="group relative inline-flex items-center justify-center px-5 py-2 overflow-hidden rounded-full border border-emerald-500/40 text-xs font-mono font-bold tracking-widest uppercase text-emerald-400 hover:text-zinc-950 transition-all duration-300 active:scale-95"
            >
              <span className="absolute inset-0 bg-emerald-400 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full z-0" />
              <span className="relative z-10">Registro</span>
            </Link>
          </nav>
        </div>
      </header>


      {/* 2. HERO SECTION */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          SaaS para Escuelas Dominicales y Ministerios
        </div>


        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Gestión de asistencia y seguridad infantil para tu iglesia, <span className="text-emerald-400">sin complicaciones.</span>
        </h1>


        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Toma asistencia en segundos con código QR, protege el retiro de los niños con validación de tutores y mantén informada a tu iglesia en tiempo real.
        </p>


        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/registro"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest hover:bg-emerald-300 transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            Comenzar Prueba Gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all duration-200 active:scale-95 text-center"
          >
            Ver Demo
          </Link>
        </div>
      </section>


      {/* 3. GRILLA DE FUNCIONALIDADES */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight">Diseñado para la agilidad en cada culto</h2>
          <p className="text-sm text-zinc-400 mt-2">Todo lo que tu equipo necesita en una sola plataforma.</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="group bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Escáner QR Ultra Rápido</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Registra la entrada de decenas de niños por minuto desde cualquier celular sin demoras en la entrada.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mt-6 block">01. Asistencia</span>
          </div>


          {/* Card 2 */}
          <div className="group bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Seguridad y Tutores</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Garantiza que solo las personas autorizadas puedan retirar a los niños con códigos de seguridad.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mt-6 block">02. Proteccion</span>
          </div>


          {/* Card 3 */}
          <div className="group bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Modo Offline PWA</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Sigue tomando asistencia en salones sin señal de internet. Se sincroniza solo al reconectarse.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 mt-6 block">03. Resiliencia</span>
          </div>


          {/* Card 4 */}
          <div className="group bg-zinc-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Dashboard Pastoral</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Métricas claras de crecimiento, alertas de ausentismo y reportes descargables para el equipo.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mt-6 block">04. Metricas</span>
          </div>
        </div>
      </section>


      {/* 4. PRECIOS */}
      <section className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-emerald-500/5">
          <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-400 text-zinc-950 font-mono text-[10px] font-bold uppercase rounded-bl-xl">
            Plan Único
          </div>


          <h3 className="text-xl font-bold text-white mb-2">Plan Iglesia</h3>
          <p className="text-xs text-zinc-400 mb-6">Acceso ilimitado a todas las funciones sin restricciones.</p>


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
      </section>


      {/* 5. FOOTER */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500 font-mono">
        <p>© 2026 AsistApp. Todos los derechos reservados.</p>
      </footer>


    </div>
  );
}

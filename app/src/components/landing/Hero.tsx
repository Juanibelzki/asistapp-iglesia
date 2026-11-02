import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ContourField } from './ContourField'
import { EASE, Magnetic, MaskLines } from './primitives'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -160])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18])

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[680px] overflow-hidden bg-marino-deep">
      <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
        <ContourField className="absolute inset-0 h-full w-full" />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,transparent_20%,rgba(7,26,51,0.9)_85%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-marino-deep" />

      {/* Marcas de carta náutica */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="pointer-events-none absolute inset-x-6 top-28 mx-auto hidden max-w-6xl justify-between font-chart text-[10px] uppercase tracking-[0.3em] text-white/35 md:flex"
      >
        <span>Carta 01 — Asistencia</span>
        <span>Rumbo N 0° · Escala 1:1</span>
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 pt-16"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-3 font-chart text-[11px] uppercase tracking-[0.3em] text-white/70"
        >
          <span className="h-px w-10 bg-rojo" /> Plataforma para iglesias
        </motion.p>

        <h1 className="font-display text-[clamp(2.75rem,8vw,7.25rem)] font-light leading-[0.98] tracking-[-0.025em] text-white">
          <MaskLines
            delay={0.2}
            lines={[
              <>
                Cada persona, <em className="font-normal italic text-rojo">contada.</em>
              </>,
              <>
                Cada familia, <em className="font-normal italic text-rojo">cuidada.</em>
              </>,
            ]}
          />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.75 }}
          className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
            Ecclesiahs toma la asistencia con QR, ordena a tus miembros por familia y ministerio, y te avisa a
            quién visitar. Pastoreá con datos, no con planillas.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Magnetic>
              <Link
                to="/registerCongregacion"
                className="group inline-flex items-center gap-3 rounded-full bg-rojo py-3 pl-7 pr-3 text-sm font-semibold text-white shadow-[0_20px_40px_-12px_rgba(225,29,46,0.7)] transition-colors hover:bg-rojo-deep"
              >
                Registrar mi iglesia
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-rojo transition-transform duration-300 group-hover:rotate-[-45deg]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Magnetic>
            <Link
              to="/portal"
              className="text-sm font-medium text-white/75 underline decoration-white/30 underline-offset-8 transition-colors hover:text-white hover:decoration-rojo"
            >
              Soy miembro · ver mi credencial
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

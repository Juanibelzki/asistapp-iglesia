import { FadeUp, MaskLines } from './primitives'

const STATS = [
  { value: '< 2 s', label: 'para registrar a cada persona en la entrada' },
  { value: '0', label: 'lectores ni hardware extra: alcanza con un celular' },
  { value: '$0', label: 'para empezar con el plan Semilla' },
  { value: '1 clic', label: 'para exportar el reporte de asistencia' },
]

export function Stats() {
  return (
    <section className="relative bg-marino-deep text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-2 border-l border-t border-white/10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="border-b border-r border-white/10 p-6 sm:p-8">
              <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-none text-white">
                <MaskLines inView delay={i * 0.08} lines={[s.value]} />
              </p>
              <FadeUp delay={0.2 + i * 0.08}>
                <p className="mt-4 max-w-[220px] text-sm text-white/60">{s.label}</p>
              </FadeUp>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

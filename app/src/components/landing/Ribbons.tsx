const ITEMS = [
  'Asistencia con QR',
  'Familias',
  'Ministerios',
  'Modo sin conexión',
  'Credenciales digitales',
  'Alertas de ausencia',
  'Reportes en un clic',
]

function Row({ reverse = false, className = '' }: { reverse?: boolean; className?: string }) {
  const content = ITEMS.map((item) => (
    <span key={item} className="flex items-center gap-8 pr-8">
      <span className="whitespace-nowrap font-display text-2xl italic sm:text-3xl">{item}</span>
      <span aria-hidden="true" className="text-lg">✦</span>
    </span>
  ))
  return (
    <div className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} ${className}`}>
      <div className="flex">{content}</div>
      <div className="flex" aria-hidden="true">
        {content}
      </div>
    </div>
  )
}

// Dos cintas cruzadas que cubren la transición del azul al blanco.
export function Ribbons() {
  return (
    <section
      aria-label="Funciones principales"
      className="relative h-44 overflow-hidden bg-[linear-gradient(to_bottom,#071a33_50%,#f4f7fb_50%)] sm:h-52"
    >
      <div className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2 rotate-[2.5deg] bg-white py-3 text-marino shadow-xl">
        <Row reverse />
      </div>
      <div className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2 -rotate-[3deg] bg-rojo py-3 text-white shadow-2xl shadow-rojo/30">
        <Row />
      </div>
    </section>
  )
}

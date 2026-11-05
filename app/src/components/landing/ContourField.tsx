import { useEffect, useRef } from 'react'

// Fondo generativo tipo "carta náutica": curvas de nivel que fluyen como el
// agua y forman ondas concéntricas alrededor del cursor. Se dibuja en un
// <canvas> con marching squares sobre un campo de ruido.
//
// Rendimiento: limitado a ~30 fps, resolución reducida en pantallas táctiles,
// todas las curvas se trazan en solo dos paths (secundarias y maestras), sin
// crear objetos por celda, y el loop se detiene por completo cuando el canvas
// no está en pantalla o la pestaña está oculta.

type ContourFieldProps = {
  className?: string
  /** Color RGB de las curvas maestras, p. ej. "225,29,46". */
  accent?: string
  /** Color RGB de las curvas secundarias. */
  line?: string
  levels?: number
  speed?: number
}

const FRAME_MS = 1000 / 30

function buildPerm(seed: number) {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  let s = seed
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    const t = p[i]
    p[i] = p[j]
    p[j] = t
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  return perm
}

function makeNoise(perm: Uint8Array) {
  const hash = (x: number, y: number, z: number) => perm[perm[perm[x & 255] + (y & 255)] + (z & 255)] / 255
  const fade = (t: number) => t * t * (3 - 2 * t)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  return (x: number, y: number, z: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const zi = Math.floor(z)
    const u = fade(x - xi)
    const v = fade(y - yi)
    const w = fade(z - zi)
    const x0 = lerp(hash(xi, yi, zi), hash(xi + 1, yi, zi), u)
    const x1 = lerp(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u)
    const x2 = lerp(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u)
    const x3 = lerp(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u)
    return lerp(lerp(x0, x1, v), lerp(x2, x3, v), w)
  }
}

export function ContourField({
  className = '',
  accent = '225,29,46',
  line = '255,255,255',
  levels = 16,
  speed = 0.05,
}: ContourFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    // Celdas más grandes = menos trabajo por cuadro. En táctiles no hay
    // cursor, así que además se omite la deformación por puntero.
    const CELL = coarse ? 26 : 20
    // Escala del campo de ruido por píxel: mantiene el mismo "zoom" visual
    // independientemente del tamaño de celda.
    const NOISE_STEP = (0.05 / 16) * CELL
    const noise = makeNoise(buildPerm(1337))

    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let field = new Float32Array(0)
    let onScreen = true
    let pageVisible = !document.hidden
    let raf = 0
    let last = 0
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, s: 0, ts: 0 }
    const minor = `rgba(${line},0.11)`
    const major = `rgba(${accent},0.55)`

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      // Las líneas son finas y quedan detrás de un degradado: no hace falta
      // resolución retina completa (en DPR 3 eso es 9× más píxeles).
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5)
      w = r.width
      h = r.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      cols = Math.ceil(w / CELL) + 1
      rows = Math.ceil(h / CELL) + 1
      field = new Float32Array(cols * rows)
    }

    const draw = (time: number) => {
      const z = (time / 1000) * speed
      mouse.x += (mouse.tx - mouse.x) * 0.12
      mouse.y += (mouse.ty - mouse.y) * 0.12
      mouse.s += (mouse.ts - mouse.s) * 0.08
      const useMouse = mouse.s > 0.001

      for (let j = 0; j < rows; j++) {
        const ny = j * NOISE_STEP
        const dy = j * CELL - mouse.y
        const dy2 = dy * dy
        for (let i = 0; i < cols; i++) {
          const nx = i * NOISE_STEP
          let v = noise(nx, ny, z) * 0.65 + noise(nx * 2.1, ny * 2.1, z * 1.7 + 9) * 0.35
          if (useMouse) {
            const dx = i * CELL - mouse.x
            v += mouse.s * 0.32 * Math.exp(-(dx * dx + dy2) / 28000)
          }
          field[j * cols + i] = v
        }
      }

      ctx.clearRect(0, 0, w, h)
      // Dos pasadas: secundarias y maestras. Cada una es un único path con un
      // único stroke(), en lugar de un stroke por nivel.
      for (let pass = 0; pass < 2; pass++) {
        const wantMajor = pass === 1
        ctx.beginPath()
        for (let l = 1; l < levels; l++) {
          if ((l % 4 === 0) !== wantMajor) continue
          const iso = l / levels
          for (let j = 0; j < rows - 1; j++) {
            const row = j * cols
            const nextRow = row + cols
            const y0 = j * CELL
            const y1 = y0 + CELL
            for (let i = 0; i < cols - 1; i++) {
              const a = field[row + i]
              const b = field[row + i + 1]
              const c = field[nextRow + i + 1]
              const d = field[nextRow + i]
              const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0)
              if (idx === 0 || idx === 15) continue

              const x0 = i * CELL
              // Puntos de corte en cada borde de la celda (interpolación lineal).
              const tX = x0 + (CELL * (iso - a)) / (b - a)
              const rY = y0 + (CELL * (iso - b)) / (c - b)
              const bX = x0 + (CELL * (iso - d)) / (c - d)
              const lY = y0 + (CELL * (iso - a)) / (d - a)
              const x1 = x0 + CELL

              switch (idx) {
                case 1: case 14: ctx.moveTo(x0, lY); ctx.lineTo(bX, y1); break
                case 2: case 13: ctx.moveTo(bX, y1); ctx.lineTo(x1, rY); break
                case 3: case 12: ctx.moveTo(x0, lY); ctx.lineTo(x1, rY); break
                case 4: case 11: ctx.moveTo(tX, y0); ctx.lineTo(x1, rY); break
                case 6: case 9: ctx.moveTo(tX, y0); ctx.lineTo(bX, y1); break
                case 7: case 8: ctx.moveTo(x0, lY); ctx.lineTo(tX, y0); break
                case 5:
                  ctx.moveTo(tX, y0); ctx.lineTo(x1, rY)
                  ctx.moveTo(x0, lY); ctx.lineTo(bX, y1)
                  break
                case 10:
                  ctx.moveTo(x0, lY); ctx.lineTo(tX, y0)
                  ctx.moveTo(bX, y1); ctx.lineTo(x1, rY)
                  break
              }
            }
          }
        }
        ctx.strokeStyle = wantMajor ? major : minor
        ctx.lineWidth = wantMajor ? 1.25 : 1
        ctx.stroke()
      }
    }

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop)
      if (time - last < FRAME_MS) return
      last = time
      draw(time)
    }

    const start = () => {
      if (reduce || raf || !onScreen || !pageVisible) return
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const onPointer = (e: PointerEvent) => {
      if (!raf) return
      const r = canvas.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      mouse.tx = e.clientX - r.left
      mouse.ty = e.clientY - r.top
      mouse.ts = inside ? 1 : 0
      if (mouse.x < -9000) {
        mouse.x = mouse.tx
        mouse.y = mouse.ty
      }
    }

    const onVisibility = () => {
      pageVisible = !document.hidden
      if (pageVisible) start()
      else stop()
    }

    resize()
    draw(performance.now())

    let lastW = w
    let lastH = h
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect()
      // En móvil la barra de direcciones dispara resize al hacer scroll:
      // ignorar cambios mínimos evita reasignar el canvas a cada rato.
      if (Math.abs(r.width - lastW) < 2 && Math.abs(r.height - lastH) < 80) return
      lastW = r.width
      lastH = r.height
      resize()
      draw(performance.now())
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) start()
      else stop()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)

    if (!reduce && !coarse) {
      window.addEventListener('pointermove', onPointer, { passive: true })
    }
    start()

    return () => {
      stop()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
      io.disconnect()
    }
  }, [accent, line, levels, speed])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}

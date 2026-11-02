import { useEffect, useRef } from 'react'

// Fondo generativo tipo "carta náutica": curvas de nivel que fluyen como el
// agua y forman ondas concéntricas alrededor del cursor. Se dibuja en un
// <canvas> con marching squares sobre un campo de ruido; se pausa fuera de
// pantalla y queda estático si el usuario prefiere menos movimiento.

type ContourFieldProps = {
  className?: string
  /** Color RGB de las curvas maestras, p. ej. "225,29,46". */
  accent?: string
  /** Color RGB de las curvas secundarias. */
  line?: string
  levels?: number
  speed?: number
}

const CELL = 16

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
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const noise = makeNoise(buildPerm(1337))
    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let field = new Float32Array(0)
    let visible = true
    let raf = 0
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, s: 0, ts: 0 }

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / CELL) + 1
      rows = Math.ceil(h / CELL) + 1
      field = new Float32Array(cols * rows)
    }

    const draw = (time: number) => {
      const z = (time / 1000) * speed
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08
      mouse.s += (mouse.ts - mouse.s) * 0.05

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const nx = i * 0.05
          const ny = j * 0.05
          let v = noise(nx, ny, z) * 0.65 + noise(nx * 2.1, ny * 2.1, z * 1.7 + 9) * 0.35
          if (mouse.s > 0.001) {
            const dx = i * CELL - mouse.x
            const dy = j * CELL - mouse.y
            v += mouse.s * 0.32 * Math.exp(-(dx * dx + dy * dy) / 28000)
          }
          field[j * cols + i] = v
        }
      }

      ctx.clearRect(0, 0, w, h)
      for (let l = 1; l < levels; l++) {
        const iso = l / levels
        ctx.beginPath()
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = field[j * cols + i]
            const b = field[j * cols + i + 1]
            const c = field[(j + 1) * cols + i + 1]
            const d = field[(j + 1) * cols + i]
            const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0)
            if (idx === 0 || idx === 15) continue

            const x0 = i * CELL
            const y0 = j * CELL
            const top = (): [number, number] => [x0 + (CELL * (iso - a)) / (b - a), y0]
            const right = (): [number, number] => [x0 + CELL, y0 + (CELL * (iso - b)) / (c - b)]
            const bottom = (): [number, number] => [x0 + (CELL * (iso - d)) / (c - d), y0 + CELL]
            const left = (): [number, number] => [x0, y0 + (CELL * (iso - a)) / (d - a)]
            const seg = (p: [number, number], q: [number, number]) => {
              ctx.moveTo(p[0], p[1])
              ctx.lineTo(q[0], q[1])
            }

            switch (idx) {
              case 1: case 14: seg(left(), bottom()); break
              case 2: case 13: seg(bottom(), right()); break
              case 3: case 12: seg(left(), right()); break
              case 4: case 11: seg(top(), right()); break
              case 6: case 9: seg(top(), bottom()); break
              case 7: case 8: seg(left(), top()); break
              case 5: seg(top(), right()); seg(left(), bottom()); break
              case 10: seg(left(), top()); seg(bottom(), right()); break
            }
          }
        }
        const major = l % 4 === 0
        ctx.strokeStyle = major ? `rgba(${accent},0.55)` : `rgba(${line},0.11)`
        ctx.lineWidth = major ? 1.25 : 1
        ctx.stroke()
      }
    }

    const loop = (time: number) => {
      if (visible) draw(time)
      raf = requestAnimationFrame(loop)
    }

    const onPointer = (e: PointerEvent) => {
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

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduce) draw(0)
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(canvas)

    if (reduce) {
      draw(0)
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true })
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      ro.disconnect()
      io.disconnect()
    }
  }, [accent, line, levels, speed])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}

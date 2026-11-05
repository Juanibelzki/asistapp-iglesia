import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// Punto y anillo que siguen al cursor; el anillo crece sobre elementos
// interactivos. Solo se monta con mouse y sin preferencia de movimiento reducido.
//
// Rendimiento: la posición vive en motion values (sin re-render de React) y
// el estado solo cambia cuando realmente cambia (entrar/salir de un link).
// El anillo se agranda con `scale`, no con width/height, para no forzar layout.
const RING = 34
const RING_ACTIVE = 64

export function CursorFollower() {
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)
  const activeRef = useRef(false)
  const visibleRef = useRef(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 })

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(fine && !reduce)
  }, [])

  useEffect(() => {
    if (!enabled) return
    let lastTarget: EventTarget | null = null
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
      // `closest` solo cuando cambia el elemento bajo el cursor.
      if (e.target === lastTarget) return
      lastTarget = e.target
      const isActive = !!(e.target as Element | null)?.closest?.('a, button, summary, [data-cursor]')
      if (isActive !== activeRef.current) {
        activeRef.current = isActive
        setActive(isActive)
      }
    }
    const leave = () => {
      visibleRef.current = false
      setVisible(false)
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-rojo"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-white mix-blend-difference will-change-transform"
        style={{ x: ringX, y: ringY, width: RING, height: RING, marginLeft: -RING / 2, marginTop: -RING / 2 }}
        animate={{
          scale: active ? RING_ACTIVE / RING : 1,
          opacity: visible ? (active ? 0.9 : 0.5) : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      />
    </>
  )
}

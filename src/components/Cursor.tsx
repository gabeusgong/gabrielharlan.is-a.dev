import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/* A custom springy cursor "blob" that grows over interactive elements.
   Hidden on touch devices and when the pointer leaves the window. */
export default function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 })

  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)

    // position + visibility update every event (cheap motion-value writes), but
    // the interactive-target check does a DOM ancestor walk — rAF-throttle that
    // so it runs at most once per frame instead of on every pointermove
    let rafId = 0
    let lastTarget: EventTarget | null = null
    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      lastTarget = e.target
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        const el = lastTarget as HTMLElement | null
        setActive(!!el?.closest?.('a, button, [data-cursor], input, textarea'))
      })
    }
    // pointer left the window → relatedTarget is null
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false)
    }
    const hide = () => setVisible(false)

    // pointermove alone covers the mouse and keeps following during drags that
    // suppress compatibility mouse events (e.g. the custom gallery scrollbar)
    window.addEventListener('pointermove', move)
    window.addEventListener('mouseout', out)
    window.addEventListener('blur', hide)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('mouseout', out)
      window.removeEventListener('blur', hide)
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden
      className="cursor-blob"
      style={{ x: sx, y: sy }}
      animate={{
        scale: active ? 2.2 : 1,
        opacity: visible ? (active ? 0.5 : 1) : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 25 },
        opacity: { duration: 0.15 },
      }}
    />
  )
}

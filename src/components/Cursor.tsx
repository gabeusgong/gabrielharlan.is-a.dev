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

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const el = e.target as HTMLElement
      setActive(!!el.closest?.('a, button, [data-cursor], input, textarea'))
    }
    // pointer left the window → relatedTarget is null
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false)
    }
    const hide = () => setVisible(false)

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseout', out)
    window.addEventListener('blur', hide)
    return () => {
      window.removeEventListener('mousemove', move)
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

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { isFirstVisit, markIntroSeen } from '../lib/prefs'

/* A brief "headlamp on, descending" curtain on the very first visit. Skippable
   (tap / any key), auto-lifts after ~2s, and never shows again (localStorage).
   Skipped for automation/bots so it doesn't affect audits. */
export default function Intro({ onDone }: { onDone?: () => void }) {
  const [show, setShow] = useState(isFirstVisit)
  const depthRef = useRef<HTMLSpanElement>(null)

  const done = useRef(false)
  const dismiss = useCallback(() => {
    if (done.current) return
    done.current = true
    // kick off the cave→light scheme fade FIRST, then lift the veil a beat
    // later — so the fade is already underway (behind the opaque curtain) by
    // the time the curtain clears, revealing a scheme mid-transition
    onDone?.()
    window.setTimeout(() => setShow(false), 220)
  }, [onDone])

  useEffect(() => {
    if (!show) return
    markIntroSeen()
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(dismiss, 2100)
    window.addEventListener('keydown', dismiss)

    // tick the depth counter 0 → 120 m
    let raf = 0
    const start = performance.now()
    const dur = 1700
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      if (depthRef.current) depthRef.current.textContent = `${Math.round(p * 120)} m`
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.clearTimeout(t)
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', dismiss)
      document.body.style.overflow = ''
    }
  }, [show, dismiss])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="intro"
          onClick={dismiss}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: [0.7, 0, 0.25, 1] }}
        >
          <motion.div
            className="intro__beam"
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <div className="intro__center">
            <motion.div
              className="intro__lamp"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              🔦
            </motion.div>
            <motion.p
              className="intro__cap label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              headlamp on · descending <span ref={depthRef} className="intro__depth">0 m</span>
            </motion.p>
          </div>
          <span className="intro__skip label">tap to skip</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

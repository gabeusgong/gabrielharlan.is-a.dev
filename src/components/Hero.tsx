import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react'
import { profile } from '../data'
import { track } from '../lib/track'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
}
const letter = {
  hidden: { y: '120%', rotate: 8, opacity: 0 },
  show: {
    y: '0%',
    rotate: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 220, damping: 18 },
  },
}

function KineticName({ text }: { text: string }) {
  let idx = 0
  const ref = useRef<HTMLHeadingElement>(null)

  // On mobile, scale the name so it fills the width on a single line.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      if (window.innerWidth > 720) {
        el.style.fontSize = '' // desktop uses the CSS clamp
        return
      }
      const avail = el.parentElement?.clientWidth ?? window.innerWidth
      el.style.fontSize = '100px'
      const w = el.scrollWidth || 1
      el.style.fontSize = `${((avail / w) * 100 * 0.99).toFixed(2)}px`
    }
    fit()
    window.addEventListener('resize', fit)
    let cancelled = false
    // refit once the display font has loaded (its metrics differ from fallback)
    document.fonts?.ready?.then(() => {
      if (!cancelled) fit()
    })
    return () => {
      cancelled = true
      window.removeEventListener('resize', fit)
    }
  }, [text])

  return (
    <motion.h1
      ref={ref}
      className="hero__name"
      variants={container}
      initial="hidden"
      animate="show"
      aria-label={text}
    >
      {text.split(' ').map((word, wi) => (
        <span className="hero__word" key={wi} aria-hidden>
          {word.split('').map((ch) => {
            const i = idx++
            return (
              <span className="hero__letter-wrap" key={i}>
                <motion.span className="hero__letter" variants={letter}>
                  {ch}
                </motion.span>
              </span>
            )
          })}
        </span>
      ))}
    </motion.h1>
  )
}

function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % words.length), 2200)
    return () => clearInterval(t)
  }, [words.length])

  return (
    <span className="hero__rotator">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ y: '0.9em', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-0.9em', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function Hero() {
  // time-aware greeting; "welcome back" for returning visitors
  const [lead] = useState(() => {
    const h = new Date().getHours()
    const greeting =
      h < 5 ? 'up late?' : h < 12 ? 'good morning' : h < 17 ? 'good afternoon' : h < 21 ? 'good evening' : 'good night'
    let seen = false
    try {
      seen = !!localStorage.getItem('gh-visited')
      localStorage.setItem('gh-visited', '1')
    } catch {
      /* ignore */
    }
    return seen ? 'welcome back' : greeting
  })

  // parallax: blobs drift with the mouse (desktop) or device tilt (mobile)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 50, damping: 18 })
  const sy = useSpring(py, { stiffness: 50, damping: 18 })
  const coralX = useTransform(sx, [-1, 1], [-34, 34])
  const coralY = useTransform(sy, [-1, 1], [-24, 24])
  const cobaltX = useTransform(sx, [-1, 1], [30, -30])
  const cobaltY = useTransform(sy, [-1, 1], [24, -24])
  const limeX = useTransform(sx, [-1, 1], [-16, 16])
  const limeY = useTransform(sy, [-1, 1], [18, -18])

  useEffect(() => {
    // no pointer/tilt parallax for visitors who prefer reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia?.('(pointer: coarse)').matches) {
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return
        px.set(Math.max(-1, Math.min(1, e.gamma / 35)))
        py.set(Math.max(-1, Math.min(1, (e.beta - 45) / 35)))
      }
      window.addEventListener('deviceorientation', onTilt)
      return () => window.removeEventListener('deviceorientation', onTilt)
    }
    const onMove = (e: MouseEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1)
      py.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [px, py])

  return (
    <header className="hero" id="top">
      {/* floating playground shapes (with pointer/tilt parallax) */}
      <motion.div className="blob-parallax" style={{ x: coralX, y: coralY }}>
        <motion.div
          className="blob blob--coral"
          animate={{ y: [0, -24, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <motion.div className="blob-parallax" style={{ x: cobaltX, y: cobaltY }}>
        <motion.div
          className="blob blob--cobalt"
          animate={{ y: [0, 26, 0], x: [0, -14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <motion.div className="blob-parallax" style={{ x: limeX, y: limeY }}>
        <motion.div
          className="blob blob--lime"
          animate={{ y: [0, -18, 0], rotate: [0, -16, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="hero__inner">
        <motion.p
          className="label hero__eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          ✦ {lead} ✦
        </motion.p>

        <KineticName text={profile.name} />

        <motion.p
          className="hero__sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          I&apos;m <RotatingWord words={profile.iAm} />. {profile.tagline}
        </motion.p>

        <motion.p
          className="hero__avail label"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          {profile.availability}
        </motion.p>

        <motion.div
          className="hero__cta"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <a className="btn btn--solid" href="#work" data-cursor>
            See the work →
          </a>
          <a className="btn btn--ghost" href="#contact" data-cursor>
            Say hello
          </a>
          <a
            className="btn btn--ghost btn--resume"
            href="./resume/"
            target="_blank"
            rel="noreferrer"
            data-cursor
            onClick={() => track('resume')}
          >
            Résumé ↗
          </a>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span className="label">scroll</span>
        <motion.span
          className="hero__scroll-line"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.a>
    </header>
  )
}

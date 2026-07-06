import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { SECRETS, getUnlocked, type Secret } from '../lib/achievements'

const PARTY_COLORS = ['#f4502a', '#2d4df5', '#c8f02c', '#ff9ece', '#ffc23d']
function rainConfetti() {
  for (let i = 0; i < 48; i++) {
    const s = document.createElement('span')
    s.className = 'confetti-bit'
    s.style.left = `${Math.random() * 100}vw`
    s.style.background = PARTY_COLORS[i % PARTY_COLORS.length]
    s.style.setProperty('--d', `${(0.9 + Math.random() * 1).toFixed(2)}s`)
    s.style.setProperty('--delay', `${(Math.random() * 0.4).toFixed(2)}s`)
    s.style.setProperty('--rot', `${Math.round(Math.random() * 720 - 360)}deg`)
    document.body.appendChild(s)
    window.setTimeout(() => s.remove(), 2400)
  }
}

/* Tracks hidden "secrets" the visitor discovers (cave mode, ring win, the bat,
   flinging a card, the terminal, etc.) and shows unlock toasts + all-found confetti. */
export default function Achievements() {
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [toast, setToast] = useState<Secret | null>(null)
  const [party, setParty] = useState(false)

  useEffect(() => {
    setUnlocked(getUnlocked())

    const onUnlock = (e: Event) => {
      setUnlocked(getUnlocked())
      const s = (e as CustomEvent).detail as Secret | undefined
      if (s) {
        setToast(s)
        window.setTimeout(() => setToast(null), 2600)
      }
    }
    window.addEventListener('secret-unlocked', onUnlock)

    return () => {
      window.removeEventListener('secret-unlocked', onUnlock)
    }
  }, [])

  const total = SECRETS.length
  const count = unlocked.filter((id) => SECRETS.some((s) => s.id === id)).length

  // celebrate once when every secret is found
  useEffect(() => {
    if (total === 0 || count < total) return
    let done = false
    try {
      done = localStorage.getItem('gh-all-secrets') === '1'
    } catch {
      /* ignore */
    }
    if (done) return
    try {
      localStorage.setItem('gh-all-secrets', '1')
    } catch {
      /* ignore */
    }
    rainConfetti()
    setParty(true)
    window.setTimeout(() => setParty(false), 5000)
  }, [count, total])

  // the secrets chip is hidden on purpose — list them via `secret` in the
  // terminal. Toasts still confirm each unlock, and the confetti fires on the
  // full set. Portal them to <body> so they float above the terminal, modals,
  // and everything else regardless of stacking context.
  return createPortal(
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="achv-toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, x: '-50%', y: 16 }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, x: '-50%', y: 16 }}
          >
            {toast.emoji} secret unlocked · <strong>{toast.label}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {party && (
          <motion.div
            className="achv-party"
            role="status"
            initial={{ opacity: 0, x: '-50%', y: 24, scale: 0.9 }}
            animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
            exit={{ opacity: 0, x: '-50%', y: 24 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            🎉 you found every secret · <strong>nice.</strong>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}

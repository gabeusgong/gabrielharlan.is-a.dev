import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SECRETS, getUnlocked, unlock, type Secret } from '../lib/achievements'

const KONAMI = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
]

// Konami needs a keyboard, so drop it on touch devices — it isn't attainable
// there and shouldn't sit in the count as an impossible secret.
const isCoarse =
  typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches
const VISIBLE_SECRETS = isCoarse ? SECRETS.filter((s) => s.id !== 'konami') : SECRETS

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
   flinging a card, the Konami code) and shows a count + unlock toasts. */
export default function Achievements() {
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [open, setOpen] = useState(false)
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

    let seq: string[] = []
    const onKey = (e: KeyboardEvent) => {
      seq = [...seq, e.key.toLowerCase()].slice(-KONAMI.length)
      if (KONAMI.every((k, i) => k === seq[i])) unlock('konami')
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('secret-unlocked', onUnlock)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const total = VISIBLE_SECRETS.length
  const count = unlocked.filter((id) => VISIBLE_SECRETS.some((s) => s.id === id)).length

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

  return (
    <>
      <div className={`achv ${open ? 'achv--open' : ''}`}>
        {open && (
          <div className="achv__list">
            <p className="achv__title label">secrets · {count}/{total}</p>
            {VISIBLE_SECRETS.map((s) => {
              const got = unlocked.includes(s.id)
              return (
                <div key={s.id} className={`achv__item ${got ? 'is-got' : ''}`}>
                  <span className="achv__emoji">{got ? s.emoji : '❔'}</span>
                  <span className="achv__label">{got ? s.label : '???'}</span>
                  <span className="achv__hint">{got ? s.hint : 'locked'}</span>
                </div>
              )
            })}
          </div>
        )}
        <button
          className="achv__toggle"
          data-cursor
          onClick={() => setOpen((o) => !o)}
          aria-label={`${count}/${total} secrets found`}
        >
          🗝 {count}/{total}
        </button>
      </div>

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
    </>
  )
}

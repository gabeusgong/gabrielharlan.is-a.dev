import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SECRETS, getUnlocked, unlock, type Secret } from '../lib/achievements'

const KONAMI = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
]

/* Tracks hidden "secrets" the visitor discovers (cave mode, ring win, the bat,
   flinging a card, the Konami code) and shows a count + unlock toasts. */
export default function Achievements() {
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<Secret | null>(null)

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

    // mobile Konami: swipe ↑↑↓↓←→←→ then two taps
    const TOUCH_SEQ = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'tap', 'tap']
    let tSeq: string[] = []
    let sx = 0
    let sy = 0
    const onTS = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      sx = t.clientX
      sy = t.clientY
    }
    const onTE = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - sx
      const dy = t.clientY - sy
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)
      let tok: string
      if (adx < 24 && ady < 24) tok = 'tap'
      else if (ady > adx) tok = dy < 0 ? 'up' : 'down'
      else tok = dx < 0 ? 'left' : 'right'
      tSeq = [...tSeq, tok].slice(-TOUCH_SEQ.length)
      if (TOUCH_SEQ.every((k, i) => k === tSeq[i])) unlock('konami')
    }
    window.addEventListener('touchstart', onTS, { passive: true })
    window.addEventListener('touchend', onTE, { passive: true })

    return () => {
      window.removeEventListener('secret-unlocked', onUnlock)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTS)
      window.removeEventListener('touchend', onTE)
    }
  }, [])

  const count = unlocked.length
  const total = SECRETS.length

  return (
    <>
      <div className={`achv ${open ? 'achv--open' : ''}`}>
        {open && (
          <div className="achv__list">
            <p className="achv__title label">secrets · {count}/{total}</p>
            {SECRETS.map((s) => {
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
          aria-label={`Secrets found: ${count} of ${total}`}
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
    </>
  )
}

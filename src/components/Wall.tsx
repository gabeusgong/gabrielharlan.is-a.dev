import { useEffect, useRef, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  runTransaction,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { tones } from '../data'
import Reveal from './Reveal'

const COLORS = ['coral', 'cobalt', 'lime', 'pink', 'sun'] as const
type ColorKey = (typeof COLORS)[number]
type Mark = { id: string; text: string; color: ColorKey }

const MAX = 24

// stable per-id tilt so stickers don't jump on re-render
const tiltFor = (id: string) => {
  let s = 0
  for (const c of id) s += c.charCodeAt(0)
  return (s % 13) - 6
}

export default function Wall() {
  const [marks, setMarks] = useState<Mark[]>([])
  const [text, setText] = useState('')
  const [num, setNum] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const nextColor = useRef(0)

  // live wall
  useEffect(() => {
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'), limit(80))
    return onSnapshot(
      q,
      (snap) => {
        setMarks(
          snap.docs.map((d) => {
            const data = d.data()
            const color = (COLORS as readonly string[]).includes(data.color)
              ? (data.color as ColorKey)
              : 'sun'
            return { id: d.id, text: String(data.text ?? ''), color }
          }),
        )
      },
      (err) => console.warn('wall snapshot:', err.message),
    )
  }, [])

  // "explorer #N" — count each visitor once (localStorage), atomically increment
  useEffect(() => {
    const stored = localStorage.getItem('gh-visitor-num')
    if (stored) {
      setNum(Number(stored))
      return
    }
    runTransaction(db, async (tx) => {
      const ref = doc(db, 'meta', 'stats')
      const snap = await tx.get(ref)
      const next = (snap.exists() ? Number(snap.data().visits) || 0 : 0) + 1
      tx.set(ref, { visits: next })
      return next
    })
      .then((n) => {
        setNum(n)
        try {
          localStorage.setItem('gh-visitor-num', String(n))
        } catch {
          /* ignore */
        }
      })
      .catch((err) => console.warn('visitor count:', err.message))
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim().slice(0, MAX)
    if (!t || busy) return
    setBusy(true)
    const color = COLORS[nextColor.current++ % COLORS.length]
    try {
      await addDoc(collection(db, 'guestbook'), { text: t, color, createdAt: serverTimestamp() })
      setText('')
    } catch (err) {
      console.warn('leave mark:', (err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="section wall" id="wall">
      <Reveal>
        <p className="label">
          <span className="tick">05</span> / the wall
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="wall__heading">
          Leave your <span className="wall__mark-word">mark.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="wall__sub">
          {num != null ? (
            <>
              You&apos;re explorer <strong>#{num}</strong> ·{' '}
            </>
          ) : null}
          {marks.length} sticker{marks.length === 1 ? '' : 's'} on the wall
        </p>
      </Reveal>

      <Reveal delay={0.14}>
        <form className="wall__form" onSubmit={submit}>
          <input
            className="wall__input"
            type="text"
            value={text}
            maxLength={MAX}
            placeholder="say hi… (24 chars)"
            onChange={(e) => setText(e.target.value)}
            aria-label="Leave a message on the wall"
          />
          <button className="btn btn--solid" type="submit" data-cursor disabled={busy || !text.trim()}>
            stick it →
          </button>
        </form>
      </Reveal>

      <div className="wall__board">
        <AnimatePresence initial={false}>
          {marks.map((m) => (
            <motion.div
              key={m.id}
              className="wall__sticker"
              style={{ background: tones[m.color], rotate: tiltFor(m.id) }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {marks.length === 0 && (
          <p className="wall__empty label">be the first to leave a sticker ↑</p>
        )}
      </div>
    </section>
  )
}

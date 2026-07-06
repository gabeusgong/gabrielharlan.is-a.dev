import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { setTheme, setMuted, resolvedDark } from '../lib/prefs'
import { unlock, SECRETS, getUnlocked } from '../lib/achievements'
import { useFocusTrap } from '../lib/useFocusTrap'

type Line = { kind: 'in' | 'out'; text: string }

const BANNER = "type 'help' for commands · esc to close"

const SECTIONS: Record<string, string> = {
  about: 'about',
  skills: 'skills',
  work: 'work',
  projects: 'work',
  wall: 'wall',
  contact: 'contact',
  top: 'top',
  home: 'top',
}

const HELP = [
  'available commands:',
  '  help              this list',
  '  ls                list sections',
  '  open <section>    jump to a section (about, work, wall, contact…)',
  '  caves             open the cave photo gallery',
  '  theme <dark|light>   switch theme',
  '  mute / unmute     toggle sound',
  '  cave              toggle cave mode',
  '  resume            open my résumé',
  '  whoami            who is this',
  '  secret            your discovered secrets',
  '  clear             clear the screen',
]

const isCoarse =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

const LINES_KEY = 'gh-term-lines'
const HIST_KEY = 'gh-term-hist'
const MAX_SAVED = 200

function loadLines(): Line[] {
  try {
    const raw = localStorage.getItem(LINES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Line[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  return [{ kind: 'out', text: BANNER }]
}

function loadHist(): string[] {
  try {
    const raw = localStorage.getItem(HIST_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as string[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore */
  }
  return []
}

/* A little fake terminal / command palette. Open with "/" or ⌘K / Ctrl-K. */
export default function Terminal({ onToggleCave }: { onToggleCave: () => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [lines, setLines] = useState<Line[]>(loadLines)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const winRef = useRef<HTMLDivElement>(null)
  useFocusTrap(open, winRef)

  // command history for ↑/↓ recall (persisted across sessions)
  const hist = useRef<string[]>(loadHist())
  const histAt = useRef<number>(hist.current.length) // index into hist; length = "new line"

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing =
        t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === '/' && !typing && !open) {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // let a nav button (mobile-friendly) toggle the terminal
  useEffect(() => {
    const onToggle = () => setOpen((o) => !o)
    window.addEventListener('toggle-terminal', onToggle)
    return () => window.removeEventListener('toggle-terminal', onToggle)
  }, [])

  useEffect(() => {
    if (open) {
      unlock('terminal')
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines, open])

  // remember the transcript so reopening picks up where you left off
  useEffect(() => {
    try {
      localStorage.setItem(LINES_KEY, JSON.stringify(lines.slice(-MAX_SAVED)))
    } catch {
      /* ignore */
    }
  }, [lines])

  const print = (out: string[]) =>
    setLines((l) => [...l, ...out.map((text) => ({ kind: 'out' as const, text }))])

  const go = (id: string) => {
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' })
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const run = (raw: string) => {
    const cmd = raw.trim()
    setLines((l) => [...l, { kind: 'in', text: cmd }])
    if (!cmd) return
    // record in history (skip consecutive dupes), then persist
    if (hist.current[hist.current.length - 1] !== cmd) {
      hist.current = [...hist.current, cmd].slice(-MAX_SAVED)
      try {
        localStorage.setItem(HIST_KEY, JSON.stringify(hist.current))
      } catch {
        /* ignore */
      }
    }
    histAt.current = hist.current.length
    const [name, ...args] = cmd.toLowerCase().split(/\s+/)
    const arg = args[0]

    switch (name) {
      case 'help':
        print(HELP)
        break
      case 'ls':
        print(['about  skills  work  caves  wall  contact', 'projects: karst  itit  corne  blenz'])
        break
      case 'open':
      case 'cd':
      case 'go': {
        const id = arg && SECTIONS[arg]
        if (id) {
          print([`→ ${arg}`])
          go(id)
          setOpen(false)
        } else print([`no section "${arg ?? ''}". try: ls`])
        break
      }
      case 'about':
      case 'skills':
      case 'work':
      case 'projects':
      case 'wall':
      case 'contact':
        print([`→ ${name}`])
        go(SECTIONS[name])
        setOpen(false)
        break
      case 'caves':
        print(['opening the cave gallery…'])
        window.location.hash = '#/caves'
        setOpen(false)
        break
      case 'theme':
        if (arg === 'dark' || arg === 'light') {
          setTheme(arg)
          print([`theme → ${arg}`])
        } else {
          setTheme(resolvedDark() ? 'light' : 'dark')
          print([`theme → ${resolvedDark() ? 'light' : 'dark'}`])
        }
        break
      case 'mute':
        setMuted(true)
        print(['🔇 muted'])
        break
      case 'unmute':
        setMuted(false)
        print(['🔊 sound on'])
        break
      case 'cave':
      case 'karst':
        onToggleCave()
        print(['🔦 toggling cave mode…'])
        setOpen(false)
        break
      case 'resume':
      case 'cv':
        window.open('./Gabriel-Harlan-Resume.pdf', '_blank')
        print(['opening résumé…'])
        break
      case 'whoami':
        print(['gabriel harlan — web & ux designer, informatics @ iu.', 'above ground and below it. 🦇'])
        break
      case 'secret':
      case 'secrets': {
        const list = isCoarse ? SECRETS.filter((s) => s.id !== 'konami') : SECRETS
        const got = getUnlocked()
        const found = list.filter((s) => got.includes(s.id)).length
        print([
          `secrets · ${found}/${list.length} found`,
          ...list.map((s) =>
            got.includes(s.id) ? `  ${s.emoji} ${s.label} — ${s.hint}` : '  🔒 ???',
          ),
          found === list.length ? '🎉 you found them all. respect.' : 'keep poking around…',
        ])
        break
      }
      case 'sudo':
        if (args[0] === 'make' && args[1] === 'coffee') {
          unlock('coffee')
          print(['☕ brewing… ERROR 418: I’m a teapot. (secret unlocked)'])
        } else {
          print(['nice try. you already have root here 🧗'])
        }
        break
      case 'make':
        if (arg === 'coffee') {
          unlock('coffee')
          print(['☕ brewing… ERROR 418: I’m a teapot. (secret unlocked)'])
        } else print([`don’t know how to make "${arg ?? ''}"`])
        break
      case 'clear':
        setLines([])
        break
      case 'exit':
      case 'close':
        setOpen(false)
        break
      default:
        print([`command not found: ${name}. try "help".`])
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    run(value)
    setValue('')
  }

  // ↑/↓ walks back through previous commands
  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      if (!hist.current.length) return
      e.preventDefault()
      histAt.current = Math.max(0, histAt.current - 1)
      setValue(hist.current[histAt.current] ?? '')
    } else if (e.key === 'ArrowDown') {
      if (histAt.current >= hist.current.length) return
      e.preventDefault()
      histAt.current = Math.min(hist.current.length, histAt.current + 1)
      setValue(histAt.current === hist.current.length ? '' : hist.current[histAt.current])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="term"
          onClick={() => setOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            ref={winRef}
            tabIndex={-1}
            className="term__win"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Command terminal"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <div className="term__bar">
              <span className="term__dot" />
              <span className="term__dot" />
              <span className="term__dot" />
              <span className="term__title">gabe@gabrielharlan ~ %</span>
            </div>
            <div className="term__body" ref={bodyRef}>
              {lines.map((l, i) => (
                <div key={i} className={`term__line term__line--${l.kind}`}>
                  {l.kind === 'in' ? <span className="term__prompt">$</span> : null}
                  {l.text}
                </div>
              ))}
              <form className="term__form" onSubmit={onSubmit}>
                <span className="term__prompt">$</span>
                <input
                  ref={inputRef}
                  className="term__input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onInputKey}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal input"
                />
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

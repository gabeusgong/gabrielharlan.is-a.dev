import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { setTheme, setMotion, setMuted, resolvedDark } from '../lib/prefs'
import { unlock } from '../lib/achievements'

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
  '  motion <on|off>   animation on/off',
  '  mute / unmute     toggle sound',
  '  cave              toggle cave mode',
  '  resume            open my résumé',
  '  whoami            who is this',
  '  clear             clear the screen',
]

/* A little fake terminal / command palette. Open with "/" or ⌘K / Ctrl-K. */
export default function Terminal({ onToggleCave }: { onToggleCave: () => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: BANNER }])
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (open) {
      unlock('terminal')
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines, open])

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
      case 'motion':
        if (arg === 'off' || arg === 'reduced') {
          setMotion('reduced')
          print(['motion → reduced'])
        } else {
          setMotion('full')
          print(['motion → full'])
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
      case 'sudo':
        print(["nice try. you already have root here 🧗"])
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

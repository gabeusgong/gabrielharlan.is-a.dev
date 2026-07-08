import { useEffect, useRef, useState } from 'react'
import { profile } from '../data'
import Settings from './Settings'
import { unlock } from '../lib/achievements'

const sections = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'wall', label: 'Wall' },
  { id: 'contact', label: 'Say hi' },
  { id: 'caves', label: 'Gallery', href: '#/caves' },
]

type Props = {
  cave: boolean
  onToggleCave: () => void
  route?: string
}

export default function Nav({ cave, onToggleCave, route }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('about')
  const [menuOpen, setMenuOpen] = useState(false)
  const markRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const clicks = useRef(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // mobile menu: close on Escape or an outside click
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDoc)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDoc)
    }
  }, [menuOpen])

  // scrollspy: highlight the section currently in view. Some sections (e.g. the
  // Wall) are lazy-loaded and mount after this runs, so we re-scan via a
  // MutationObserver and observe them once they appear.
  useEffect(() => {
    const ids = ['about', 'skills', 'process', 'work', 'wall', 'contact']
    const observed = new Set<Element>()
    // root is a thin line at the viewport middle — whichever section that line
    // is inside becomes active (exactly one at a time)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const raw = (e.target as HTMLElement).id
          // map 'process' onto the Work tab (no nav link of its own)
          setActive(raw === 'process' ? 'work' : raw)
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    const scan = () => {
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && !observed.has(el)) {
          observed.add(el)
          io.observe(el)
        }
      })
    }
    scan()
    const main = document.getElementById('main') ?? document.body
    const mo = new MutationObserver(scan)
    mo.observe(main, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  // click the ✸ to sprinkle sparkles
  const sparkle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    unlock('sparkle')
    clicks.current++
    const r = markRef.current?.getBoundingClientRect()
    const cx = r ? r.left + r.width / 2 : 40
    const cy = r ? r.top + r.height / 2 : 40
    const glyphs = clicks.current >= 5 ? ['🦇', '✸', '✦'] : ['✦', '✸']
    for (let i = 0; i < (clicks.current >= 5 ? 14 : 7); i++) {
      const s = document.createElement('span')
      s.className = 'sparkle'
      s.textContent = glyphs[i % glyphs.length]
      s.style.left = `${cx}px`
      s.style.top = `${cy}px`
      const ang = Math.random() * Math.PI * 2
      const dist = 30 + Math.random() * 70
      s.style.setProperty('--dx', `${Math.cos(ang) * dist}px`)
      s.style.setProperty('--dy', `${Math.sin(ang) * dist - 20}px`)
      s.style.setProperty('--rot', `${Math.random() * 360 - 180}deg`)
      document.body.appendChild(s)
      window.setTimeout(() => s.remove(), 1000)
    }
  }

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <a href="#top" className="nav__brand">
        <span className="nav__mark" ref={markRef} onClick={sparkle} data-cursor>
          <span className="nav__mark-star">✸</span>
          <span className="nav__mark-bat">🦇</span>
        </span>
        {profile.name.split(' ')[0]}
      </a>

      <span className="nav__status">
        <span className="nav__dot" />
        {profile.status}
      </span>

      <ul className="nav__links">
        {sections.map((s) => {
          const activeId = route === 'caves' ? 'caves' : active
          return (
            <li key={s.id}>
              <a href={s.href ?? `#${s.id}`} className={activeId === s.id ? 'is-active' : ''}>
                {s.label}
              </a>
            </li>
          )
        })}
      </ul>

      <div className="nav__controls" ref={menuRef}>
        <button
          type="button"
          className={`nav__menu-btn ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="nav-sheet"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          data-cursor
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        {menuOpen && (
          <ul className="nav__sheet" id="nav-sheet">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={s.href ?? `#${s.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={(route === 'caves' ? 'caves' : active) === s.id ? 'is-active' : ''}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className={`nav__lamp ${cave ? 'nav__lamp--on' : ''}`}
          onClick={onToggleCave}
          data-cursor
          aria-pressed={cave}
          title={cave ? 'Lights on' : 'Cave mode'}
          aria-label={cave ? 'Turn off cave mode' : 'Turn on cave mode'}
        >
          {cave ? '💡' : '🔦'}
        </button>
        <Settings />
      </div>
    </nav>
  )
}

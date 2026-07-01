import { useEffect, useState } from 'react'
import { profile } from '../data'

const sections = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'caves', label: 'Caves' },
  { id: 'wall', label: 'Wall' },
  { id: 'contact', label: 'Say hi' },
]

type Props = {
  cave: boolean
  onToggleCave: () => void
}

export default function Nav({ cave, onToggleCave }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <a href="#top" className="nav__brand">
        <span className="nav__mark">✸</span>
        {profile.name.split(' ')[0]}
      </a>

      <span className="nav__status">
        <span className="nav__dot" />
        {profile.status}
      </span>

      <ul className="nav__links">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`}>{s.label}</a>
          </li>
        ))}
      </ul>

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
    </nav>
  )
}

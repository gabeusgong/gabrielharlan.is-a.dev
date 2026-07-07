import { useEffect, useRef, useState } from 'react'
import { resolvedDark, setTheme, isMuted, setMuted } from '../lib/prefs'

/* Small preferences popover in the nav: light/dark theme, motion, and sound.
   Each control flips to an explicit value (default follows the OS until touched). */
export default function Settings() {
  const [open, setOpen] = useState(false)
  const [, force] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onPref = () => force((x) => x + 1)
    const onKey = (e: KeyboardEvent) => {
      // Escape closes and returns focus to the trigger (only when open)
      if (e.key === 'Escape' && open) {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('pref-change', onPref)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('pref-change', onPref)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const dark = resolvedDark()
  const muted = isMuted()

  return (
    <div className="settings" ref={ref}>
      <button
        ref={btnRef}
        className="settings__btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Preferences"
        title="Preferences"
        data-cursor
      >
        ⚙
      </button>
      {open && (
        <div className="settings__pop" role="group" aria-label="Preferences">
          <button
            className="settings__row"
            aria-pressed={dark}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            data-cursor
          >
            <span className="settings__ico">{dark ? '🌙' : '☀️'}</span>
            Theme
            <span className="settings__val">{dark ? 'Dark' : 'Light'}</span>
          </button>
          <button
            className="settings__row"
            aria-pressed={!muted}
            onClick={() => setMuted(!muted)}
            data-cursor
          >
            <span className="settings__ico">{muted ? '🔇' : '🔊'}</span>
            Sound
            <span className="settings__val">{muted ? 'Off' : 'On'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

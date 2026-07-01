import { useEffect, useRef, useState } from 'react'

const R = 18
const C = 2 * Math.PI * R

/* A back-to-top button whose ring fills with scroll progress. Appears once
   you've scrolled down a bit. */
export default function ScrollTop() {
  const [show, setShow] = useState(false)
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      setShow(window.scrollY > 500)
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(C * (1 - p))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <button
      className={`scrolltop ${show ? 'is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      data-cursor
      aria-label="Back to top"
      title="Back to top"
    >
      <svg viewBox="0 0 44 44" className="scrolltop__ring" aria-hidden>
        <circle className="scrolltop__track" cx="22" cy="22" r={R} />
        <circle
          ref={ringRef}
          className="scrolltop__prog"
          cx="22"
          cy="22"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="scrolltop__arrow">↑</span>
    </button>
  )
}

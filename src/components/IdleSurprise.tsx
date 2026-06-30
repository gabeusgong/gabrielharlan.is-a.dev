import { useEffect, useState } from 'react'

/* After a stretch of no input, a little bat flutters across the screen.
   Any activity dismisses it and resets the timer. */
export default function IdleSurprise() {
  const [flying, setFlying] = useState(false)

  useEffect(() => {
    let timer: number | undefined
    const arm = () => {
      setFlying(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setFlying(true), 20000)
    }
    const events = ['mousemove', 'scroll', 'keydown', 'touchstart', 'pointerdown']
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    arm()
    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, arm))
    }
  }, [])

  if (!flying) return null
  // when the flight finishes, re-arm (flies again if still idle)
  return (
    <div
      className="idlebat"
      aria-hidden
      onAnimationEnd={() => setFlying(false)}
    >
      🦇
    </div>
  )
}

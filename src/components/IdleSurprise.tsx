import { useEffect, useState } from 'react'
import { unlock } from '../lib/achievements'

/* After a stretch of no input, a little bat flutters across the screen.
   Activity resets the idle timer, but a bat already in flight finishes its
   trip (it clears itself when the animation ends). */
export default function IdleSurprise() {
  const [flying, setFlying] = useState(false)

  useEffect(() => {
    let timer: number | undefined
    // reset the idle countdown on activity — but DON'T cancel a bat already in
    // flight; let it finish its trip (it clears itself on animation end).
    const arm = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        setFlying(true)
        unlock('bat')
      }, 30000)
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

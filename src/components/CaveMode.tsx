import { useEffect, useRef } from 'react'

/* "Cave mode" Easter egg: dims the whole page and turns the pointer into a
   headlamp beam that reveals content in a circle of warm light. A nod to
   Gabe's caving + the Karst project.

   On touch devices the page is frozen while active, and dragging a finger
   moves the beam (instead of scrolling the page). Exit via the nav lamp or
   the Escape key. */
export default function CaveMode({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return

    const move = (x: number, y: number) => {
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
    }
    move(window.innerWidth / 2, window.innerHeight / 2)

    const onMouse = (e: MouseEvent) => move(e.clientX, e.clientY)
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) move(t.clientX, t.clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) move(t.clientX, t.clientY)
      // keep the page still — the finger only moves the beam
      e.preventDefault()
    }

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    // freeze the page while exploring the dark
    const body = document.body
    const prevOverflow = body.style.overflow
    const prevOverscroll = body.style.overscrollBehavior
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'

    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      body.style.overflow = prevOverflow
      body.style.overscrollBehavior = prevOverscroll
    }
  }, [active])

  return <div ref={ref} className={`cavemode ${active ? 'cavemode--on' : ''}`} aria-hidden />
}

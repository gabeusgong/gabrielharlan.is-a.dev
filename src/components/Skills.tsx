import { useEffect, useRef } from 'react'
import { skills, tones } from '../data'

function Chips({ k }: { k: string }) {
  const row = [...skills, ...skills]
  return (
    <>
      {row.map((s, i) => (
        <span className="chip" key={`${k}-${i}`}>
          <span className="chip__dot" style={{ background: tones[s.tone] }} />
          {s.name}
          <span className="chip__star">✦</span>
        </span>
      ))}
    </>
  )
}

/* Two marquees that drift in opposite directions and react to scroll velocity —
   scroll fast and they rush; sit still and they gently drift. */
export default function Skills() {
  const t1 = useRef<HTMLDivElement>(null)
  const t2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tracks = [t1.current, t2.current].filter(Boolean) as HTMLDivElement[]
    if (tracks.length < 2) return

    const dirs = [-1, 1] // base drift directions
    const base = 0.5 // px/frame idle drift
    const offs = [0, 0]
    let last = window.scrollY
    let vel = 0
    let paused = false
    let raf = 0

    let widths = tracks.map((t) => t.scrollWidth / 2)
    const onResize = () => {
      widths = tracks.map((t) => t.scrollWidth / 2)
    }
    window.addEventListener('resize', onResize)

    const enter = () => (paused = true)
    const leave = () => (paused = false)
    tracks.forEach((t) => {
      t.addEventListener('mouseenter', enter)
      t.addEventListener('mouseleave', leave)
    })

    const loop = () => {
      const sy = window.scrollY
      const dv = sy - last
      last = sy
      vel = vel * 0.85 + dv * 0.15
      const sv = Math.max(-45, Math.min(45, vel)) * 0.7 // scroll boost (shared)
      tracks.forEach((t, i) => {
        if (!paused) offs[i] += base * dirs[i] + sv
        const w = widths[i] || 1
        let tx = offs[i] % w
        if (tx > 0) tx -= w
        t.style.transform = `translateX(${tx}px)`
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      tracks.forEach((t) => {
        t.removeEventListener('mouseenter', enter)
        t.removeEventListener('mouseleave', leave)
      })
    }
  }, [])

  return (
    <section className="skills" id="skills" aria-label="Skills and tools">
      <div className="skills__head section">
        <p className="label">
          <span className="tick">02</span> / the toolkit
        </p>
        <h2 className="skills__heading">Things I reach for.</h2>
      </div>
      <div className="skills__marquees">
        <div className="marquee">
          <div className="marquee__track" ref={t1}>
            <Chips k="a" />
          </div>
        </div>
        <div className="marquee">
          <div className="marquee__track" ref={t2}>
            <Chips k="b" />
          </div>
        </div>
      </div>
    </section>
  )
}

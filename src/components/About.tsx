import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { profile, hobbies, tones } from '../data'
import Reveal from './Reveal'

const CONFETTI = ['#f4502a', '#2d4df5', '#c8f02c', '#ff9ece', '#ffc23d']
const BOX_H = 540 // bordered box (same size as before)
const GAP_H = 86 // ring opening height

/* Gravity sandbox + hidden game. Stickers pile in the bordered box. You can
   only grab/fling them inside the box — the play area secretly extends above
   the top border (the Easter egg). Fling a sticker above the border and a ring
   appears on the right wall, drawn edge-on as a line with real collision posts;
   thread every sticker through the slot to win. */
function StickerPlayground() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])
  const ringRef = useRef<HTMLDivElement>(null)
  const resetRef = useRef<() => void>(() => {})

  const [active, setActive] = useState(false)
  const [score, setScore] = useState(0)
  const [won, setWon] = useState(false)

  const total = hobbies.length

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events } =
      Matter

    let width = scene.clientWidth
    let height = scene.clientHeight

    const engine = Engine.create()
    engine.gravity.y = 1.1

    const opts = { isStatic: true, render: { visible: false } }
    const T = 600
    const BIG = 1400

    const boxTopY = () => height - BOX_H // y of the visible top border
    const gapY = () => boxTopY() - 64 // ring center, just above the border
    const gapTop = () => gapY() - GAP_H / 2
    const gapBot = () => gapY() + GAP_H / 2

    const floor = Bodies.rectangle(width / 2, height + T / 2, width * 4, T, opts)
    const ceil = Bodies.rectangle(width / 2, -T / 2, width * 4, T, opts)
    const leftW = Bodies.rectangle(-T / 2, height / 2, T, height * 4, opts)
    // right wall is split into two posts, leaving the ring gap between them
    const rightUp = Bodies.rectangle(width + T / 2, gapTop() - BIG / 2, T, BIG, opts)
    const rightLo = Bodies.rectangle(width + T / 2, gapBot() + BIG / 2, T, BIG, opts)
    // score sensor just outside the gap
    const goal = Bodies.rectangle(width + 16, gapY(), 34, GAP_H, {
      isStatic: true,
      isSensor: true,
      label: 'goal',
    })
    Composite.add(engine.world, [floor, ceil, leftW, rightUp, rightLo, goal])

    const layout = () => {
      Body.setPosition(floor, { x: width / 2, y: height + T / 2 })
      Body.setPosition(ceil, { x: width / 2, y: -T / 2 })
      Body.setPosition(leftW, { x: -T / 2, y: height / 2 })
      Body.setPosition(rightUp, { x: width + T / 2, y: gapTop() - BIG / 2 })
      Body.setPosition(rightLo, { x: width + T / 2, y: gapBot() + BIG / 2 })
      Body.setPosition(goal, { x: width + 16, y: gapY() })
      if (ringRef.current) {
        ringRef.current.style.top = `${gapY()}px`
        ringRef.current.style.height = `${GAP_H}px`
      }
    }
    layout()

    const startX = () => 50 + Math.random() * Math.max(40, width - 100)
    const startY = (i: number) => boxTopY() + 40 + (i % 5) * 26

    const pairs = itemRefs.current
      .map((el, i) => {
        if (!el) return null
        const body = Bodies.rectangle(startX(), startY(i), el.offsetWidth, el.offsetHeight, {
          restitution: 0.5,
          friction: 0.5,
          frictionAir: 0.012,
          chamfer: { radius: 12 },
          angle: (Math.random() - 0.5) * 0.6,
        })
        return { el, body, i }
      })
      .filter((p): p is { el: HTMLDivElement; body: Matter.Body; i: number } => p !== null)

    Composite.add(engine.world, pairs.map((p) => p.body))
    const indexByBody = new Map<number, number>()
    pairs.forEach((p) => indexByBody.set(p.body.id, p.i))

    const burst = (x: number, y: number, n = 24) => {
      for (let k = 0; k < n; k++) {
        const p = document.createElement('span')
        p.className = 'confetti'
        const ang = Math.random() * Math.PI * 2
        const dist = 40 + Math.random() * 130
        p.style.left = `${x}px`
        p.style.top = `${y}px`
        p.style.background = CONFETTI[k % CONFETTI.length]
        p.style.setProperty('--dx', `${Math.cos(ang) * dist}px`)
        p.style.setProperty('--dy', `${Math.sin(ang) * dist - 50}px`)
        p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`)
        scene.appendChild(p)
        window.setTimeout(() => p.remove(), 1100)
      }
    }

    const scored = new Set<number>()
    let isActive = false
    const activate = () => {
      if (!isActive) {
        isActive = true
        setActive(true)
      }
    }

    const mouse = Mouse.create(scene)
    const mc = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.18, render: { visible: false } },
    })
    Composite.add(engine.world, mc)
    const release = () => {
      mc.constraint.bodyB = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mc as any).body = null
    }
    // can't grab a sticker that's already above the top border
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Events.on(mc, 'startdrag', (e: any) => {
      if (e?.body && e.body.position.y < boxTopY()) release()
    })

    Events.on(engine, 'collisionStart', (evt: Matter.IEventCollision<Matter.Engine>) => {
      if (!isActive) return
      for (const pair of evt.pairs) {
        const other =
          pair.bodyA.label === 'goal'
            ? pair.bodyB
            : pair.bodyB.label === 'goal'
              ? pair.bodyA
              : null
        if (!other) continue
        const idx = indexByBody.get(other.id)
        if (idx === undefined || scored.has(idx)) continue
        scored.add(idx)
        burst(width - 10, gapY())
        Composite.remove(engine.world, other)
        itemRefs.current[idx]?.classList.add('sticker--scored')
        setScore(scored.size)
        if (scored.size === total) {
          burst(width / 2, height * 0.4, 60)
          setWon(true)
        }
      }
    })

    type Handler = (e: Event) => void
    const m = mouse as unknown as { mousedown: Handler; mousemove: Handler; mouseup: Handler }
    scene.removeEventListener('touchstart', m.mousedown)
    scene.removeEventListener('touchmove', m.mousemove)
    scene.removeEventListener('touchend', m.mouseup)
    scene.addEventListener('touchstart', m.mousedown, { passive: false })
    scene.addEventListener('touchmove', m.mousemove, { passive: false })
    scene.addEventListener('touchend', m.mouseup, { passive: false })

    const runner = Runner.create()
    Runner.run(runner, engine)

    const sync = () => {
      const top = boxTopY()
      // if the dragged sticker rises above the border, you lose control of it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const held = (mc as any).body as Matter.Body | null
      if (held && held.position.y < top) release()
      let aboveBorder = false
      for (const { el, body } of pairs) {
        if (body.position.y < top) aboveBorder = true
        el.style.transform =
          `translate(${body.position.x - el.offsetWidth / 2}px, ` +
          `${body.position.y - el.offsetHeight / 2}px) rotate(${body.angle}rad)`
      }
      if (aboveBorder) activate() // a sticker crossed above the border → reveal the ring
    }
    Events.on(engine, 'afterUpdate', sync)

    resetRef.current = () => {
      pairs.forEach((p) => {
        if (scored.has(p.i)) Composite.add(engine.world, p.body)
        Body.setPosition(p.body, { x: startX(), y: startY(p.i) })
        Body.setVelocity(p.body, { x: 0, y: 0 })
        Body.setAngularVelocity(p.body, 0)
        p.el.classList.remove('sticker--scored')
      })
      scored.clear()
      setScore(0)
      setWon(false)
    }

    const ro = new ResizeObserver(() => {
      if (!sceneRef.current) return
      width = sceneRef.current.clientWidth
      height = sceneRef.current.clientHeight
      layout()
    })
    ro.observe(scene)

    return () => {
      ro.disconnect()
      scene.removeEventListener('touchstart', m.mousedown)
      scene.removeEventListener('touchmove', m.mousemove)
      scene.removeEventListener('touchend', m.mouseup)
      Events.off(engine, 'afterUpdate', sync)
      Runner.stop(runner)
      Composite.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [total])

  return (
    <div className="playground" ref={sceneRef}>
      {/* the bordered box (all four borders), lower portion */}
      <div className="playbox" aria-hidden />

      {/* ring on the right wall — edge-on, reads as a vertical line with rim posts */}
      <div ref={ringRef} className={`ring ${active ? 'ring--on' : ''}`} aria-hidden>
        <span className="ring__cap" />
        <span className="ring__slot" />
        <span className="ring__cap" />
      </div>

      {active && !won && (
        <div className="game-hud label">
          🎯 {score} / {total} — fling them through the ring!
        </div>
      )}

      {hobbies.map((h, i) => (
        <div
          key={h.label}
          ref={(el) => {
            itemRefs.current[i] = el
          }}
          className="sticker"
          style={{ background: tones[h.tone] }}
          data-cursor
          aria-label={h.label}
        >
          <span className="sticker__emoji">{h.emoji}</span>
          <span className="sticker__label">{h.label}</span>
          <span className="sticker__peel" />
          <span className="sticker__no">{String(i + 1).padStart(2, '0')}</span>
        </div>
      ))}

      {won && (
        <div className="game-win">
          <p className="game-win__big">YOU WON</p>
          <p className="game-win__sub">all {total} hobbies sunk 🎉</p>
          <button
            type="button"
            className="btn btn--solid"
            data-cursor
            onClick={() => resetRef.current()}
          >
            Play again ↺
          </button>
        </div>
      )}
    </div>
  )
}

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="about__grid">
        <div className="about__text">
          <Reveal>
            <p className="label about__eyebrow">
              <span className="tick">01</span> / who&apos;s this
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="about__heading">
              Hi — I&apos;m Gabe.
              <span className="about__wink"> Nice to meet you.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="about__body">{profile.about}</p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="about__stickers-col">
          <div className="about__sticker-note label">grab &amp; fling →</div>
          <StickerPlayground />
        </Reveal>
      </div>
    </section>
  )
}

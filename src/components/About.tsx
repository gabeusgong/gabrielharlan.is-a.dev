import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { profile, hobbies, tones } from '../data'
import Reveal from './Reveal'

const CONFETTI = ['#f4502a', '#2d4df5', '#c8f02c', '#ff9ece', '#ffc23d']

/* A gravity sandbox: the hobby stickers drop in, pile up, and can be grabbed
   and flung (matter-js). Hidden Easter egg: fling a sticker and a glowing ring
   target appears — sink all of them through it to win. */
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

    const wallOpts = { isStatic: true, render: { visible: false } }
    const T = 400
    const floor = Bodies.rectangle(width / 2, height + T / 2, width * 4, T, wallOpts)
    const left = Bodies.rectangle(-T / 2, height / 2, T, height * 4, wallOpts)
    const right = Bodies.rectangle(width + T / 2, height / 2, T, height * 4, wallOpts)
    Composite.add(engine.world, [floor, left, right])

    // the (initially hidden) ring target — a sensor so stickers pass through it
    const ringR = 48
    const ringPos = () => ({ x: width * 0.7, y: height * 0.3 })
    const rp = ringPos()
    const ring = Bodies.circle(rp.x, rp.y, ringR, {
      isStatic: true,
      isSensor: true,
      label: 'ring',
    })
    Composite.add(engine.world, ring)
    const placeRing = () => {
      const p = ringPos()
      Body.setPosition(ring, p)
      if (ringRef.current) {
        ringRef.current.style.left = `${p.x}px`
        ringRef.current.style.top = `${p.y}px`
      }
    }
    placeRing()

    const startY = (i: number) => -120 - i * 90
    const startX = (_i: number) =>
      Math.max(60, Math.min(width - 60, 40 + Math.random() * (width - 80)))

    const pairs = itemRefs.current
      .map((el, i) => {
        if (!el) return null
        const body = Bodies.rectangle(startX(i), startY(i), el.offsetWidth, el.offsetHeight, {
          restitution: 0.45,
          friction: 0.5,
          frictionAir: 0.015,
          chamfer: { radius: 12 },
          angle: (Math.random() - 0.5) * 0.6,
        })
        return { el, body, i }
      })
      .filter((p): p is { el: HTMLDivElement; body: Matter.Body; i: number } => p !== null)

    Composite.add(engine.world, pairs.map((p) => p.body))
    const indexByBody = new Map<number, number>()
    pairs.forEach((p) => indexByBody.set(p.body.id, p.i))

    // confetti burst at a board coordinate
    const burst = (x: number, y: number, n = 22) => {
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

    // drag + throw
    const mouse = Mouse.create(scene)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.18, render: { visible: false } },
    })
    Composite.add(engine.world, mouseConstraint)

    // a real fling (released with speed) reveals the game
    let pending: Matter.Body | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Events.on(mouseConstraint, 'enddrag', (e: any) => {
      pending = (e?.body as Matter.Body) ?? null
    })

    // scoring: sticker passes through the ring sensor
    Events.on(engine, 'collisionStart', (evt: Matter.IEventCollision<Matter.Engine>) => {
      if (!isActive) return
      for (const pair of evt.pairs) {
        const other =
          pair.bodyA.label === 'ring'
            ? pair.bodyB
            : pair.bodyB.label === 'ring'
              ? pair.bodyA
              : null
        if (!other) continue
        const idx = indexByBody.get(other.id)
        if (idx === undefined || scored.has(idx)) continue
        scored.add(idx)
        burst(other.position.x, other.position.y)
        Composite.remove(engine.world, other)
        itemRefs.current[idx]?.classList.add('sticker--scored')
        setScore(scored.size)
        if (scored.size === total) {
          burst(width / 2, height / 2, 60)
          setWon(true)
        }
      }
    })

    // touch rebind (non-passive) so dragging works on mobile
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
      for (const { el, body } of pairs) {
        el.style.transform =
          `translate(${body.position.x - el.offsetWidth / 2}px, ` +
          `${body.position.y - el.offsetHeight / 2}px) rotate(${body.angle}rad)`
      }
      if (pending) {
        if (!isActive && pending.speed > 4) activate()
        pending = null
      }
    }
    Events.on(engine, 'afterUpdate', sync)

    resetRef.current = () => {
      pairs.forEach((p) => {
        if (scored.has(p.i)) Composite.add(engine.world, p.body)
        Body.setPosition(p.body, { x: startX(p.i), y: startY(p.i) })
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
      Body.setPosition(floor, { x: width / 2, y: height + T / 2 })
      Body.setPosition(right, { x: width + T / 2, y: height / 2 })
      placeRing()
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
    <div className="stickerboard" ref={sceneRef}>
      <div ref={ringRef} className={`hoopring ${active ? 'hoopring--on' : ''}`} aria-hidden>
        <span className="hoopring__label">aim here</span>
      </div>

      {active && !won && (
        <div className="game-hud label">
          🎯 {score} / {total} — sink them through the ring!
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

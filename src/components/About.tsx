import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { profile, hobbies } from '../data'
import Reveal from './Reveal'

const base = import.meta.env.BASE_URL

// matter-js is heavy — load the physics playground (and the engine) in its own
// chunk, only once the About section scrolls near. The column has a fixed CSS
// height, so mounting later causes no layout shift.
const StickerPlayground = lazy(() => import('./StickerPlayground'))

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="section about" id="about" ref={sectionRef}>
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
          <Reveal delay={0.1}>
            <figure className="about__portrait">
              <img src={`${base}portrait.webp`} alt="Gabriel Harlan" loading="lazy" />
              <figcaption>the culprit, off the clock</figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="about__body">{profile.about}</p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="about__stickers-col">
          {show && (
            <Suspense fallback={null}>
              <StickerPlayground />
            </Suspense>
          )}
        </Reveal>
      </div>

      {/* The playground is an interactive Easter-egg game, not keyboard-operable,
          so expose the hobbies it represents to screen readers as plain text. */}
      <p className="sr-only">
        A few things I&apos;m into: {hobbies.map((h) => h.label).join(', ')}.
      </p>
    </section>
  )
}

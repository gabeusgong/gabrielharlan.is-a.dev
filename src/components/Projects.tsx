import { useState, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { projects, tones, type Project } from '../data'
import Reveal from './Reveal'
import CaseStudy from './CaseStudy'
import { unlock } from '../lib/achievements'
import { track } from '../lib/track'

// throwable cards. On touch, constrain to the x-axis so vertical scrolling
// still works while cards can still be flung sideways; full 2D on desktop.
const coarse =
  typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches
const dragMode: boolean | 'x' = coarse ? 'x' : true

function TiltCard({
  p,
  index,
  total,
  onOpen,
}: {
  p: Project
  index: number
  total: number
  onOpen?: () => void
}) {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 18 })
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 18 })

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  // the first card is the feature; also make the last card span full-width when
  // it would otherwise be orphaned alone on a 2-column row
  const big = index === 0 || (index === total - 1 && (total - 1) % 2 === 1)
  const isCase = !!(p.caseStudy && onOpen)
  const cta = isCase ? 'Read the case study' : p.href ? 'Visit' : null

  const common = {
    className: `card ${big ? 'card--feature' : ''}`,
    onMouseMove: onMove,
    onMouseLeave: reset,
    style: {
      rotateX: rx,
      rotateY: ry,
      transformPerspective: 900,
      background: 'var(--paper)',
    },
    whileHover: { y: -6 },
    'data-cursor': true,
    // fling it around — springs back to its spot
    drag: dragMode,
    dragSnapToOrigin: true,
    dragElastic: 0.5,
    dragMomentum: true,
    onDragStart: () => unlock('fling'),
    whileDrag: { scale: 1.03, zIndex: 20, cursor: 'grabbing' },
  }

  const inner = (
    <>
      <span className="card__swatch" style={{ background: tones[p.tone] }} />
      <div className="card__top">
        <span className="card__emoji">{p.emoji}</span>
        <span className="label card__year">{p.year}</span>
      </div>
      <h3 className="card__title">{p.title}</h3>
      <p className="card__blurb">{p.blurb}</p>
      <div className="card__tags">
        {p.tags.map((t) => (
          <span className="card__tag" key={t}>
            {t}
          </span>
        ))}
      </div>
      {cta && (
        <span className="card__cta">
          {cta} <span className="card__arrow">→</span>
        </span>
      )}
    </>
  )

  return (
    <Reveal delay={index * 0.06} className={big ? 'card-col card-col--wide' : 'card-col'}>
      {isCase ? (
        <motion.button type="button" onClick={onOpen} {...common}>
          {inner}
        </motion.button>
      ) : p.href ? (
        <motion.a
          href={p.href}
          target="_blank"
          rel="noreferrer"
          onClick={() => track(`visit-${p.title.split(' ')[0].toLowerCase()}`)}
          {...common}
        >
          {inner}
        </motion.a>
      ) : (
        <motion.div {...common}>{inner}</motion.div>
      )}
    </Reveal>
  )
}

export default function Projects() {
  const [study, setStudy] = useState<string | null>(null)

  return (
    <section className="section work" id="work">
      <div className="work__head">
        <Reveal>
          <p className="label">
            <span className="tick">04</span> / selected work
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="work__heading">
            Things I&apos;ve <span className="work__under">built.</span>
          </h2>
        </Reveal>
      </div>

      <div className="work__grid">
        {projects.map((p, i) => (
          <TiltCard
            key={p.title}
            p={p}
            index={i}
            total={projects.length}
            onOpen={
              p.caseStudy && p.study
                ? () => {
                    track(`case-${p.study}`)
                    setStudy(p.study!)
                  }
                : undefined
            }
          />
        ))}
      </div>

      <CaseStudy study={study} onClose={() => setStudy(null)} />
    </section>
  )
}

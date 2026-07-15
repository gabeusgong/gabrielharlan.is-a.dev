import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Reveal from './Reveal'
import { useFocusTrap } from '../lib/useFocusTrap'

const base = import.meta.env.BASE_URL
const sm = (src: string) => src.replace('.webp', '-sm.webp')

const FEATURED = {
  src: `${base}caves/main.webp`,
  alt: 'A clear turquoise cave stream winding between scalloped limestone walls',
}

// gallery order matches public/caves/cave-01..23.webp
const PHOTOS = [
  { src: `${base}caves/cave-01.webp`, alt: 'Squeezing through a tight, muddy crawl in a red helmet and headlamp' },
  { src: `${base}caves/cave-02.webp`, alt: 'A stalagmite column and draped flowstone, with cavers exploring in the distance' },
  { src: `${base}caves/cave-03.webp`, alt: 'A narrow, deeply scalloped passage carved by flowing water' },
  { src: `${base}caves/cave-04.webp`, alt: 'A dark, water-filled tunnel narrowing into the distance' },
  { src: `${base}caves/cave-05.webp`, alt: 'A tall flowstone column and rippled cave draperies' },
  { src: `${base}caves/cave-06.webp`, alt: 'A caver silhouetted against daylight at a cave entrance, reflected in the water' },
  { src: `${base}caves/cave-07.webp`, alt: 'Two cavers lighting up a chamber marked with old signatures' },
  { src: `${base}caves/cave-08.webp`, alt: 'A massive stalagmite-and-column formation rising from the cave floor' },
  { src: `${base}caves/cave-09.webp`, alt: 'Historic signatures written on the cave ceiling in the 1800s' },
  { src: `${base}caves/cave-10.webp`, alt: 'A headlamp selfie deep inside the cave' },
  { src: `${base}caves/cave-11.webp`, alt: 'A bright orange cave salamander clinging to a wet wall' },
  { src: `${base}caves/cave-12.webp`, alt: 'Rippling tan flowstone draperies coating the cave wall' },
  { src: `${base}caves/cave-13.webp`, alt: 'A dog sitting on a sandy cave floor beneath a low ceiling' },
  { src: `${base}caves/cave-14.webp`, alt: 'A cascade of pale flowstone spilling down the rock' },
  { src: `${base}caves/cave-15.webp`, alt: 'A dense field of thin soda-straw stalactites hanging from the ceiling' },
  { src: `${base}caves/cave-16.webp`, alt: 'Standing at the base of a frozen waterfall at a cave entrance in winter' },
  { src: `${base}caves/cave-17.webp`, alt: 'Rimstone terraces on the cave floor scattered with fallen autumn leaves' },
  { src: `${base}caves/cave-18.webp`, alt: 'A still cave pool beneath dark overhanging rock' },
  { src: `${base}caves/cave-19.webp`, alt: 'A large domed flowstone formation catching the light' },
  { src: `${base}caves/cave-20.webp`, alt: 'Layered rock strata in a low, wide crawlway' },
  { src: `${base}caves/cave-21.webp`, alt: 'A caver silhouetted while climbing up through a tight passage' },
  { src: `${base}caves/cave-22.webp`, alt: 'A glossy column formation reflected in a shallow pool' },
  { src: `${base}caves/cave-23.webp`, alt: 'Stalactites hanging above a floor bristling with stalagmites' },
]

export default function CaveGallery() {
  const [idx, setIdx] = useState<number | null>(null)
  const open = idx !== null
  const lightboxRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const touchX = useRef<number | null>(null)
  useFocusTrap(open, lightboxRef)

  const close = useCallback(() => setIdx(null), [])
  const prev = useCallback(
    () => setIdx((i) => (i === null ? i : (i - 1 + PHOTOS.length) % PHOTOS.length)),
    [],
  )
  const next = useCallback(
    () => setIdx((i) => (i === null ? i : (i + 1) % PHOTOS.length)),
    [],
  )

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, prev, next])

  // preload the neighbouring full-size images so arrow/swipe nav is instant
  useEffect(() => {
    if (idx === null) return
    const n = PHOTOS.length
    for (const i of [(idx + 1) % n, (idx - 1 + n) % n]) {
      const im = new Image()
      im.src = PHOTOS[i].src
    }
  }, [idx])

  // keep the active filmstrip thumbnail centred as you navigate
  useEffect(() => {
    if (idx === null) return
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-thumb="${idx}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [idx])

  // touch swipe left/right to move between photos
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 45) (dx < 0 ? next : prev)()
  }

  // this is its own page — start at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="cavespage" id="caves">
      <div className="cavespage__inner section">
        <Reveal>
          <p className="label">
            <span className="tick">✦</span> underground
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="caves__heading">
            Off the clock, <span className="caves__word">underground.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="caves__sub">
            Weekends with the Bloomington Indiana Grotto and beyond — the karst country that inspired
            Karst. Every shot my own, mud and all. Tap any photo to open it.
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          <figure className="caves__feature">
            <img
              src={FEATURED.src}
              srcSet={`${sm(FEATURED.src)} 640w, ${FEATURED.src} 1280w`}
              sizes="(max-width: 680px) 92vw, 620px"
              alt={FEATURED.alt}
              width={1400}
              height={1867}
              loading="lazy"
            />
            <figcaption>{FEATURED.alt}.</figcaption>
          </figure>
        </Reveal>

        <div className="caves__grid">
          {PHOTOS.map((p, i) => (
            <button
              key={p.src}
              type="button"
              className="caves__item"
              data-cursor
              onClick={() => setIdx(i)}
              aria-label={`Open photo: ${p.alt}`}
            >
              <img
                src={p.src}
                srcSet={`${sm(p.src)} 640w, ${p.src} 1280w`}
                sizes="(max-width: 640px) 45vw, 240px"
                alt={p.alt}
                loading="lazy"
              />
              <span className="caves__cap" aria-hidden="true">
                {p.alt}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && idx !== null && (
          <motion.div
            ref={lightboxRef}
            tabIndex={-1}
            className="lightbox"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <button className="lightbox__close" onClick={close} data-cursor aria-label="Close viewer">
              ✕
            </button>
            <button
              className="lightbox__nav lightbox__nav--prev"
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              data-cursor
              aria-label="Previous photo"
            >
              ‹
            </button>
            <motion.img
              key={PHOTOS[idx].src}
              className="lightbox__img"
              src={PHOTOS[idx].src}
              alt={PHOTOS[idx].alt}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />
            <button
              className="lightbox__nav lightbox__nav--next"
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              data-cursor
              aria-label="Next photo"
            >
              ›
            </button>

            <div
              className="lightbox__strip"
              ref={stripRef}
              onClick={(e) => e.stopPropagation()}
              aria-label="All photos"
            >
              {PHOTOS.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  data-thumb={i}
                  className={`lightbox__thumb ${i === idx ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIdx(i)
                  }}
                  data-cursor
                  aria-label={`Photo ${i + 1}: ${p.alt}`}
                  aria-current={i === idx}
                >
                  <img src={sm(p.src)} alt="" loading="lazy" />
                </button>
              ))}
            </div>

            <div className="lightbox__meta">
              <span className="lightbox__count label">
                {idx + 1} / {PHOTOS.length}
              </span>
              <span className="lightbox__cap">{PHOTOS[idx].alt}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

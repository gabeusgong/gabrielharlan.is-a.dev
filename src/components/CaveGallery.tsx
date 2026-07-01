import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Reveal from './Reveal'

const base = import.meta.env.BASE_URL

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

  return (
    <section className="section caves" id="caves">
      <Reveal>
        <p className="label">
          <span className="tick">04</span> / underground
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
          <img src={FEATURED.src} alt={FEATURED.alt} loading="lazy" />
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
            <img src={p.src} alt={p.alt} loading="lazy" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && idx !== null && (
          <motion.div
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
            <div className="lightbox__meta">
              <span className="lightbox__count label">
                {idx + 1} / {PHOTOS.length}
              </span>
              <span className="lightbox__cap">{PHOTOS[idx].alt}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

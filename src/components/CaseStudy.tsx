import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const base = import.meta.env.BASE_URL

const shots = [
  {
    src: `${base}karst/map.png`,
    cap: 'Privacy-first map — sensitive cave entrances are fuzzed to an approximate area, never an exact pin.',
  },
  {
    src: `${base}karst/explore.png`,
    cap: 'Field guide — browse wild & show caves with conditions and community photos.',
  },
  {
    src: `${base}karst/bc-trail.png`,
    cap: 'AR “breadcrumb” trails — gamified routes that earn XP and badges.',
  },
  {
    src: `${base}karst/cave.png`,
    cap: 'Cave detail — access notes, seasonal closures, and saved-cave hearts.',
  },
  {
    src: `${base}karst/cave-show.png`,
    cap: 'Show-cave listing — the public, beginner-friendly entry point.',
  },
]

const decisions = [
  {
    h: 'Protect the caves, not just the user',
    p: 'Wild-cave locations are sensitive — over-sharing them invites damage and danger. So the map fuzzes entrances to a general area and gates exact coordinates behind grotto membership, rather than refusing to show anything at all.',
  },
  {
    h: 'Make conservation part of the loop',
    p: 'A dedicated guide to bats and White-Nose Syndrome decontamination lives right next to seasonal-closure notices — surfacing the responsibility instead of burying it in a policy page.',
  },
  {
    h: 'Earn engagement with gamification',
    p: 'AR breadcrumb trails, XP, badges, and a leaderboard turn logging a trip into something worth coming back for — without cluttering the core “find a cave” task.',
  },
  {
    h: 'Meet cavers where they are',
    p: 'Anonymous by default, upgraded to phone auth only when you save or post. Ships as both a installable web app and an Android build for offline-ish field use.',
  },
]

export default function CaseStudy({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cs__overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.article
            className="cs__panel"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <button className="cs__close" onClick={onClose} data-cursor aria-label="Close">
              ✕
            </button>

            <header className="cs__head">
              <p className="label">
                <span className="tick">CASE STUDY</span> · 2026
              </p>
              <h2 className="cs__title">
                Karst <span className="cs__bat">🦇</span>
              </h2>
              <p className="cs__lede">
                A caver&apos;s field guide to the wild and show caves of southern
                Indiana&apos;s karst country — born out of weekends with the
                Bloomington Indiana Grotto.
              </p>
              <div className="cs__meta">
                <span>
                  <strong>Role</strong> Design &amp; build (solo)
                </span>
                <span>
                  <strong>Stack</strong> Next.js · Firebase · Leaflet
                </span>
                <span>
                  <strong>Ships as</strong> Web app + Android
                </span>
              </div>
              <a
                className="btn btn--solid cs__live"
                href="https://spelunk-a-dunk.web.app"
                target="_blank"
                rel="noreferrer"
                data-cursor
              >
                Visit the live app →
              </a>
            </header>

            <section className="cs__block">
              <h3 className="cs__h3">The problem</h3>
              <p className="cs__body">
                Cave info is scattered, inconsistent, and often risky to publish:
                spreadsheets and forum posts either expose fragile wild caves to
                anyone, or lock everything down so newcomers can&apos;t find the
                beginner-friendly show caves. I wanted one field guide that respects
                both the caves and the people exploring them.
              </p>
            </section>

            <section className="cs__block">
              <div className="cs__spotlight">
                <span className="cs__spotlight-tag label">★ Signature feature</span>
                <h3 className="cs__spotlight-h">Dead reckoning, where GPS can&apos;t reach</h3>
                <p>
                  Caves swallow GPS, so Karst leans on <strong>dead reckoning</strong> —
                  estimating your position from the phone&apos;s motion sensors and your
                  last known fix instead of satellites. Drop a marker at the entrance and
                  it keeps tracking your path underground, so the breadcrumb trail can
                  always lead you back out.
                </p>
              </div>
            </section>

            <section className="cs__block">
              <h3 className="cs__h3">Key decisions</h3>
              <div className="cs__decisions">
                {decisions.map((d) => (
                  <div className="cs__decision" key={d.h}>
                    <h4>{d.h}</h4>
                    <p>{d.p}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="cs__block">
              <h3 className="cs__h3">A look inside</h3>
              <div className="cs__gallery">
                {shots.map((s) => (
                  <figure className="cs__shot" key={s.src}>
                    <div className="cs__phone">
                      <img src={s.src} alt={s.cap} loading="lazy" />
                    </div>
                    <figcaption>{s.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <section className="cs__block">
              <h3 className="cs__h3">Where it stands</h3>
              <p className="cs__body">
                Karst is a live, evolving build — currently a server-rendered
                Next.js app on Firebase Hosting with Firestore-backed cave data,
                comments, grottos, and gamification, plus a downloadable Android
                version. It started as a way to learn modern full-stack patterns and
                turned into the tool I actually wanted as a caver.
              </p>
            </section>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

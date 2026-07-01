import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const base = import.meta.env.BASE_URL

type Shot = { src: string; cap: string }
type Decision = { h: string; p: string }

type Study = {
  slug: string
  title: ReactNode
  year: string
  lede: ReactNode
  meta: { label: string; value: ReactNode }[]
  live?: { href: string; label: string }
  problem: ReactNode
  spotlight: { tag: string; h: string; body: ReactNode }
  decisions: Decision[]
  gallery?: { heading: string; shots: Shot[] }
  diagram?: { heading: string; node: ReactNode }
  closing: { h: string; body: ReactNode }
}

/* ---- ITIT data-model flow (stands in for screenshots we don't have) ---- */
function ITITDiagram() {
  const steps = ['Deployments', 'Locations', 'Items', 'Linked Items']
  return (
    <div className="cs__flow" aria-hidden>
      <div className="cs__sync">
        <span className="cs__sync-node cs__sync-node--hw">📟 IoT tracker</span>
        <span className="cs__sync-link">⇄ real-time sync ⇄</span>
        <span className="cs__sync-node cs__sync-node--web">💻 Web app</span>
      </div>
      <div className="cs__hier">
        {steps.map((s, i) => (
          <span className="cs__hier-step" key={s}>
            {s}
            {i < steps.length - 1 && <span className="cs__hier-arrow">→</span>}
          </span>
        ))}
      </div>
      <p className="cs__flow-cap label">
        the data model mirrors how a shop already organizes its gear · CSV export → Excel
      </p>
    </div>
  )
}

/* ---- Corne keymap: an interactive, tabbed layer diagram ---- */
const KB_LAYERS = [
  {
    name: 'Base',
    note: 'QWERTY with Shift / Ctrl on the outer columns. The thumbs carry the layer holds, Space and Enter — there’s no dedicated Esc, it lives on the layers.',
    rows: [
      ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '⌫'],
      ['Shift', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
      ['Ctrl', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'GUI'],
    ],
    thumbs: ['Raise', '', 'Space', 'Enter', 'Lower', 'GUI'],
  },
  {
    name: 'Lower',
    note: 'The utility layer — five Bluetooth profiles, an arrow cluster, media transport (play/prev/next), and undo / redo.',
    rows: [
      ['Esc', '', '', '', '', 'BTclr', 'BT1', 'BT2', 'BT3', 'BT4', 'BT5', '⌫'],
      ['Shift', '', '', '', '', '', '←', '↑', '→', 'Undo', 'Redo', 'Caps'],
      ['Ctrl', 'GUI', '', '', '', '', '', '↓', '', 'Play', 'Prev', 'Next'],
    ],
    thumbs: ['', '', 'Space', 'Enter', '', ''],
  },
  {
    name: 'Raise',
    note: 'Numbers and the full symbol set — brackets, braces, operators, pipe and tilde.',
    rows: [
      ['Esc', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '⌫'],
      ['Shift', '1', '2', '3', '4', '5', '-', '=', '[', ']', '\\', "'"],
      ['Ctrl', '6', '7', '8', '9', '0', '_', '+', '{', '}', '|', '~'],
    ],
    thumbs: ['', '', 'Space', 'Enter', '', ''],
  },
]

function KeyboardLayers() {
  const [i, setI] = useState(0)
  const L = KB_LAYERS[i]
  const half = (keys: string[], thumb = false) => (
    <div className={`kb__half ${thumb ? 'kb__half--thumbs' : ''}`}>
      {keys.map((k, ci) => (
        <span key={ci} className={`kb__key ${thumb ? 'kb__key--thumb' : ''} ${k === '' ? 'is-blank' : ''}`}>
          {k}
        </span>
      ))}
    </div>
  )
  return (
    <div className="kb">
      <div className="kb__tabs" role="tablist" aria-label="Keymap layers">
        {KB_LAYERS.map((l, idx) => (
          <button
            key={l.name}
            type="button"
            role="tab"
            aria-selected={idx === i}
            data-cursor
            className={`kb__tab ${idx === i ? 'is-active' : ''}`}
            onClick={() => setI(idx)}
          >
            {l.name}
          </button>
        ))}
      </div>
      <div className="kb__grid" role="img" aria-label={`${L.name} layer keymap`}>
        {L.rows.map((row, r) => (
          <div className="kb__row" key={r}>
            {half(row.slice(0, 6))}
            {half(row.slice(6))}
          </div>
        ))}
        <div className="kb__row kb__row--thumbs">
          {half(L.thumbs.slice(0, 3), true)}
          {half(L.thumbs.slice(3), true)}
        </div>
      </div>
      <p className="kb__note label">{L.note}</p>
      <p className="kb__encoder label">🎛 rotary encoder → volume up / down</p>
    </div>
  )
}

const STUDIES: Record<string, Study> = {
  karst: {
    slug: 'karst',
    title: (
      <>
        Karst <span className="cs__bat">🦇</span>
      </>
    ),
    year: '2026',
    lede: (
      <>
        A caver&apos;s field guide to the wild and show caves of southern Indiana&apos;s karst
        country — born out of weekends with the Bloomington Indiana Grotto.
      </>
    ),
    meta: [
      { label: 'Role', value: 'Design & build (solo)' },
      { label: 'Stack', value: 'Next.js · Firebase · Leaflet' },
      { label: 'Ships as', value: 'Web app + Android' },
    ],
    live: { href: 'https://spelunk-a-dunk.web.app', label: 'Visit the live app →' },
    problem: (
      <>
        Cave info is scattered, inconsistent, and often risky to publish: spreadsheets and forum
        posts either expose fragile wild caves to anyone, or lock everything down so newcomers
        can&apos;t find the beginner-friendly show caves. I wanted one field guide that respects
        both the caves and the people exploring them.
      </>
    ),
    spotlight: {
      tag: '★ Signature feature',
      h: "Dead reckoning, where GPS can't reach",
      body: (
        <>
          Caves swallow GPS, so Karst leans on <strong>dead reckoning</strong> — estimating your
          position from the phone&apos;s motion sensors and your last known fix instead of
          satellites. Drop a marker at the entrance and it keeps tracking your path underground,
          so the breadcrumb trail can always lead you back out.
        </>
      ),
    },
    decisions: [
      {
        h: 'Protect the caves, not just the user',
        p: 'Wild-cave locations are sensitive — over-sharing them invites damage and danger. So the map fuzzes entrances to a general area and gates exact coordinates behind grotto membership, rather than refusing to show anything at all.',
      },
      {
        h: 'Make conservation part of the loop',
        p: 'A dedicated guide to bats and White-Nose Syndrome decontamination lives right next to seasonal-closure notices — surfacing the responsibility instead of burying it in a policy page.',
      },
      {
        h: 'Built around grotto groups',
        p: 'Caving is social and local, so Karst is organized around grottos — regional caving clubs. Members form groups, share trip photos and events, and unlock trusted access like exact coordinates and member-only caves.',
      },
      {
        h: 'Earn engagement with gamification',
        p: 'AR breadcrumb trails, XP, badges, and a leaderboard turn logging a trip into something worth coming back for — without cluttering the core “find a cave” task.',
      },
    ],
    gallery: {
      heading: 'A look inside',
      shots: [
        {
          src: `${base}karst/map.webp`,
          cap: 'Privacy-first map — sensitive cave entrances are fuzzed to an approximate area, never an exact pin.',
        },
        {
          src: `${base}karst/explore.webp`,
          cap: 'Field guide — browse wild & show caves with conditions and community photos.',
        },
        {
          src: `${base}karst/bc-trail.webp`,
          cap: 'AR “breadcrumb” trails — gamified routes that earn XP and badges.',
        },
        {
          src: `${base}karst/cave.webp`,
          cap: 'Cave detail — access notes, seasonal closures, and saved-cave hearts.',
        },
        {
          src: `${base}karst/dead-reckoning.webp`,
          cap: 'Dead reckoning — a GPS-free “way-out” trail you record to retrace your steps deep in the cave.',
        },
      ],
    },
    closing: {
      h: 'Where it stands',
      body: (
        <>
          Karst is a live, evolving build — currently a server-rendered Next.js app on Firebase
          Hosting with Firestore-backed cave data, comments, grottos, and gamification, plus a
          downloadable Android version. It started as a way to learn modern full-stack patterns
          and turned into the tool I actually wanted as a caver.
        </>
      ),
    },
  },

  itit: {
    slug: 'itit',
    title: (
      <>
        ITIT <span className="cs__cube">📦</span>
      </>
    ),
    year: '2025',
    lede: (
      <>
        <strong>IT Inventory Tracker</strong> — a semi-automated hardware tracker for small
        businesses, built with a four-person Scrum team for the IU Informatics senior capstone.
      </>
    ),
    meta: [
      { label: 'Role', value: 'Web design & front-end' },
      { label: 'Team', value: '4 · Agile / Scrum' },
      { label: 'Stack', value: 'PHP · MySQL · JavaScript · IoT' },
    ],
    live: {
      href: 'https://zion.luddy.indiana.edu/info-capstone-2026/itit',
      label: 'See the capstone booth →',
    },
    problem: (
      <>
        Small businesses track their hardware in Google Sheets, notes apps, or on paper —
        approaches that are quick to start but error-prone and easy to outgrow. Enterprise systems
        like SAP solve it, but they&apos;re expensive and far more than a small shop needs. ITIT
        bridges that gap: a <strong>scalable, affordable, semi-automated</strong> tracker sized for
        small teams.
      </>
    ),
    spotlight: {
      tag: '★ Signature feature',
      h: 'A physical tracker that syncs to the web',
      body: (
        <>
          ITIT pairs a physical <strong>IoT tracker device</strong> with a web app, kept in{' '}
          <strong>real-time sync</strong>. Update inventory in the physical world and the database
          stays in agreement — no manual reconciliation, and no enterprise price tag.
        </>
      ),
    },
    decisions: [
      {
        h: 'Model how businesses actually organize',
        p: 'The app mirrors the real hierarchy — Deployments → Locations → Items → Linked Items — so the data structure matches how a shop already thinks about its gear.',
      },
      {
        h: 'Drop into existing workflows',
        p: 'CSV export to Excel and Google Login let a team adopt ITIT without migrating their data or learning a new account system.',
      },
      {
        h: 'Semi-automated on purpose',
        p: 'The hardware handles the tedious capture while people stay in the loop for judgment calls — cheaper and more trustworthy than a full enterprise RFID rollout.',
      },
      {
        h: 'Ship as a team, on sprints',
        p: 'Four Informatics students, Agile/Scrum, defined roles. I owned the web design and front-end — turning the team’s requirements into the interface users actually touch.',
      },
    ],
    diagram: { heading: 'How it fits together', node: <ITITDiagram /> },
    closing: {
      h: 'Where it landed',
      body: (
        <>
          ITIT was built and demoed for the IU Informatics Capstone showcase, with a live
          deployment for testing (teammates: Eric Walker, Tanner Wathen, and Nick Delgado). My
          biggest takeaways were designing inside a team&apos;s constraints and shipping a real
          product against a hard deadline.
        </>
      ),
    },
  },

  corne: {
    slug: 'corne',
    title: (
      <>
        Corne 42 <span className="cs__cube">⌨️</span>
      </>
    ),
    year: '2024',
    lede: (
      <>
        A hand-built <strong>split, wireless, low-profile Corne</strong> — 42 ortholinear keys on
        custom ZMK firmware. My answer to a simple itch: what if I made the keyboard I code on?
      </>
    ),
    meta: [
      { label: 'Role', value: 'Design, build & firmware' },
      { label: 'Keys', value: '42 · ortholinear · split' },
      { label: 'Runs', value: 'ZMK · nice!nano v2 · BLE' },
    ],
    live: {
      href: 'https://github.com/gabeusgong/zmk-config',
      label: 'See the ZMK config →',
    },
    problem: (
      <>
        After years of building custom mechanical keyboards, a normal board stopped being a
        challenge. I wanted to keep <strong>working with my hands</strong> and to end up with
        something genuinely useful: an <strong>ergonomic keyboard tuned for faster coding</strong>,
        built from the switches up. A 42-key wireless Corne was the deep end — so I jumped in.
      </>
    ),
    spotlight: {
      tag: '★ Signature build',
      h: 'Hand-wired — and built to come apart',
      body: (
        <>
          The nice!nano v2 sits on <strong>hotswap sockets</strong>, so the controller pops out
          without desoldering, and each half has a <strong>magnetic USB-C port</strong> — the cable
          detaches with a tug while the port stays put. The hardest parts were entirely by hand:
          wiring the battery to a physical power switch, and wiring in the rotary encoders.
        </>
      ),
    },
    decisions: [
      {
        h: '42 keys, on purpose',
        p: 'Dropping to an ortholinear 3×6 + 3-thumb layout means everything lives on layers instead of a finger stretch. Going from staggered QWERTY to ortho low-profile was a real re-learning curve — but it keeps my hands on the home row.',
      },
      {
        h: 'Wireless, via ZMK',
        p: 'A nice!nano v2 runs ZMK ("Gabe\'s Corne") over Bluetooth, with five pairing profiles to jump between machines, and firmware built and flashed straight from GitHub Actions — no toolchain to babysit. A small OLED on each half reports the active layer, output/Bluetooth status, battery %, and live WPM.',
      },
      {
        h: 'Tuned by feel, not just looks',
        p: 'Kailh Choc low-profile Silver linears, lubed and finished with an o-ring gummy mod and a tape mod for sound and feel. Blank 3D-printed low-profile keycaps and a 3D-printed case round it out.',
      },
      {
        h: 'A volume knob, wired by hand',
        p: 'Hand-wired rotary encoders, driven through ZMK’s EC11 support — a sensor-binding maps the knob to volume up/down, so the finest bit of soldering on the board turns into the most tactile control on it.',
      },
    ],
    diagram: { heading: 'The keymap', node: <KeyboardLayers /> },
    closing: {
      h: 'Where it stands',
      body: (
        <>
          It&apos;s the board I type this on — three clean layers (base, lower, raise) that turn 42
          keys into a full layout without reaching. The build taught me as much about patience and
          hand-wiring as about ZMK; next up is bringing the encoders online and continuing to
          tune the feel.
        </>
      ),
    },
  },
}

export default function CaseStudy({
  study,
  onClose,
}: {
  study: string | null
  onClose: () => void
}) {
  const open = study !== null
  const data = study ? STUDIES[study] : null

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
      {open && data && (
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
            role="dialog"
            aria-modal="true"
            aria-label={`${data.slug} case study`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <button className="cs__close" onClick={onClose} data-cursor aria-label="Close case study">
              ✕
            </button>

            <header className="cs__head">
              <p className="label">
                <span className="tick">CASE STUDY</span> · {data.year}
              </p>
              <h2 className="cs__title">{data.title}</h2>
              <p className="cs__lede">{data.lede}</p>
              <div className="cs__meta">
                {data.meta.map((m) => (
                  <span key={m.label}>
                    <strong>{m.label}</strong> {m.value}
                  </span>
                ))}
              </div>
              {data.live && (
                <a
                  className="btn btn--solid cs__live"
                  href={data.live.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor
                >
                  {data.live.label}
                </a>
              )}
            </header>

            <section className="cs__block">
              <h3 className="cs__h3">The problem</h3>
              <p className="cs__body">{data.problem}</p>
            </section>

            <section className="cs__block">
              <div className="cs__spotlight">
                <span className="cs__spotlight-tag label">{data.spotlight.tag}</span>
                <h3 className="cs__spotlight-h">{data.spotlight.h}</h3>
                <p>{data.spotlight.body}</p>
              </div>
            </section>

            <section className="cs__block">
              <h3 className="cs__h3">Key decisions</h3>
              <div className="cs__decisions">
                {data.decisions.map((d) => (
                  <div className="cs__decision" key={d.h}>
                    <h4>{d.h}</h4>
                    <p>{d.p}</p>
                  </div>
                ))}
              </div>
            </section>

            {data.diagram && (
              <section className="cs__block">
                <h3 className="cs__h3">{data.diagram.heading}</h3>
                {data.diagram.node}
              </section>
            )}

            {data.gallery && (
              <section className="cs__block">
                <h3 className="cs__h3">{data.gallery.heading}</h3>
                <div className="cs__gallery">
                  {data.gallery.shots.map((s) => (
                    <figure className="cs__shot" key={s.src}>
                      <div className="cs__phone">
                        <img src={s.src} alt={s.cap} loading="lazy" />
                      </div>
                      <figcaption>{s.cap}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            <section className="cs__block">
              <h3 className="cs__h3">{data.closing.h}</h3>
              <p className="cs__body">{data.closing.body}</p>
            </section>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

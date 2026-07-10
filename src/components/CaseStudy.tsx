import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { isMuted } from '../lib/prefs'
import { useFocusTrap } from '../lib/useFocusTrap'
import TypingTest from './TypingTest'

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
  gallery?: { heading: string; shots: Shot[]; frame?: 'phone' | 'browser' }
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

/* ---- TRACI SMS gateway: a request-flow diagram ---- */
function SMSGatewayDiagram() {
  const steps = ['Webhook ACKs', 'Worker calls agent', 'Classify events', 'Render → SMS']
  return (
    <div className="cs__flow" aria-hidden>
      <div className="cs__sync">
        <span className="cs__sync-node cs__sync-node--hw">📱 Texter</span>
        <span className="cs__sync-link">⇄ SMS · Twilio ⇄</span>
        <span className="cs__sync-node cs__sync-node--web">🤖 TRACI agent</span>
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
        the gateway owns the conversation · the AI agent stays untouched
      </p>
    </div>
  )
}

/* ---- Corne keymap: an interactive, tabbed layer diagram ---- */
const KB_LAYERS = [
  {
    name: 'Base',
    note: 'QWERTY with Shift / Ctrl on the outer columns. The thumbs carry the layer holds, Space, Enter, and a media play/pause key — there’s no dedicated Esc, it lives on the layers.',
    rows: [
      ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '⌫'],
      ['Shift', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
      ['Ctrl', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'GUI'],
    ],
    thumbs: ['Raise', '', 'Space', 'Enter', 'Lower', '⏯'],
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

// A synthesized mechanical-keyboard "thock" — a low sine body plus a short
// filtered-noise click. No audio files; the AudioContext is created lazily on
// the first click (a user gesture, so autoplay policies are satisfied).
let audioCtx: AudioContext | null = null
function thock() {
  if (isMuted()) return
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    audioCtx = audioCtx || new AC()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    const detune = 0.9 + Math.random() * 0.2 // slight per-press variation

    // low "body" — a quick downward sine thump
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(175 * detune, now)
    osc.frequency.exponentialRampToValueAtTime(85 * detune, now + 0.06)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.45, now + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.13)
    osc.connect(g).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.14)

    // "tok" transient — a short burst of low-passed noise
    const dur = 0.028
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let s = 0; s < data.length; s++) data[s] = (Math.random() * 2 - 1) * (1 - s / data.length)
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 2000 * detune
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.22, now)
    ng.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    noise.connect(lp).connect(ng).connect(ctx.destination)
    noise.start(now)
    noise.stop(now + dur)
  } catch {
    /* audio unavailable — keys still animate */
  }
}

function KeyboardLayers() {
  const [i, setI] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)
  const L = KB_LAYERS[i]

  // light up a key when the typing test (or a real press) reports it
  useEffect(() => {
    const onKey = (e: Event) => {
      const raw = (e as CustomEvent<string>).detail
      const target = raw === ' ' ? 'space' : raw.toLowerCase()
      if (/^[a-z]$/.test(target) || target === 'space') setI(0) // letters live on Base
      requestAnimationFrame(() => {
        const el = gridRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(target)}"]`)
        if (!el) return
        el.classList.add('kb__key--hit')
        window.setTimeout(() => el.classList.remove('kb__key--hit'), 170)
      })
    }
    window.addEventListener('corne-key', onKey)
    return () => window.removeEventListener('corne-key', onKey)
  }, [])

  const half = (keys: string[], thumb = false) => (
    <div className={`kb__half ${thumb ? 'kb__half--thumbs' : ''}`}>
      {keys.map((k, ci) => (
        <button
          type="button"
          key={ci}
          data-cursor
          data-key={k === '' ? undefined : k.toLowerCase()}
          onPointerDown={thock}
          aria-label={k || 'blank key'}
          className={`kb__key ${thumb ? 'kb__key--thumb' : ''} ${k === '' ? 'is-blank' : ''}`}
        >
          {k}
        </button>
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
      <div className="kb__grid" ref={gridRef} role="group" aria-label={`${L.name} layer keymap`}>
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
      <p className="kb__encoder label">🎛 rotary encoder → page up / down · 🔊 tap a key</p>
    </div>
  )
}

const STUDIES: Record<string, Study> = {
  tracisms: {
    slug: 'tracisms',
    title: (
      <>
        TRACI SMS Gateway <span className="cs__cube">💬</span>
      </>
    ),
    year: '2026',
    lede: (
      <>
        An <strong>SMS gateway</strong> that lets customers text Tire Rack&apos;s TRACI AI tire
        agent — built as an Innovation &amp; AI intern. Inbound texts reach the agent; its replies
        are rendered back into SMS.
      </>
    ),
    meta: [
      { label: 'Role', value: 'Design, build & deploy (solo)' },
      { label: 'Stack', value: 'Python · FastAPI · Cloud Run' },
      { label: 'Channel', value: 'Twilio SMS · RCS-ready' },
    ],
    problem: (
      <>
        TRACI, Tire Rack&apos;s AI tire agent, lived on the web — but plenty of customers would
        rather just <strong>text</strong>. The goal: let anyone message a plain phone number and get
        the full agent — tire questions, comparisons, sizes, recommendations — over SMS, without
        modifying the agent itself.
      </>
    ),
    spotlight: {
      tag: '★ The hard part',
      h: 'The vehicle picker, reinvented for text',
      body: (
        <>
          The website resolves your car with a year/make/model <strong>picker widget</strong> — which
          can&apos;t render in a text, and the agent can&apos;t reliably parse a vehicle from free
          text. So the gateway resolves it itself: a <strong>numbered-reply drill-down</strong> over
          the site&apos;s vehicle APIs that walks Year → Make → Model → trim and auto-supplies the
          factory tire size, so a texter never needs to know their own size.
        </>
      ),
    },
    decisions: [
      {
        h: 'Sit in front, change nothing behind',
        p: 'The gateway is only a caller of the agent’s message endpoint — the AI agent is untouched. Because that endpoint is stateless, the gateway owns conversation continuity by keying each thread to the texter (a hashed phone number), so a series of texts still feels like one continuous chat.',
      },
      {
        h: 'Render an event stream into a text',
        p: 'The agent answers with a raw, ordered stream of “events” — text, cards, UI bits. The gateway classifies each: text to keep, noise to drop, cards to reformat for SMS. It uses a denylist rather than an allowlist, so a brand-new kind of agent card is never silently dropped — only ever reformatted.',
      },
      {
        h: 'Answer fast, even when the model is slow',
        p: 'Agent replies can take many seconds. The webhook acknowledges the carrier immediately and hands off to a background worker that calls the agent and sends the reply — so inbound texts never time out waiting on inference.',
      },
      {
        h: 'Production-shaped from day one',
        p: 'Python/FastAPI on Google Cloud Run, Twilio for SMS (RCS-ready for richer cards later), Redis-backed session state, a job queue for the async workers, 42 tests, and keyless CI/CD via GitHub Actions + Workload Identity Federation — no stored credentials.',
      },
    ],
    diagram: { heading: 'How a text becomes an answer', node: <SMSGatewayDiagram /> },
    closing: {
      h: 'Where it stands',
      body: (
        <>
          Live end-to-end — text the number and TRACI answers over SMS: tire questions, comparisons,
          sizes, sales contacts, and the full vehicle → recommendation path. Built solo during my
          Tire Rack Innovation &amp; AI internship, it&apos;s my first production service on cloud
          infrastructure — and the clearest proof that a good AI product is mostly the plumbing
          around the model.
        </>
      ),
    },
  },
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
        Cavers juggle a pile of disconnected tools — separate apps, spreadsheets, and forum posts
        for maps, trip logs, cave data, conservation notices, and club coordination — and the cave
        info itself is scattered, inconsistent, and often risky to publish. Karst pulls all of it
        into <strong>one seamless field guide</strong> for fellow cavers and newcomers alike, then
        adds features they didn&apos;t have before — like GPS-free navigation that can genuinely
        help someone find their way back out of a cave.
      </>
    ),
    spotlight: {
      tag: '★ Signature feature',
      h: "Dead reckoning, where GPS can't reach",
      body: (
        <>
          Caves swallow GPS, so Karst leans on <strong>dead reckoning</strong> — estimating your
          position from the phone&apos;s motion sensors and your last known fix instead of
          satellites. Drop a marker at the entrance and it keeps tracking your path underground, so
          if you get turned around or your light fails, the recorded trail always leads you back
          out. It&apos;s the kind of feature that, in the wrong moment, could genuinely save a life.
        </>
      ),
    },
    decisions: [
      {
        h: 'Protect the caves, not just the user',
        p: 'The hardest call in the project. Publishing exact entrances invites vandalism and injury and can wreck fragile ecosystems — and many caves sit on private land. So Karst fuzzes sensitive and private-property caves to an approximate area, while giving exact coordinates for show caves and publicly accessible ones.',
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
        h: 'Built to work with zero bars',
        p: 'Caves swallow signal, so Karst is offline-first by design: the trail recorder saves in place and tracks its own sync state, the cave page falls back to the local cache when the network is gone, and trip logs and entrance anchors queue up and sync the moment you resurface.',
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
          cap: 'AR “breadcrumb” trails — drop a path on the way in, follow it back out.',
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
          Designed and built solo over a few weeks, Karst is a live, evolving build — a
          server-rendered Next.js app on Firebase with Firestore-backed cave data, comments,
          grottos, and gamification, plus a downloadable Android version. Next up: getting it in
          front of the Bloomington Grotto and the wider caving community to gather real-world
          feedback and grow the cave database. It started as a way to learn modern full-stack
          patterns and became the tool I actually wanted as a caver.
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
        <strong>IT Inventory Tracker</strong> — a semi-automated inventory system for small
        businesses, built with a four-person Scrum team over two semesters for the IU Informatics
        senior capstone.
      </>
    ),
    meta: [
      { label: 'Role', value: 'Front-end & design' },
      { label: 'Team', value: '4 · Scrum, 2 semesters' },
      { label: 'Stack', value: 'PHP · Slim · MariaDB · IoT' },
    ],
    live: {
      href: 'https://zion.luddy.indiana.edu/info-capstone-2026/itit',
      label: 'See the capstone booth →',
    },
    problem: (
      <>
        Enterprise inventory systems like SAP run most of the Fortune 500 — but at roughly
        $100K+ to implement, they&apos;re wildly out of reach for a small shop. So small businesses
        fall back on spreadsheets, sticky notes, and phone Notes apps: quick to start, but
        error-prone and impossible to scale. ITIT bridges that gap — an{' '}
        <strong>affordable, self-hostable</strong> tracker that pairs a simple physical device with
        a web dashboard for real-time counts, low-stock alerts, and usage analytics, minus the
        enterprise price tag and complexity.
      </>
    ),
    spotlight: {
      tag: '★ Signature feature',
      h: 'A physical tracker that syncs to the web',
      body: (
        <>
          A notecard-sized <strong>IoT device</strong> shows an item&apos;s count with up/down
          buttons to adjust stock right where it lives — assign one to a location, or use your own
          phone as a virtual tracker. Either way it stays in <strong>real-time sync</strong> with
          the web dashboard: no manual reconciliation, no enterprise price tag.
        </>
      ),
    },
    decisions: [
      {
        h: 'A design system, then a full overhaul',
        p: 'We optimized for function over form early, then in the back half I led a visual overhaul: a five-color dark dashboard palette, clearer hierarchy and labeling, and proper desktop + mobile layouts — turning a working prototype into something people actually wanted to use.',
      },
      {
        h: 'Design for how people really behave',
        p: 'Usability testing was blunt — 6 of 8 participants blew straight past our on-screen instructions. So I leaned on explicit success/error messages, confirmation redirects after actions, and empty-state prompts, instead of assuming anyone reads the page.',
      },
      {
        h: 'Model how businesses actually organize',
        p: 'The app mirrors a real hierarchy — Deployments → Locations → Trackers → Items → Linked Items. After instructor feedback we reworked “Deployment” into a selected context each session scopes to, so users only ever see the one setup they’re working in.',
      },
      {
        h: 'Fit the tools they already use',
        p: 'Google login means no new account to manage, a barcode/UPC lookup fills in an item’s details from a single scan, and one-click CSV/XLSX export drops everything into the spreadsheets a team already lives in — so adopting ITIT never means migrating your whole world first.',
      },
    ],
    diagram: { heading: 'How it fits together', node: <ITITDiagram /> },
    closing: {
      h: 'Where it landed',
      body: (
        <>
          ITIT shipped as a working MVP — a self-hostable PHP/MariaDB app with Google login,
          barcode lookup, and CSV export, plus a 3D-printed IoT tracker — and was demoed at the IU
          Informatics Capstone fair (teammates: Nicolas Delgado, Eric Walker, Tanner Wathen). Two
          semesters of Scrum taught me to design inside a team&apos;s constraints, cut scope without
          losing the plot, and ship real software against a hard deadline.
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
        h: 'A scroll knob, wired by hand',
        p: 'Hand-wired rotary encoders driven through ZMK’s EC11 support. Getting them to read reliably took real trial and error — in the soldering and the firmware — but after a lot of work the sensor-binding now maps the knob to page up / down, turning the finest bit of soldering on the board into the fastest way to move through a doc or codebase (with media play/pause parked on a thumb).',
      },
    ],
    diagram: { heading: 'The keymap', node: <KeyboardLayers /> },
    closing: {
      h: 'Where it stands',
      body: (
        <>
          A from-scratch build — three clean layers (base, lower, raise) turn 42 keys into a full
          layout without ever reaching. It taught me as much about patience and hand-wiring as
          about ZMK, and it&apos;s still a canvas I keep tuning — layout, sound, and feel.
        </>
      ),
    },
  },

  blenz: {
    slug: 'blenz',
    title: (
      <>
        Blenz Preserve <span className="cs__cube">🏞️</span>
      </>
    ),
    year: '2025',
    lede: (
      <>
        A ground-up <strong>responsive redesign</strong> of the National Speleological Society&apos;s
        Buckner Cave / Richard Blenz Nature Preserve site — my final for I360 Web Design, hand-coded
        and photographed on-site.
      </>
    ),
    meta: [
      { label: 'Role', value: 'Design, build & photography' },
      { label: 'Course', value: 'I360 Web Design · SP25' },
      { label: 'Built with', value: 'HTML · CSS · vanilla JS' },
    ],
    problem: (
      <>
        I&apos;ve caved Buckner many times — and volunteered there on graffiti-removal restoration —
        so I know the preserve firsthand. Its real site, though, is a text-heavy, un-responsive
        early-2000s build where the things that matter most (access permits, White-Nose Syndrome
        decontamination, the management plan) sit buried in walls of text. I rebuilt it as a
        welcoming, responsive site that still leads with the preserve&apos;s conservation-first
        mission.
      </>
    ),
    spotlight: {
      tag: '★ Signature',
      h: 'Designed around real cave photography',
      body: (
        <>
          The hero slideshow and the blurred backdrop lean on cave photography —{' '}
          <strong>most of it my own from inside Buckner Cave, the rest sourced from the Bloomington
          Indiana Grotto</strong> — and the palette is pulled straight from the rock: limestone tans,
          cave-water blue, and a clay red, set in Libre Baskerville over Poppins. The design starts
          from the place itself.
        </>
      ),
    },
    decisions: [
      {
        h: 'Responsive, trailhead to desktop',
        p: 'Hand-coded and fully responsive across four breakpoints, with the nav collapsing to a hamburger menu on small screens — so it reads just as well on a phone at the cave gate as on a laptop.',
      },
      {
        h: 'Progressive disclosure for dense science',
        p: 'History, Biology, Geology, Hydrology, and Archaeology fold into accordions, so the page stays scannable and the deep detail is one tap away instead of a wall of text.',
      },
      {
        h: 'Conservation up front',
        p: 'The White-Nose Syndrome decontamination notice and the access-permit flow sit near the top, not buried in a policy page — mirroring the preserve’s real priorities.',
      },
      {
        h: 'An earthy, on-site palette',
        p: 'The clay red is the National Speleological Society’s own brand color — fitting, since the NSS manages the preserve — set against limestone neutrals and a topographic-line motif that runs through the banners and footer. Rustic but modern, drawn from the place rather than a template.',
      },
    ],
    gallery: {
      heading: 'A look at the site',
      frame: 'browser',
      shots: [
        {
          src: `${base}webdesign/home.webp`,
          cap: 'Homepage — a full-bleed hero slideshow of my Buckner Cave photos under the preserve name.',
        },
        {
          src: `${base}webdesign/info.webp`,
          cap: 'News, the management-plan callout, and accordion sections for the cave’s geology, biology, and history.',
        },
        {
          src: `${base}webdesign/access.webp`,
          cap: 'Interior page template — a topographic-line header, breadcrumb, and the permit-request flow.',
        },
      ],
    },
    closing: {
      h: 'Where it stands',
      body: (
        <>
          My first website built from scratch — hand-coded HTML, CSS, and vanilla JS, no frameworks.
          Two lessons stuck: wrangling JavaScript before I really knew the language, and a mid-build
          pivot from desktop-first to mobile-first after the phone view fell apart (goodbye, fixed
          pixel widths). It landed well in class, and it&apos;s the direct ancestor of Karst — which
          even reuses this site&apos;s topographic header background. The project that first fused the
          two halves of this portfolio: caving and building for the web.
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
  const panelRef = useRef<HTMLElement>(null)
  useFocusTrap(open, panelRef)

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
            ref={panelRef}
            tabIndex={-1}
            className="cs__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cs-title"
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
              <h2 className="cs__title" id="cs-title">{data.title}</h2>
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

            {data.slug === 'corne' && (
              <section className="cs__block">
                <h3 className="cs__h3">Take it for a spin</h3>
                <TypingTest />
              </section>
            )}

            {data.gallery &&
              (() => {
                const browser = data.gallery.frame === 'browser'
                return (
                  <section className="cs__block">
                    <h3 className="cs__h3">{data.gallery.heading}</h3>
                    <div className={`cs__gallery ${browser ? 'cs__gallery--browser' : ''}`}>
                      {data.gallery.shots.map((s) => (
                        <figure className={`cs__shot ${browser ? 'cs__shot--wide' : ''}`} key={s.src}>
                          {browser ? (
                            <div className="cs__browser">
                              <span className="cs__browser-bar">
                                <span />
                                <span />
                                <span />
                              </span>
                              <img src={s.src} alt={s.cap} loading="lazy" decoding="async" />
                            </div>
                          ) : (
                            <div className="cs__phone">
                              <img src={s.src} alt={s.cap} loading="lazy" decoding="async" />
                            </div>
                          )}
                          <figcaption>{s.cap}</figcaption>
                        </figure>
                      ))}
                    </div>
                  </section>
                )
              })()}

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

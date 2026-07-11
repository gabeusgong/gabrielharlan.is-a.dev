/* ============================================================
   GABRIEL HARLAN — site content
   Edit anything here and the whole site updates.
   ============================================================ */

export const profile = {
  name: 'Gabriel Harlan',
  // hero one-liner
  tagline: 'I turn big ideas into easily accessible, human-centered interfaces.',
  // rotating words in the hero ("I'm ___.")
  iAm: ['a web designer', 'a UX nerd', 'a caver', 'a keyboard builder', 'an informatics major'],
  about:
    "I'm a senior Informatics student at Indiana University, minoring in Human-Centered Computing and Web Design. I like turning big ideas into clean, accessible, human-centered interfaces, and I care about building things that feel good for everyone to use, not just things that look good. I spent the last couple years leading a campus IT support team at IU; on weekends I'm underground with the Bloomington Indiana Grotto, which is exactly how the cave field-guide app below got started.",
  location: 'Bloomington, Indiana',
  status: 'open to new roles',
  availability: 'Graduating Dec 2026 · open to UX & front-end roles · Bloomington, IN or remote',
  // a little "/now" line — edit anytime to keep the site feeling alive
  now: [
    'building an SMS gateway for the TRACI tire agent at Tire Rack',
    'reading Kafka on the Shore by Haruki Murakami',
    'playing Fallout 4',
  ],
}

export type Skill = { name: string; tone: keyof typeof tones }
export const tones = {
  coral: 'var(--coral)',
  cobalt: 'var(--cobalt)',
  lime: 'var(--lime)',
  pink: 'var(--pink)',
  sun: 'var(--sun)',
} as const

export const skills: Skill[] = [
  { name: 'JavaScript', tone: 'cobalt' },
  { name: 'React / Next.js', tone: 'coral' },
  { name: 'PHP', tone: 'lime' },
  { name: 'MySQL', tone: 'sun' },
  { name: 'Python', tone: 'pink' },
  { name: 'HTML / CSS', tone: 'cobalt' },
  { name: 'Figma', tone: 'coral' },
  { name: 'Firebase', tone: 'lime' },
  { name: 'UX & HCI Design', tone: 'sun' },
  { name: 'Git', tone: 'pink' },
  { name: 'Tableau', tone: 'cobalt' },
  { name: 'Web Design', tone: 'coral' },
]

// Draggable sticker badges — pulled from your real clubs & hobbies.
export type Sticker = {
  emoji: string
  label: string
  tone: keyof typeof tones
  rotate: number
}
export const hobbies: Sticker[] = [
  { emoji: '🧗', label: 'caving', tone: 'sun', rotate: -8 },
  { emoji: '⌨️', label: 'custom keyboards', tone: 'cobalt', rotate: 6 },
  { emoji: '☕', label: 'coffee', tone: 'coral', rotate: -4 },
  { emoji: '🥾', label: 'hiking', tone: 'lime', rotate: -10 },
  { emoji: '🖥️', label: 'PC building', tone: 'sun', rotate: 5 },
  { emoji: '🪴', label: 'plants', tone: 'cobalt', rotate: -6 },
  { emoji: '📚', label: 'reading', tone: 'coral', rotate: 7 },
  { emoji: '🏊', label: 'swimming', tone: 'lime', rotate: -5 },
  { emoji: '🎮', label: 'gaming', tone: 'pink', rotate: 8 },
  { emoji: '🏋️', label: 'gym', tone: 'cobalt', rotate: -7 },
]

export type Project = {
  title: string
  blurb: string
  tags: string[]
  tone: keyof typeof tones
  href?: string
  year?: string
  emoji: string
  caseStudy?: boolean
  study?: 'karst' | 'itit' | 'corne' | 'blenz' | 'tracisms'
}

export const projects: Project[] = [
  {
    title: 'TRACI SMS Gateway',
    blurb:
      "An SMS gateway that lets customers text Tire Rack's TRACI AI tire agent. A Python/FastAPI service on Google Cloud Run that fronts the agent over Twilio — a text-driven vehicle picker (year/make/model → factory tire size), an event-stream-to-SMS renderer, async workers so slow AI replies never time out, Redis session state, and keyless CI/CD. Built solo as an Innovation & AI intern.",
    tags: ['Python', 'FastAPI', 'Cloud Run', 'Twilio'],
    tone: 'coral',
    year: '2026',
    emoji: '💬',
    caseStudy: true,
    study: 'tracisms',
  },
  {
    title: 'Karst',
    blurb:
      "A caver's field guide to the wild and show caves of southern Indiana's karst country. A Next.js + Firebase app with a privacy-first map that fuzzes sensitive cave locations, dead-reckoning trails you record once and follow in with AR or back out by compass, grotto groups, a community field guide, and a bat / White-Nose Syndrome conservation guide. Ships as a web app and an Android build.",
    tags: ['Next.js', 'Firebase', 'Leaflet', 'Privacy-first'],
    tone: 'sun',
    year: '2026',
    emoji: '🦇',
    href: 'https://spelunk-a-dunk.web.app',
    caseStudy: true,
    study: 'karst',
  },
  {
    title: 'ITIT — IT Inventory Tracker',
    blurb:
      'Senior capstone with a four-person Scrum team: inventory tracking for small businesses that’s less error-prone than spreadsheets and far cheaper than enterprise systems. Pairs a physical IoT tracker with a web app for deployments, locations, and items — plus CSV export and Google login.',
    tags: ['JavaScript', 'PHP', 'MySQL', 'IoT'],
    tone: 'cobalt',
    year: '2025',
    emoji: '📦',
    href: 'https://zion.luddy.indiana.edu/info-capstone-2026/itit',
    caseStudy: true,
    study: 'itit',
  },
  {
    title: 'Corne 42 LP Split Wireless Keyboard',
    blurb:
      'A hand-built split, wireless, low-profile Corne — 42 ortholinear keys on custom ZMK firmware. Bluetooth profiles, per-half OLED screens, a removable hotswap controller, and magnetic USB-C ports. Tuned Choc switches, blank 3D-printed caps, built entirely by hand.',
    tags: ['ZMK', 'Firmware', 'Hardware'],
    tone: 'coral',
    year: '2024',
    emoji: '⌨️',
    caseStudy: true,
    study: 'corne',
  },
  {
    title: 'Richard Blenz Nature Preserve',
    blurb:
      "A responsive redesign of the National Speleological Society's Buckner Cave preserve site — my I360 Web Design final. Hand-coded HTML/CSS/JS with an animated nav, a photo slideshow, and accordion geology & biology sections, all built around cave photography I shot on-site.",
    tags: ['HTML', 'CSS', 'JavaScript', 'Responsive'],
    tone: 'lime',
    year: '2025',
    emoji: '🏞️',
    caseStudy: true,
    study: 'blenz',
  },
]

export const links = {
  email: 'gbharlan@iu.edu',
  github: 'https://github.com/gabeusgong',
  linkedin: 'https://linkedin.com/in/gbharlan',
  twitter: '',
}

// Add quotes here (with the person's permission) and the "Kind words" section
// appears automatically. Leave empty to hide it.
export type Testimonial = { quote: string; name: string; role: string }
export const testimonials: Testimonial[] = [
  {
    quote:
      'Gabriel quickly climbed the ranks of our team and was promoted to a supervisor… a reliable and dependable asset, consistently delivering outstanding results. His leadership skills not only drive results but also cultivate a positive and high-performing team culture.',
    name: 'Wesley Clifford',
    role: 'IT Coordinator · IU Support Center (SCIPS)',
  },
  {
    quote:
      'Gabe is doing fantastic in class. He is perpetually ahead of the rest of the class — I have had to find him extra projects to work on… He is truly a self-starter and a very driven person that all the other students look to for advice and help.',
    name: 'Anthony Lincoln',
    role: 'Computer Information Systems Instructor · ACATEC',
  },
]

// ---- /uses page: gear, stack, and what's on (and off) the desk ----
export type UseItem = { name: string; note?: string }
export type UseGroup = { group: string; tone: keyof typeof tones; items: UseItem[] }

export const uses: UseGroup[] = [
  {
    group: 'Keyboards',
    tone: 'coral',
    items: [
      {
        name: 'Hibi June R2 (60%)',
        note: 'lubed Gateron Baby Kangaroo tactiles · NicePBT Peaches n Cream Lite keycaps',
      },
      {
        name: 'QK100 (tri-mode)',
        note: 'GMK Godspeed keycaps · lubed Gazzew U4 Silent Boba tactiles',
      },
      {
        name: 'QK60 (tri-mode)',
        note: 'lubed Gateron Pro North Pole linears · Infinikey Delight keycaps',
      },
      {
        name: 'Voice Mini (macropad)',
        note: 'lubed Gateron Black Ink V2 linears · JTK Night Sakura keycaps',
      },
      {
        name: 'Corne 42 — hand-built',
        note: 'Split, wireless, low-profile on custom ZMK · Kailh Choc Silver linears (lubed, o-ring + tape mod) · nice!nano v2, per-half OLEDs, page-up/down knob.',
      },
      {
        name: 'GMMK Pro',
        note: 'lubed Gateron Black Ink V2 linears · tape + PE foam mods · JTK Dreaming Girl keycaps',
      },
    ],
  },
  {
    group: 'Languages & frameworks',
    tone: 'cobalt',
    items: [
      { name: 'JavaScript / TypeScript' },
      { name: 'React / Next.js' },
      { name: 'Python' },
      { name: 'PHP' },
      { name: 'MySQL' },
      { name: 'HTML / CSS' },
      { name: 'Firebase' },
    ],
  },
  {
    group: 'Software & tools',
    tone: 'lime',
    items: [
      { name: 'VS Code', note: 'main editor' },
      { name: 'Git & GitHub' },
      { name: 'Figma', note: 'design + prototyping' },
      { name: 'Docker' },
      { name: 'Google Cloud · Firebase' },
      { name: 'Claude Code', note: 'AI pair for shipping fast' },
    ],
  },
  {
    group: 'Machines',
    tone: 'sun',
    items: [
      {
        name: 'Framework Laptop (DIY Edition)',
        note: '12th-gen Intel Core · 32 GB RAM · Windows 11 dual-booted with Zorin OS',
      },
      {
        name: 'Hand-built desktop',
        note: 'Ryzen 5 5600X (6-core) · RTX 3060 · 64 GB Corsair Vengeance RGB Pro SL DDR4-3600 · Lian Li O11 Dynamic (white) · Windows 10',
      },
      { name: 'ASUS TUF Gaming VG34VQL3A', note: '34" · 3440×1440 · 180 Hz' },
      { name: 'Gigabyte M27Q', note: '27" · 2560×1440 · 170 Hz' },
      { name: 'Logitech MX Master 3S' },
    ],
  },
  {
    group: 'Coffee',
    tone: 'coral',
    items: [
      { name: '1Zpresso K-Ultra grinder' },
      { name: 'Hario V60 pour-over' },
      { name: 'AeroPress' },
      { name: 'Bodum French press' },
      { name: 'Bambino espresso machine' },
      { name: 'Moka pot' },
      { name: 'Vietnamese phin filter' },
      { name: 'Turkish cezve' },
      { name: 'Iced dirty chai latte', note: '★ the favorite drink' },
    ],
  },
]

// ---- Field Notes: short writing on the thinking behind the work ----
// A body is an array of blocks. The simplest block is a plain string (a
// paragraph). Use the object forms for a subheading, a pull-quote, or a list.
export type NoteBlock =
  | string // a paragraph
  | { h: string } // a subheading
  | { quote: string; by?: string } // a pull-quote
  | { list: string[] } // a bulleted list

export type Note = {
  slug: string // the URL: #/notes/<slug>
  title: string
  dek: string // one-line standfirst under the title
  date: string // ISO date, e.g. '2026-06-02'
  tags: string[]
  minutes: number // rough read time
  body: NoteBlock[]
  study?: Project['study'] // the case study this note is the story behind
}

// Newest first — the list renders in this order.
export const notes: Note[] = [
  {
    slug: 'the-knob-that-wouldnt-turn',
    title: 'The knob that wouldn’t turn',
    dek: 'Adding one rotary knob to my keyboard should have been an afternoon. It ate a full day of coding and soldering — and every layer of the stack had its own lie waiting.',
    date: '2026-07-11',
    tags: ['Firmware', 'Hardware', 'Debugging'],
    minutes: 6,
    body: [
      'I wanted one small thing: a scroll knob on my keyboard — a split Corne running ZMK. Solder on an encoder, add a few lines of config, page up and down. An afternoon, tops. It ate a full day of coding and soldering, and the knob itself was almost never the real problem. Every layer of the stack had a lie waiting in it, and I had to disprove one to reach the next.',
      { h: 'The bleeding edge cuts' },
      'My config tracked ZMK’s development branch, which feels responsible and is a trap. Between builds the firmware had migrated to a new underlying OS version that quietly renamed my board. My build still compiled, still booted, still drew the little OLED — and typed nothing at all, over USB or Bluetooth. A green build that produces a dead keyboard is the worst kind of green. The fix was a single line: pin to a tagged release instead of chasing the latest commit. Everything I’d been blaming on hardware was a version I never chose to be on.',
      { h: 'It wasn’t the encoder I thought it was' },
      'I had wired it as the standard keyboard encoder — common pin in the middle. It wasn’t that part. It was a Panasonic encoder whose common sits at the end of the pin row, not the center. So for hours I was faithfully soldering a ground onto a signal leg and reading a signal where the firmware expected ground, earning exactly the silence that wiring deserves. The datasheet knew the whole time. I didn’t, because I pattern-matched to the part I expected instead of the one in my hand.',
      { h: 'Prove it, don’t guess' },
      'The ugliest stretch was reflowing joints on a hunch, again and again, each pass risking fresh damage to a component that doesn’t love heat — and eventually the damage came. Two of the encoder’s pins lifted clean off their legs, leaving only flat, thin pads on the body to solder to. Working a wire onto a bare pad with no leg to grab is breath-held, tweezers-and-flux work; slip once and the pad is gone for good. The guessing only ended when I forced each fault to prove itself instead of trusting my eyes. My favorite trick cost nothing: bridge a switch’s two pads with tweezers and watch the keyboard’s own display flip layers — a keypress with no key, and instant proof of whether the fault was the switch or everything downstream of it.',
      {
        quote:
          'Bring-up isn’t one hard problem. It’s a stack of small wrong assumptions — the version, the pinout, the cold joint — and the only way through is to disprove them one at a time until the last one falls.',
      },
      { h: 'Every fix cost a neighbor' },
      'The hardware kept handing me humility. Fixing the knob meant soldering next to keys that had nothing to do with it, and the heat kept knocking those loose — a dead M, then a dead slash, then a whole thumb key. For a while it was whack-a-mole where every mole I hit spawned another. The lesson wasn’t subtle: near fragile work, move slowly, change one thing, and re-test before you reach for the iron again.',
      'The knob scrolls now. What I actually kept wasn’t a knob — it was a debugging loop. Assume the layer you trust is the one lying to you, prove it before you move on, and test before you melt anything. It’s the same discipline I lean on in software; the soldering iron just makes the price of skipping a step a little more literal.',
    ],
  },
  {
    slug: 'fuzzing-cave-locations',
    title: 'Fuzzing cave locations',
    dek: 'Designing privacy into a map when the honest answer is “I can’t show you that.”',
    date: '2026-07-07',
    tags: ['UX', 'Privacy', 'Maps'],
    minutes: 5,
    study: 'karst',
    body: [
      'The hardest decision in Karst wasn’t a technical one. It was a map with a pin on it. Publishing the exact mouth of a wild cave invites vandalism and injury, wrecks fragile bat habitat, and — since a lot of Indiana’s caves sit on private land — can burn a landowner relationship the local grotto spent years building. But a caving field guide that won’t tell you where anything is isn’t a field guide.',
      'So the design question became: how do you build trust into a map that deliberately withholds its most precise data?',
      { h: 'Refuse, or design around it?' },
      'The lazy answer is to hide sensitive caves entirely, or gate the whole map behind a login. Both punish the newcomer the app is supposed to welcome. Instead I treated location precision as a spectrum, not a switch.',
      {
        list: [
          'Show caves and publicly accessible entrances get exact coordinates — that info is already public and the whole point is to send people there.',
          'Sensitive and private-property caves are fuzzed to an approximate area — enough to orient you in the karst region, never enough to walk up to the entrance.',
          'Exact coordinates for gated caves unlock only through a grotto — the same trust network that governs access in real life.',
        ],
      },
      'The map mirrors how cavers already share information: freely about the tourist caves, carefully about everything else, and precisely only with people who’ve earned it.',
      { h: 'Trails held the same line' },
      'Recorded trails were the sharp edge of the same problem. A shared trail is only its relative shape — steps and turns, never coordinates. It can guide anyone in or back out while the entrance itself stays gated. The navigation is genuinely useful and it leaks nothing.',
      {
        quote:
          'Protect the caves, not just the user. Privacy wasn’t a compliance checkbox bolted on at the end — it was the constraint the whole product was designed around.',
      },
      'The lesson I keep: “no” is rarely the best design. The interesting work is finding the version of “yes” that respects the constraint instead of ignoring it.',
    ],
  },
  {
    slug: 'plumbing-is-the-product',
    title: 'The plumbing is the product',
    dek: 'What building an SMS gateway for an AI tire agent taught me about where the real work lives.',
    date: '2026-06-30',
    tags: ['Engineering', 'AI', 'SMS'],
    minutes: 6,
    study: 'tracisms',
    body: [
      'Tire Rack’s TRACI is an AI agent that helps you find tires. It lived on the web. Plenty of customers, though, would rather just text a phone number. My internship project was to make that work — let anyone SMS the full agent — without touching the agent itself.',
      'I expected the model to be the hard part. It wasn’t. The model was the easy part. Almost everything that mattered was the plumbing around it.',
      { h: 'The vehicle picker, reinvented for text' },
      'The website resolves your car with a year/make/model picker widget. You can’t render a dropdown in a text message, and the agent can’t reliably parse a vehicle out of free-form typing. So the gateway resolves the car itself — a numbered-reply drill-down (“1. Honda  2. Toyota …”) that walks Year → Make → Model → trim and then auto-supplies the factory tire size. A texter never has to know their own tire size. That one flow was more design work than the entire model integration.',
      { h: 'Answer fast, even when the model is slow' },
      'Agent replies can take many seconds; carriers expect a webhook response in far less. So the gateway acknowledges Twilio immediately and hands the real work to a background worker that calls the agent and sends the reply when it’s ready. Inbound texts never time out waiting on inference.',
      { h: 'Render a stream of events into a plain text' },
      'The agent answers with an ordered stream of “events” — text, cards, UI fragments. The gateway classifies each one: keep the text, drop the noise, reformat the cards for SMS. I used a denylist, not an allowlist, so a brand-new kind of agent card is never silently swallowed — worst case it’s reformatted, never lost.',
      {
        quote:
          'A good AI product is mostly the plumbing around the model — the session state, the async workers, the format translation, the graceful failure. The model is a component, not the product.',
      },
      'It shipped live end-to-end on Google Cloud Run with Redis-backed sessions, a job queue, 42 tests, and keyless CI/CD. My first production service on cloud infrastructure — and the clearest lesson of the internship was that the interesting engineering was everywhere except the model call.',
    ],
  },
  {
    slug: 'leading-it-support-ux',
    title: 'What leading an IT team taught me about UX',
    dek: 'Two years of watching people hit walls in real time is the best usability lab I’ve had.',
    date: '2026-06-25',
    tags: ['UX', 'Leadership'],
    minutes: 4,
    study: 'itit',
    body: [
      'Before I called myself a designer I spent two years leading a campus IT support team at IU. On paper that’s a job about fixing computers. In practice it was a job about watching people fail at interfaces all day — and it shaped how I design more than any single class.',
      { h: 'People don’t read' },
      'The single most durable thing I learned: nobody reads the instructions. On my capstone team’s usability tests, 6 of 8 participants walked straight past our on-screen directions. That wasn’t a surprise to me — it was every support ticket I’d ever taken, in miniature. So I stopped designing for the person who reads and started designing for the person in a hurry: explicit success and error messages, confirmation after every destructive action, empty states that tell you what to do next.',
      { h: 'The report is the design spec' },
      'A support queue is a live, unfiltered usability study. Every ticket is someone telling you exactly where your system’s mental model and theirs diverged. You learn to hear “this is broken” and translate it into “the affordance was missing” or “the label lied.” That translation — from complaint to design problem — is most of the job in both roles.',
      {
        quote:
          'A support ticket and a usability finding are the same artifact. One just arrives after you shipped, and the other arrives before.',
      },
      { h: 'Calm is a feature' },
      'Leading the team also meant being the calm one when someone’s work was on the line. That’s an interface quality too — good software lowers the temperature instead of raising it. I try to design things that fail gently, explain themselves, and never make you feel stupid. That instinct came from the help desk, not the design studio.',
    ],
  },
]

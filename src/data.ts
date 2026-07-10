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
      "A caver's field guide to the wild and show caves of southern Indiana's karst country. A Next.js + Firebase app with a privacy-first map that fuzzes sensitive cave locations, gamified AR “breadcrumb” trails, grotto groups, a community field guide, and a bat / White-Nose Syndrome conservation guide. Ships as a web app and an Android build.",
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

/* ============================================================
   GABRIEL HARLAN — site content
   Edit anything here and the whole site updates.
   ============================================================ */

export const profile = {
  name: 'Gabriel Harlan',
  // hero one-liner
  tagline: 'I turn messy problems into clean, human-centered interfaces.',
  // rotating words in the hero ("I'm ___.")
  iAm: ['a web designer', 'a UX nerd', 'a caver', 'a keyboard builder', 'an informatics major'],
  about:
    "I'm a senior Informatics student at Indiana University, minoring in Human-Centered Computing and Web Design. I like turning messy problems into clean, human-centered interfaces — and I sweat the details whether that's a Figma file, a Firestore rule, or the keymap on a board I soldered myself. By day I lead a campus IT support team; on weekends I'm underground with the Bloomington Indiana Grotto, which is exactly how the cave field-guide app below got started.",
  location: 'Bloomington, Indiana',
  status: 'open to new roles',
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
  { name: 'Firebase / Firestore', tone: 'lime' },
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
  { emoji: '🎸', label: 'guitar', tone: 'pink', rotate: 9 },
  { emoji: '🥾', label: 'hiking', tone: 'lime', rotate: -10 },
  { emoji: '🖥️', label: 'PC building', tone: 'sun', rotate: 5 },
  { emoji: '🪴', label: 'plants', tone: 'cobalt', rotate: -6 },
  { emoji: '📚', label: 'reading', tone: 'coral', rotate: 7 },
  { emoji: '🏊', label: 'swimming', tone: 'lime', rotate: -5 },
]

export type Project = {
  title: string
  blurb: string
  tags: string[]
  tone: keyof typeof tones
  href?: string
  year?: string
  emoji: string
}

export const projects: Project[] = [
  {
    title: 'Karst',
    blurb:
      "A caver's field guide to the wild and show caves of southern Indiana's karst country. A Next.js + Firestore app with a privacy-first map that fuzzes sensitive cave locations, gamified AR “breadcrumb” trails, grotto groups, a community field guide, and a bat / White-Nose Syndrome conservation guide. Ships as a web app and an Android build.",
    tags: ['Next.js', 'Firestore', 'Leaflet', 'Privacy-first'],
    tone: 'sun',
    year: '2025',
    emoji: '🦇',
    href: 'https://spelunk-a-dunk.web.app',
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
  },
  {
    title: 'Corne 42 LP Wireless Split Keyboard',
    blurb:
      'A hand-built split, wireless, ortholinear mechanical keyboard running custom ZMK firmware — bespoke keymaps, rotary encoders, the works. Because the best tools are the ones you tune yourself.',
    tags: ['ZMK', 'Firmware', 'Hardware'],
    tone: 'coral',
    year: '2024',
    emoji: '⌨️',
  },
]

export const links = {
  email: 'gbharlan@iu.edu',
  github: 'https://github.com/gabeusgong',
  linkedin: 'https://linkedin.com/in/gbharlan',
  twitter: '',
}

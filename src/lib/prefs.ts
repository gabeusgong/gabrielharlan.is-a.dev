/* Shared user preferences. The site is light-only — the former dark theme is
   replaced by the flashlight (cave mode), toggled from the UI. This module just
   persists the sound (mute) pref and broadcasts a 'pref-change' event so
   components can re-read. */

const MUTED_KEY = 'gh-muted'
const FLASH_KEY = 'gh-flashlight'
const INTRO_KEY = 'gh-intro-seen'

const get = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const set = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k)
    else localStorage.setItem(k, v)
  } catch {
    /* ignore */
  }
}

export const isMuted = () => get(MUTED_KEY) === '1'
export const setMuted = (b: boolean) => {
  set(MUTED_KEY, b ? '1' : '0')
  emit()
}

// the headlamp beam that follows the cursor *within* cave mode — on by default.
// Toggling it never enters/exits cave mode; it just shows/hides the beam.
export const flashlightOn = () => get(FLASH_KEY) !== '0'
export const setFlashlight = (b: boolean) => {
  set(FLASH_KEY, b ? '1' : '0')
  emit()
}

// First visit = the intro curtain hasn't been shown yet, and we're not an
// automation/bot (so audits/screenshots skip the flourish). App and Intro both
// read this at render time and must agree, so keep it a pure read.
export const isFirstVisit = () => {
  try {
    return !get(INTRO_KEY) && !navigator.webdriver
  } catch {
    return false
  }
}
export const markIntroSeen = () => set(INTRO_KEY, '1')

const emit = () => window.dispatchEvent(new CustomEvent('pref-change'))

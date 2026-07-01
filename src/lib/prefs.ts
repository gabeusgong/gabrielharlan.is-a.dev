/* Shared user preferences: theme (light/dark) and sound (mute).
   Theme is null = "follow the OS"; an explicit value overrides. The resolved
   theme is written to <html data-theme> so CSS can react, and a 'pref-change'
   event lets components re-read. */

const THEME_KEY = 'gh-theme'
const MUTED_KEY = 'gh-muted'

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

const mq = (q: string) =>
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false

export const prefersDark = () => mq('(prefers-color-scheme: dark)')

export type Theme = 'dark' | 'light' | null
export const getTheme = (): Theme => {
  const v = get(THEME_KEY)
  return v === 'dark' || v === 'light' ? v : null
}
export const resolvedDark = () => {
  const t = getTheme()
  return t ? t === 'dark' : prefersDark()
}
export const setTheme = (v: Theme) => {
  set(THEME_KEY, v)
  apply()
  emit()
}

export const isMuted = () => get(MUTED_KEY) === '1'
export const setMuted = (b: boolean) => {
  set(MUTED_KEY, b ? '1' : '0')
  emit()
}

export const apply = () => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = resolvedDark() ? 'dark' : 'light'
}

const emit = () => window.dispatchEvent(new CustomEvent('pref-change'))

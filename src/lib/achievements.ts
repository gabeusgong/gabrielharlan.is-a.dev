export type Secret = { id: string; label: string; emoji: string; hint: string }

export const SECRETS: Secret[] = [
  { id: 'cave', label: 'Spelunker', emoji: '🔦', hint: 'found cave mode' },
  { id: 'ring', label: 'Sharpshooter', emoji: '🎯', hint: 'sank every sticker' },
  { id: 'bat', label: 'Bat spotter', emoji: '🦇', hint: 'waited for the bat' },
  { id: 'fling', label: 'Card flinger', emoji: '🃏', hint: 'flung a project card' },
  { id: 'konami', label: 'Old school', emoji: '🕹️', hint: '↑↑↓↓←→←→ b a · swipe + tap on mobile' },
  { id: 'terminal', label: 'Power user', emoji: '💻', hint: 'opened the terminal' },
]

const KEY = 'gh-secrets'

export function getUnlocked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function unlock(id: string) {
  const set = new Set(getUnlocked())
  if (set.has(id)) return
  set.add(id)
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]))
  } catch {
    /* ignore */
  }
  const secret = SECRETS.find((s) => s.id === id)
  window.dispatchEvent(new CustomEvent('secret-unlocked', { detail: secret }))
}

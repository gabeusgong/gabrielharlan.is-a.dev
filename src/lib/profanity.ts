/* Lightweight client-side profanity guard for the public guestbook wall.
   Blocks obvious slurs/profanity on submit and masks them on display. Not
   bulletproof (the Firestore rules still cap length), but it keeps the wall
   presentable to visitors and recruiters. */

const WORDS = [
  'nigger',
  'nigga',
  'faggot',
  'fag',
  'retard',
  'cunt',
  'chink',
  'spic',
  'kike',
  'tranny',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'dick',
  'pussy',
  'cock',
  'slut',
  'whore',
  'bastard',
  'wanker',
  'bollocks',
]

// match the word even with simple separators/repeats (f-u-c-k, fuuuck), but
// anchor with word boundaries + an optional plural so innocent words that merely
// contain one (e.g. "Dickinson", "class", "assess") aren't flagged or masked
const patterns = WORDS.map(
  (w) =>
    new RegExp(
      `\\b${w
        .split('')
        .map((c) => `${c}+`)
        .join('[\\s._*-]*')}s?\\b`,
      'gi',
    ),
)

export function isClean(text: string): boolean {
  return !patterns.some((re) => {
    re.lastIndex = 0
    return re.test(text)
  })
}

export function mask(text: string): string {
  let out = text
  for (const re of patterns) {
    re.lastIndex = 0
    out = out.replace(re, (m) => '•'.repeat(Math.max(2, m.trim().length)))
  }
  return out
}

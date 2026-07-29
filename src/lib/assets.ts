/* Content-hashed image URLs.

   Gallery + case-study images live under src/assets/img and are imported (not
   served from public/), so Vite fingerprints each filename with a content hash
   at build time. Change an image and its URL changes automatically — no more
   hand-bumped ?v= query strings to bust the CDN/browser cache. */

// eager `?url` glob → { '../assets/img/caves/cave-01.webp': '/assets/cave-01.<hash>.webp', … }
const modules = import.meta.glob('../assets/img/**/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const PREFIX = '../assets/img/'
const byName: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  byName[path.slice(PREFIX.length)] = url
}

/* Resolve a logical name like 'caves/cave-01.webp' or 'traction/queue-dark.webp'
   to its hashed URL. Unknown names throw at module-eval time (all callers pass
   string literals), so a typo fails the build instead of shipping a broken img. */
export function asset(name: string): string {
  const url = byName[name]
  if (!url) throw new Error(`Unknown image asset: ${name}`)
  return url
}

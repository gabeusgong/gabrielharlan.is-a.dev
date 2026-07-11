/* Post-build pre-render.
 *
 * Runs after `vite build`. The site itself is a hash-routed SPA, which means a
 * social-card scraper or search crawler hitting `#/notes/<slug>` only ever sees
 * the generic root index.html — every deep link previews identically and none
 * are separately indexed.
 *
 * This script fixes that by emitting *real* HTML pages at real paths:
 *   dist/notes/<slug>/index.html   a full, readable, styled article
 *   dist/notes/index.html          the writing index
 *   dist/work/<slug>/index.html    a case-study summary that hands off to the app
 *   dist/sitemap.xml               all of the above
 *
 * Each page carries its own <title>, description, canonical, and OG/Twitter
 * tags, and links the already-built CSS so it matches the in-app look. The SPA
 * is not booted on these pages, so the pre-rendered content is what's served.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { notes, projects, type NoteBlock } from '../src/data'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '../dist')
const SITE = 'https://gabrielharlan.is-a.dev'
const OG_IMAGE = `${SITE}/og.png`
const AUTHOR = 'Gabriel Harlan'

// find the hashed CSS bundle vite just emitted, so the pages are styled
const builtIndex = readFileSync(resolve(DIST, 'index.html'), 'utf8')
const cssMatch = builtIndex.match(/href="\.?\/?(assets\/[^"]+\.css)"/)
if (!cssMatch) throw new Error('prerender: could not find built CSS in dist/index.html')
const CSS_HREF = `/${cssMatch[1]}`

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

// the font <head> block, copied verbatim from index.html so type matches
const FONTS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" />`

type PageOpts = {
  title: string
  description: string
  path: string // e.g. "/notes/foo/" — canonical + og:url
  type?: 'article' | 'website'
  body: string
}

function page({ title, description, path, type = 'website', body }: PageOpts): string {
  const url = `${SITE}${path}`
  const t = esc(title)
  const d = esc(description)
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${d}" />
    <meta name="author" content="${AUTHOR}" />
    <meta name="theme-color" content="#f4ecd8" />
    <link rel="canonical" href="${url}" />

    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
${FONTS}
    <link rel="stylesheet" href="${CSS_HREF}" />
    <!-- these are standalone read/share pages with no custom cursor, so undo the
         app's cursor:none rule -->
    <style>
      @media (pointer: fine) {
        *, *::before, *::after { cursor: auto !important; }
      }
      body { background: #f4ecd8; color: #211b14; font-family: 'Schibsted Grotesk', system-ui, sans-serif; margin: 0; }
    </style>

    <title>${t}</title>
  </head>
  <body>
${body}
    <script data-goatcounter="https://gabrielharlan.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
  </body>
</html>
`
}

function renderBlocks(body: NoteBlock[]): string {
  return body
    .map((b) => {
      if (typeof b === 'string') return `<p class="note__p">${esc(b)}</p>`
      if ('h' in b) return `<h3 class="note__h">${esc(b.h)}</h3>`
      if ('quote' in b)
        return `<blockquote class="note__quote"><p>${esc(b.quote)}</p>${
          b.by ? `<cite>— ${esc(b.by)}</cite>` : ''
        }</blockquote>`
      return `<ul class="note__list">${b.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`
    })
    .join('\n        ')
}

function write(relPath: string, html: string) {
  const full = resolve(DIST, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, html)
  console.log(`  ✓ ${relPath}`)
}

const tagList = (tags: string[]) =>
  `<ul class="note__tags">${tags.map((t) => `<li class="note__tag">${esc(t)}</li>`).join('')}</ul>`

console.log('prerender: emitting static pages')

// ---- individual note pages ----
for (const n of notes) {
  const project = n.study ? projects.find((p) => p.study === n.study) : null
  const crosslink = project
    ? `<a class="note__crosslink" href="/work/${project.study}/">
          <span class="note__crosslink-emoji" aria-hidden>${project.emoji}</span>
          <span class="note__crosslink-text">
            <span class="note__crosslink-tag label">The project</span>
            <span class="note__crosslink-title">${esc(project.title)}</span>
          </span>
          <span class="note__crosslink-go">See the case study →</span>
        </a>`
    : ''
  const body = `    <div class="notespage"><div class="notespage__inner section">
      <article class="note">
        <a href="/" class="note__crumb">← ${AUTHOR}</a>
        <p class="label note__kicker"><span class="tick">FIELD NOTE</span> · ${fmtDate(n.date)} · ${n.minutes} min</p>
        <h1 class="note__title">${esc(n.title)}</h1>
        <p class="note__dek">${esc(n.dek)}</p>
        ${tagList(n.tags)}
        <div class="note__body">
        ${renderBlocks(n.body)}
        </div>
        ${crosslink}
        <a href="/#/notes" class="btn btn--ghost note__back">← all field notes</a>
      </article>
    </div></div>`
  write(
    `notes/${n.slug}/index.html`,
    page({
      title: `${n.title} — Field Notes · ${AUTHOR}`,
      description: n.dek,
      path: `/notes/${n.slug}/`,
      type: 'article',
      body,
    }),
  )
}

// ---- notes index ----
{
  const cards = notes
    .map(
      (n) => `<a href="/notes/${n.slug}/" class="notecard">
          <p class="notecard__meta label">${fmtDate(n.date)} · ${n.minutes} min</p>
          <h2 class="notecard__title">${esc(n.title)}</h2>
          <p class="notecard__dek">${esc(n.dek)}</p>
          <span class="notecard__go">Read →</span>
        </a>`,
    )
    .join('\n        ')
  const body = `    <div class="notespage"><div class="notespage__inner section">
      <a href="/" class="note__crumb">← ${AUTHOR}</a>
      <h1 class="notes__heading">Field <span class="notes__word">notes.</span></h1>
      <p class="notes__sub">Short writing on the thinking behind the projects — the calls, the trade-offs, and the things I only understood after shipping.</p>
      <div class="notes__list">
        ${cards}
      </div>
      <a href="/#/notes" class="btn btn--ghost notes__back">Open on the site →</a>
    </div></div>`
  write(
    'notes/index.html',
    page({
      title: `Field Notes — ${AUTHOR}`,
      description: 'Short writing on the thinking behind my projects — design calls, trade-offs, and lessons from shipping.',
      path: '/notes/',
      body,
    }),
  )
}

// ---- case-study summary pages (hand off to the interactive modal) ----
for (const p of projects) {
  if (!p.caseStudy || !p.study) continue
  const note = notes.find((n) => n.study === p.study)
  const live = p.href
    ? `<a class="btn btn--ghost" href="${esc(p.href)}" target="_blank" rel="noreferrer">Visit the live project →</a>`
    : ''
  const noteLink = note
    ? `<a class="note__crosslink" href="/notes/${note.slug}/">
          <span class="note__crosslink-emoji" aria-hidden>✦</span>
          <span class="note__crosslink-text">
            <span class="note__crosslink-tag label">Field note</span>
            <span class="note__crosslink-title">${esc(note.title)}</span>
          </span>
          <span class="note__crosslink-go">Read the story →</span>
        </a>`
    : ''
  const body = `    <div class="notespage"><div class="notespage__inner section">
      <a href="/" class="note__crumb">← ${AUTHOR}</a>
      <p class="label note__kicker"><span class="tick">CASE STUDY</span>${p.year ? ` · ${p.year}` : ''}</p>
      <h1 class="note__title">${p.emoji} ${esc(p.title)}</h1>
      <p class="note__dek">${esc(p.blurb)}</p>
      ${tagList(p.tags)}
      <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:2rem">
        <a class="btn btn--solid" href="/#/work/${p.study}">View the interactive case study →</a>
        ${live}
      </div>
      ${noteLink}
    </div></div>`
  write(
    `work/${p.study}/index.html`,
    page({
      title: `${p.title} — Case Study · ${AUTHOR}`,
      description: p.blurb,
      path: `/work/${p.study}/`,
      type: 'article',
      body,
    }),
  )
}

// ---- sitemap ----
{
  const today = new Date().toISOString().slice(0, 10)
  const urls: { loc: string; lastmod: string }[] = [
    { loc: `${SITE}/`, lastmod: today },
    { loc: `${SITE}/notes/`, lastmod: today },
    ...notes.map((n) => ({ loc: `${SITE}/notes/${n.slug}/`, lastmod: n.date })),
    ...projects
      .filter((p) => p.caseStudy && p.study)
      .map((p) => ({ loc: `${SITE}/work/${p.study}/`, lastmod: today })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
  .join('\n')}
</urlset>
`
  write('sitemap.xml', xml)
}

console.log('prerender: done')

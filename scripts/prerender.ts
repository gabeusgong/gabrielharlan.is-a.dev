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
 *   dist/og/*.png                  a branded social card per note/project/home
 *   dist/sitemap.xml               all of the above
 *   dist/feed.xml                  an RSS feed of the field notes
 *
 * Note pages also carry JSON-LD (Article) structured data and a reading-progress
 * bar; each page links the built CSS so it matches the in-app look. The SPA is
 * not booted on these pages, so the pre-rendered content is what's served.
 *
 * Each page carries its own <title>, description, canonical, and OG/Twitter
 * tags, and links the already-built CSS so it matches the in-app look. The SPA
 * is not booted on these pages, so the pre-rendered content is what's served.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { notes, projects, profile, noteNav, relatedNotes, type NoteBlock } from '../src/data'
import { renderOgCard, renderHomeCard } from './og'

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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

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
  image?: string // absolute og:image url; falls back to the site card
  jsonLd?: object // schema.org structured data
  body: string
}

function page({ title, description, path, type = 'website', image = OG_IMAGE, jsonLd, body }: PageOpts): string {
  const url = `${SITE}${path}`
  const t = esc(title)
  const d = esc(description)
  const img = esc(image)
  const ld = jsonLd
    ? `\n    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : ''
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
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <link rel="alternate" type="application/rss+xml" title="Gabriel Harlan — Field Notes" href="${SITE}/feed.xml" />${ld}
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
      if ('h' in b) return `<h3 class="note__h" id="${slugify(b.h)}">${esc(b.h)}</h3>`
      if ('quote' in b)
        return `<blockquote class="note__quote"><p>${esc(b.quote)}</p>${
          b.by ? `<cite>— ${esc(b.by)}</cite>` : ''
        }</blockquote>`
      return `<ul class="note__list">${b.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`
    })
    .join('\n        ')
}

function write(relPath: string, data: string | Buffer) {
  const full = resolve(DIST, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, data)
  console.log(`  ✓ ${relPath}`)
}

const tagList = (tags: string[]) =>
  `<ul class="note__tags">${tags.map((t) => `<li class="note__tag">${esc(t)}</li>`).join('')}</ul>`

// the same left-rail "depth gauge" the SPA shows (DepthGauge.tsx), replicated
// for the standalone pages so the descent progress matches the main site. Reuses
// the built .depthgauge CSS; a tiny vanilla script drives it since React isn't booted.
const DEPTHGAUGE = `<div class="depthgauge" aria-hidden><div class="depthgauge__track"><div class="depthgauge__fill" id="dgf"></div><div class="depthgauge__marker" id="dgm"><span class="depthgauge__label" id="dgl">120 m · twilight</span></div></div></div>`
const DEPTHGAUGE_SCRIPT = `<script>(function(){var f=document.getElementById('dgf'),m=document.getElementById('dgm'),l=document.getElementById('dgl');if(!f)return;var S=120,MX=240,Z=[[0,'twilight'],[0.3,'dark zone'],[0.62,'the deep'],[0.85,'the sump']];function u(){var mx=document.documentElement.scrollHeight-innerHeight,p=mx>0?Math.min(1,Math.max(0,scrollY/mx)):0,pct=(p*100).toFixed(1)+'%';f.style.height=pct;m.style.top=pct;var d=Math.round(S+p*(MX-S)),z='entrance';for(var i=Z.length-1;i>=0;i--){if(p>=Z[i][0]){z=Z[i][1];break}}l.textContent=d+' m · '+z}u();addEventListener('scroll',function(){requestAnimationFrame(u)},{passive:true});addEventListener('resize',u)})();</script>`

// a copy-link button (canonical page URL) + its tiny handler; on these static
// pages location.href already is the canonical /notes/<slug>/ or /work/<slug>/
const COPYLINK = `<button type="button" class="note__copy" id="cpy">🔗 Copy link</button>`
const COPYLINK_SCRIPT = `<script>(function(){var b=document.getElementById('cpy');if(!b||!navigator.clipboard)return;b.addEventListener('click',function(){navigator.clipboard.writeText(location.href.split('#')[0]).then(function(){var o=b.textContent;b.textContent='✓ Link copied';setTimeout(function(){b.textContent=o},1600)})})})();</script>`

// a static table of contents (real #fragment anchors work on these pages)
function tocMarkup(body: NoteBlock[]): string {
  const hs = body
    .filter((b): b is { h: string } => typeof b !== 'string' && 'h' in b)
    .map((b) => ({ id: slugify(b.h), text: b.h }))
  if (hs.length < 2) return ''
  return `<nav class="note__toc" aria-label="Contents">
          <p class="note__toc-head label">Contents</p>
          <ul>${hs.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ul>
        </nav>`
}

function relatedMarkup(slug: string): string {
  const rel = relatedNotes(slug)
  if (!rel.length) return ''
  return `<div class="note__related">
          <p class="label note__related-head">Related notes</p>
          <ul class="note__related-list">
            ${rel
              .map(
                (r) => `<li><a href="/notes/${r.slug}/" class="note__related-link"><span class="note__related-title">${esc(r.title)}</span><span class="note__related-dek">${esc(r.dek)}</span></a></li>`,
              )
              .join('\n            ')}
          </ul>
        </div>`
}

function pagerMarkup(slug: string): string {
  const { newer, older } = noteNav(slug)
  const link = (n: (typeof notes)[number] | null, dir: string, cls: string) =>
    n
      ? `<a href="/notes/${n.slug}/" class="note__pager-link note__pager-link--${cls}"><span class="note__pager-dir">${dir}</span><span class="note__pager-title">${esc(n.title)}</span></a>`
      : '<span></span>'
  // newest note: no "newer" — put the index link in the prev slot so it shares
  // the row with "Older →"
  const prev = newer
    ? link(newer, '← Newer', 'prev')
    : `<a href="/notes/" class="note__pager-link note__pager-link--prev"><span class="note__pager-dir">← Field Notes</span><span class="note__pager-title">All notes</span></a>`
  return `<nav class="note__pager" aria-label="More field notes">
          ${prev}
          ${link(older, 'Older →', 'next')}
        </nav>`
}

const rfc822 = (iso: string) => new Date(`${iso}T12:00:00Z`).toUTCString()

console.log('prerender: emitting static pages')

// ---- individual note pages ----
for (const n of notes) {
  const project = n.study ? projects.find((p) => p.study === n.study) : null
  // a custom social card, tinted with the related project's tone
  const noteCard = await renderOgCard({
    kicker: 'Field Note',
    title: n.title,
    dek: n.dek,
    tone: project?.tone ?? 'coral',
    tags: n.tags,
  })
  write(`og/notes-${n.slug}.png`, noteCard)
  const ogImage = `${SITE}/og/notes-${n.slug}.png`
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
  // the pager already carries the index link when this is the newest note
  const backBtn = noteNav(n.slug).newer
    ? `<a href="/#/notes" class="btn btn--ghost note__back">← all field notes</a>`
    : ''
  const body = `    ${DEPTHGAUGE}
    <div class="notespage"><div class="notespage__inner section">
      <article class="note">
        <a href="/" class="note__crumb">← ${AUTHOR}</a>
        <p class="label note__kicker"><span class="tick">FIELD NOTE</span> · ${fmtDate(n.date)} · ${n.minutes} min</p>
        <h1 class="note__title">${esc(n.title)}</h1>
        <p class="note__dek">${esc(n.dek)}</p>
        ${tagList(n.tags)}
        ${COPYLINK}
        ${tocMarkup(n.body)}
        <div class="note__body">
        ${renderBlocks(n.body)}
        </div>
        ${crosslink}
        ${relatedMarkup(n.slug)}
        ${pagerMarkup(n.slug)}
        ${backBtn}
      </article>
    </div></div>
    ${DEPTHGAUGE_SCRIPT}
    ${COPYLINK_SCRIPT}`
  write(
    `notes/${n.slug}/index.html`,
    page({
      title: `${n.title} — Field Notes · ${AUTHOR}`,
      description: n.dek,
      path: `/notes/${n.slug}/`,
      type: 'article',
      image: ogImage,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: n.title,
        description: n.dek,
        datePublished: n.date,
        dateModified: n.date,
        image: ogImage,
        url: `${SITE}/notes/${n.slug}/`,
        mainEntityOfPage: `${SITE}/notes/${n.slug}/`,
        keywords: n.tags.join(', '),
        author: { '@type': 'Person', name: AUTHOR, url: SITE },
        publisher: { '@type': 'Person', name: AUTHOR, url: SITE },
      },
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
  const workCard = await renderOgCard({
    kicker: 'Case Study',
    title: p.title,
    dek: p.blurb,
    tone: p.tone,
    tags: p.tags,
  })
  write(`og/work-${p.study}.png`, workCard)
  const ogImage = `${SITE}/og/work-${p.study}.png`
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
      ${COPYLINK}
      ${noteLink}
    </div></div>
    ${COPYLINK_SCRIPT}`
  write(
    `work/${p.study}/index.html`,
    page({
      title: `${p.title} — Case Study · ${AUTHOR}`,
      description: p.blurb,
      path: `/work/${p.study}/`,
      type: 'article',
      image: ogImage,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: p.title,
        description: p.blurb,
        image: ogImage,
        url: `${SITE}/work/${p.study}/`,
        keywords: p.tags.join(', '),
        ...(p.href ? { sameAs: p.href } : {}),
        author: { '@type': 'Person', name: AUTHOR, url: SITE },
      },
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

// ---- RSS feed (field notes) ----
{
  const items = notes
    .map(
      (n) => `  <item>
    <title>${esc(n.title)}</title>
    <link>${SITE}/notes/${n.slug}/</link>
    <guid isPermaLink="true">${SITE}/notes/${n.slug}/</guid>
    <pubDate>${rfc822(n.date)}</pubDate>
    <description>${esc(n.dek)}</description>
${n.tags.map((t) => `    <category>${esc(t)}</category>`).join('\n')}
  </item>`,
    )
    .join('\n')
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Gabriel Harlan — Field Notes</title>
  <link>${SITE}/notes/</link>
  <description>Short writing on the thinking behind my projects — design calls, trade-offs, and lessons from shipping.</description>
  <language>en-us</language>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>
`
  write('feed.xml', feed)
}

// ---- homepage social card + head wiring ----
{
  const homeCard = await renderHomeCard({
    eyebrow: 'Web & UX Designer',
    tagline: profile.tagline,
  })
  // versioned filename so LinkedIn/Slack/etc. fetch a URL they've never cached
  // (they cache OG images by URL — reusing home.png would keep serving the old
  // card forever). Bump the version to force a fresh scrape after a redesign.
  write('og/home-v2.png', homeCard)

  // point the built SPA index.html's social image at the branded home card and
  // advertise the feed. Source index.html stays clean — only the built copy is
  // rewritten, and only if the build ran (which always includes this step).
  const homeImg = `${SITE}/og/home-v2.png`
  let idx = readFileSync(resolve(DIST, 'index.html'), 'utf8')
  idx = idx
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${homeImg}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${homeImg}$2`)
  if (!idx.includes('type="application/rss+xml"')) {
    idx = idx.replace(
      '</head>',
      `    <link rel="alternate" type="application/rss+xml" title="Gabriel Harlan — Field Notes" href="${SITE}/feed.xml" />\n  </head>`,
    )
  }
  writeFileSync(resolve(DIST, 'index.html'), idx)
  console.log('  ✓ index.html (home og:image + feed link)')
}

console.log('prerender: done')

import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { notes, projects, noteNav, relatedNotes, type Note, type NoteBlock } from '../data'

/* "Field Notes" — a small writing section on its own route. #/notes shows the
   index; #/notes/<slug> shows one note. It reads the slug straight off the hash
   and keeps it in sync itself, so App's router only has to know about "notes".
   Content lives in `notes` in data.ts. */

const slugFromHash = () => {
  const h = typeof window !== 'undefined' ? window.location.hash : ''
  const m = h.match(/^#\/notes\/(.+)$/)
  return m ? decodeURIComponent(m[1]) : null
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

// stable id for a heading, so the TOC can link to it
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// the {h} blocks, in order — used to build the table of contents
const headingsOf = (note: Note) =>
  note.body
    .filter((b): b is { h: string } => typeof b !== 'string' && 'h' in b)
    .map((b) => ({ id: slugify(b.h), text: b.h }))

// an inline table of contents that highlights the section you're reading
function Toc({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? '')
  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting)
        if (hit.length) setActive((hit[0].target as HTMLElement).id)
      },
      { rootMargin: '0px 0px -70% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [headings])
  return (
    <nav className="note__toc" aria-label="Contents">
      <p className="note__toc-head label">Contents</p>
      <ul>
        {headings.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              className={h.id === active ? 'is-active' : ''}
              onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })}
              data-cursor
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// copies the note/case-study's canonical (pre-rendered) URL to the clipboard
function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked — no-op */
    }
  }
  return (
    <>
      <button type="button" className="note__copy" onClick={onCopy} data-cursor>
        {copied ? '✓ Link copied' : '🔗 Copy link'}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </>
  )
}

function Block({ block }: { block: NoteBlock }) {
  if (typeof block === 'string') return <p className="note__p">{block}</p>
  if ('h' in block)
    return (
      <h2 className="note__h" id={slugify(block.h)}>
        {block.h}
      </h2>
    )
  if ('quote' in block)
    return (
      <blockquote className="note__quote">
        <p>{block.quote}</p>
        {block.by && <cite>— {block.by}</cite>}
      </blockquote>
    )
  return (
    <ul className="note__list">
      {block.list.map((li, i) => (
        <li key={i}>{li}</li>
      ))}
    </ul>
  )
}

function Article({ note }: { note: Note }) {
  // the project this note is the story behind, if any
  const project = note.study ? projects.find((p) => p.study === note.study) : null
  const { newer, older } = noteNav(note.slug)
  const related = relatedNotes(note.slug)
  const headings = headingsOf(note)
  return (
    <article className="note">
      <Reveal>
        <a href="#/notes" className="note__crumb" data-cursor>
          ← Field Notes
        </a>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="label note__kicker">
          <span className="tick">FIELD NOTE</span> · {fmtDate(note.date)} · {note.minutes} min
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="note__title">{note.title}</h1>
      </Reveal>
      <Reveal delay={0.14}>
        <p className="note__dek">{note.dek}</p>
      </Reveal>
      <Reveal delay={0.18}>
        <ul className="note__tags" aria-label="Tags">
          {note.tags.map((t) => (
            <li key={t} className="note__tag">
              {t}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.2}>
        <CopyLink path={`/notes/${note.slug}/`} />
      </Reveal>
      {headings.length >= 2 && (
        <Reveal delay={0.22}>
          <Toc headings={headings} />
        </Reveal>
      )}
      <div className="note__body">
        {note.body.map((block, i) => (
          <Reveal key={i} delay={0.06}>
            <Block block={block} />
          </Reveal>
        ))}
      </div>

      {project && (
        <Reveal delay={0.05}>
          <a className="note__crosslink" href={`#/work/${project.study}`} data-cursor>
            <span className="note__crosslink-emoji" aria-hidden>
              {project.emoji}
            </span>
            <span className="note__crosslink-text">
              <span className="note__crosslink-tag label">The project</span>
              <span className="note__crosslink-title">{project.title}</span>
            </span>
            <span className="note__crosslink-go">See the case study →</span>
          </a>
        </Reveal>
      )}

      {related.length > 0 && (
        <Reveal delay={0.05}>
          <div className="note__related">
            <p className="label note__related-head">Related notes</p>
            <ul className="note__related-list">
              {related.map((r) => (
                <li key={r.slug}>
                  <a href={`#/notes/${r.slug}`} className="note__related-link" data-cursor>
                    <span className="note__related-title">{r.title}</span>
                    <span className="note__related-dek">{r.dek}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.05}>
        <nav className="note__pager" aria-label="More field notes">
          {newer ? (
            <a href={`#/notes/${newer.slug}`} className="note__pager-link note__pager-link--prev" data-cursor>
              <span className="note__pager-dir">← Newer</span>
              <span className="note__pager-title">{newer.title}</span>
            </a>
          ) : (
            // newest note: no "newer" — put the index link here so it shares the
            // row with "Older →" instead of leaving an empty slot
            <a href="#/notes" className="note__pager-link note__pager-link--prev" data-cursor>
              <span className="note__pager-dir">← Field Notes</span>
              <span className="note__pager-title">All notes</span>
            </a>
          )}
          {older ? (
            <a href={`#/notes/${older.slug}`} className="note__pager-link note__pager-link--next" data-cursor>
              <span className="note__pager-dir">Older →</span>
              <span className="note__pager-title">{older.title}</span>
            </a>
          ) : (
            <span />
          )}
        </nav>
      </Reveal>

      {/* only when the index link isn't already in the pager (i.e. there is a newer note) */}
      {newer && (
        <Reveal delay={0.05}>
          <a href="#/notes" className="btn btn--ghost note__back" data-cursor>
            ← all field notes
          </a>
        </Reveal>
      )}
    </article>
  )
}

// every tag used across the notes, in first-seen order
const ALL_TAGS = [...new Set(notes.flatMap((n) => n.tags))]

function Index() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const filtered = notes.filter(
    (n) =>
      (!tag || n.tags.includes(tag)) &&
      (!q || `${n.title} ${n.dek} ${n.tags.join(' ')}`.toLowerCase().includes(q)),
  )

  return (
    <>
      <Reveal>
        <p className="label">
          <span className="tick">✦</span> /notes
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="notes__heading">
          Field <span className="notes__word">notes.</span>
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="notes__sub">
          Short writing on the thinking behind the projects — the calls, the trade-offs, and the
          things I only understood after shipping.
        </p>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="notes__controls">
          <input
            type="search"
            className="notes__search"
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search field notes"
            data-cursor
          />
          <div className="notes__filters" role="group" aria-label="Filter by tag">
            <button
              type="button"
              className={`notes__chip ${tag === null ? 'is-active' : ''}`}
              onClick={() => setTag(null)}
              data-cursor
            >
              All
            </button>
            {ALL_TAGS.map((t) => (
              <button
                type="button"
                key={t}
                className={`notes__chip ${tag === t ? 'is-active' : ''}`}
                onClick={() => setTag((cur) => (cur === t ? null : t))}
                data-cursor
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <p className="sr-only" role="status" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
        {tag || q ? ' match your filter' : ''}
      </p>
      {filtered.length > 0 ? (
        <div className="notes__list">
          {filtered.map((n, i) => (
            <Reveal key={n.slug} delay={0.06 + i * 0.05}>
              <a href={`#/notes/${n.slug}`} className="notecard" data-cursor>
                <p className="notecard__meta label">
                  {fmtDate(n.date)} · {n.minutes} min
                </p>
                <h2 className="notecard__title">{n.title}</h2>
                <p className="notecard__dek">{n.dek}</p>
                <ul className="notecard__tags" aria-hidden>
                  {n.tags.map((t) => (
                    <li key={t} className="note__tag">
                      {t}
                    </li>
                  ))}
                </ul>
                <span className="notecard__go">Read →</span>
              </a>
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="notes__empty">
          No notes match{tag ? ` “${tag}”` : ''}
          {q ? ` for “${query.trim()}”` : ''}.{' '}
          <button
            type="button"
            className="notes__clear"
            onClick={() => {
              setQuery('')
              setTag(null)
            }}
            data-cursor
          >
            Clear filters
          </button>
        </p>
      )}

      <Reveal delay={0.3}>
        <a href="#top" className="btn btn--ghost notes__back" data-cursor>
          ← back to the site
        </a>
      </Reveal>
    </>
  )
}

export default function FieldNotes() {
  const [slug, setSlug] = useState(slugFromHash)

  // keep the slug in sync as the hash changes between #/notes and
  // #/notes/<slug>, and reset scroll on each switch so reveals evaluate in view
  useEffect(() => {
    const onHash = () => {
      setSlug(slugFromHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const note = slug ? notes.find((n) => n.slug === slug) : null

  return (
    <div className="notespage" id="notes">
      <div className="notespage__inner section">
        {slug && !note ? (
          <>
            <p className="label">
              <span className="tick">404</span> · note not found
            </p>
            <h1 className="notes__heading">
              That note isn’t <span className="notes__word">here.</span>
            </h1>
            <a href="#/notes" className="btn btn--ghost notes__back" data-cursor>
              ← all field notes
            </a>
          </>
        ) : note ? (
          <Article note={note} />
        ) : (
          <Index />
        )}
      </div>
    </div>
  )
}

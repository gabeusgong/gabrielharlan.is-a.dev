import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { notes, projects, type Note, type NoteBlock } from '../data'

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

function Block({ block }: { block: NoteBlock }) {
  if (typeof block === 'string') return <p className="note__p">{block}</p>
  if ('h' in block) return <h3 className="note__h">{block.h}</h3>
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

      <Reveal delay={0.05}>
        <a href="#/notes" className="btn btn--ghost note__back" data-cursor>
          ← all field notes
        </a>
      </Reveal>
    </article>
  )
}

function Index() {
  return (
    <>
      <Reveal>
        <p className="label">
          <span className="tick">✦</span> /notes
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="notes__heading">
          Field <span className="notes__word">notes.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="notes__sub">
          Short writing on the thinking behind the projects — the calls, the trade-offs, and the
          things I only understood after shipping.
        </p>
      </Reveal>

      <div className="notes__list">
        {notes.map((n, i) => (
          <Reveal key={n.slug} delay={0.14 + i * 0.05}>
            <a href={`#/notes/${n.slug}`} className="notecard" data-cursor>
              <p className="notecard__meta label">
                {fmtDate(n.date)} · {n.minutes} min
              </p>
              <h3 className="notecard__title">{n.title}</h3>
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
            <h2 className="notes__heading">
              That note isn’t <span className="notes__word">here.</span>
            </h2>
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

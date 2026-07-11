import Reveal from './Reveal'
import { notes } from '../data'

/* A small teaser on the home page so visitors discover the writing without
   hunting through the nav. Shows the three most recent field notes and links
   to the full section (#/notes). Content lives in `notes` in data.ts. */

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export default function NotesTeaser() {
  const latest = notes.slice(0, 3)
  if (!latest.length) return null

  return (
    <section className="section noteteaser" id="notes-teaser">
      <div className="noteteaser__head">
        <Reveal>
          <p className="label">
            <span className="tick">05</span> / field notes
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="noteteaser__heading">
            Lately, I&apos;ve been <span className="noteteaser__under">writing.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="noteteaser__sub">
            Short pieces on the thinking behind the work — the calls, the trade-offs, and the things
            I only understood after shipping.
          </p>
        </Reveal>
      </div>

      <div className="noteteaser__grid">
        {latest.map((n, i) => (
          <Reveal key={n.slug} delay={0.12 + i * 0.05}>
            <a href={`#/notes/${n.slug}`} className="notecard" data-cursor>
              <p className="notecard__meta label">
                {fmtDate(n.date)} · {n.minutes} min
              </p>
              <h3 className="notecard__title">{n.title}</h3>
              <p className="notecard__dek">{n.dek}</p>
              <span className="notecard__go">Read →</span>
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.28}>
        <a href="#/notes" className="btn btn--ghost noteteaser__all" data-cursor>
          Read all field notes →
        </a>
      </Reveal>
    </section>
  )
}

import { projects, tones, type Project } from '../data'
import Reveal from './Reveal'
import { track } from '../lib/track'

// The "30-second version" band: for the recruiter who won't scroll the whole
// playground. Substance first — role, three shipped projects with one-line
// outcomes, and the résumé — right under the hero. Each row deep-links to the
// interactive case study (#/work/<slug>), which Projects opens in place.
type Highlight = { study: NonNullable<Project['study']>; outcome: string }

const highlights: Highlight[] = [
  { study: 'tracisms', outcome: 'Shipped solo to production — texting an AI tire agent over SMS.' },
  { study: 'karst', outcome: 'Privacy-first caving field guide, live on web + Android.' },
  { study: 'itit', outcome: 'IoT inventory tracker, delivered with a 4-person capstone team.' },
]

const byStudy = (s: Highlight['study']) => projects.find((p) => p.study === s)

export default function Snapshot() {
  return (
    <section className="section snapshot" id="snapshot" aria-label="At a glance">
      <div className="snapshot__card">
        <Reveal>
          <p className="label snapshot__kicker">
            <span className="tick">TL;DR</span> · the 30-second version
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <p className="snapshot__lead">
            Senior Informatics student and <strong>UX-minded front-end engineer</strong> — I
            design in Figma and ship the whole thing, from the interface through the production
            backend.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="snapshot__list">
            {highlights.map(({ study, outcome }) => {
              const p = byStudy(study)
              if (!p) return null
              return (
                <li key={study}>
                  <a
                    className="snapshot__row"
                    href={`#/work/${study}`}
                    data-cursor
                    onClick={() => track(`snapshot-${study}`)}
                  >
                    <span
                      className="snapshot__swatch"
                      style={{ background: tones[p.tone] }}
                      aria-hidden
                    />
                    <span className="snapshot__row-text">
                      <span className="snapshot__row-title">{p.title}</span>
                      <span className="snapshot__row-outcome">{outcome}</span>
                    </span>
                    <span className="snapshot__row-go" aria-hidden>
                      →
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="snapshot__cta">
            <a
              className="btn btn--solid"
              href="./resume/"
              target="_blank"
              rel="noreferrer"
              data-cursor
              onClick={() => track('resume')}
            >
              Résumé ↗
            </a>
            <a className="btn btn--ghost" href="#work" data-cursor>
              See the full work →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

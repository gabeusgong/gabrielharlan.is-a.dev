import Reveal from './Reveal'
import { uses } from '../data'

/* A "/uses" page — the gear, stack, and habits behind the work. Its own route
   (#/uses), styled to match the site. Content lives in `uses` in data.ts. */
export default function Uses() {
  return (
    <div className="usespage" id="uses">
      <div className="usespage__inner section">
        <Reveal>
          <p className="label">
            <span className="tick">✦</span> /uses
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="uses__heading">
            The stuff <span className="uses__word">behind the stuff.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="uses__sub">
            The keyboard, the stack, and what&apos;s on (and off) the desk. Tuned constantly —
            like everything else here.
          </p>
        </Reveal>

        <div className="uses__grid">
          {uses.map((g, gi) => (
            <Reveal key={g.group} delay={0.12 + gi * 0.04}>
              <section className={`uses__group g-${g.tone}`}>
                <h3 className="uses__group-head">
                  <span className={`chip chip--${g.tone}`} aria-hidden />
                  {g.group}
                </h3>
                <ul className="uses__list">
                  {g.items.map((it) => (
                    <li key={it.name} className="uses__item">
                      <span className="uses__item-name">{it.name}</span>
                      {it.note && <span className="uses__item-note">{it.note}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <a href="#top" className="btn btn--ghost uses__back" data-cursor>
            ← back to the site
          </a>
        </Reveal>
      </div>
    </div>
  )
}

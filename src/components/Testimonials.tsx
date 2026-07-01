import { testimonials } from '../data'
import Reveal from './Reveal'

/* "Kind words" — renders only when there's at least one testimonial in data.ts.
   Uses a non-numeric tick so it never disturbs the section numbering. */
export default function Testimonials() {
  if (!testimonials.length) return null

  return (
    <section className="section kudos" id="kudos">
      <Reveal>
        <p className="label">
          <span className="tick">✦</span> kind words
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="kudos__heading">
          Kind <span className="kudos__word">words.</span>
        </h2>
      </Reveal>

      <div className="kudos__grid">
        {testimonials.map((t, i) => (
          <Reveal className="kudos__card" delay={0.1 + i * 0.06} key={t.name}>
            <p className="kudos__quote">&ldquo;{t.quote}&rdquo;</p>
            <p className="kudos__by">
              <strong>{t.name}</strong>
              <span>{t.role}</span>
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

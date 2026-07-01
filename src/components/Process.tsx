import { tones, type Sticker } from '../data'
import Reveal from './Reveal'

type Step = { emoji: string; title: string; text: string; tone: Sticker['tone'] }

const STEPS: Step[] = [
  {
    emoji: '🎧',
    title: 'Understand',
    tone: 'coral',
    text: 'Start with the people and the problem. Ask questions, dig into the context, and figure out what actually needs solving before I touch a pixel.',
  },
  {
    emoji: '✏️',
    title: 'Sketch',
    tone: 'cobalt',
    text: 'Rough it out cheap and fast — paper, wireframes, quick flows. Explore a lot of directions while they are still easy to throw away.',
  },
  {
    emoji: '🛠️',
    title: 'Build',
    tone: 'lime',
    text: 'Prototype in real code early. Something you can click and feel beats something you can only describe in a slide deck.',
  },
  {
    emoji: '🔎',
    title: 'Refine',
    tone: 'sun',
    text: 'Test with real people, check accessibility and contrast, and cut anything that is not earning its place. Then loop back to the top.',
  },
]

export default function Process() {
  return (
    <section className="section process" id="process">
      <div className="process__head">
        <Reveal>
          <p className="label">
            <span className="tick">03</span> / how I work
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="process__heading">
            How I <span className="process__word">work.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="process__intro">
            Design is a loop, not a line. This is the rhythm I come back to on every project —
            people first, ship early, and keep sanding down the rough edges.
          </p>
        </Reveal>
      </div>

      <div className="process__steps">
        {STEPS.map((s, i) => (
          <Reveal className="process__step" delay={0.12 + i * 0.06} key={s.title}>
            <span className="process__no label">0{i + 1}</span>
            <span className="process__emoji" style={{ background: tones[s.tone] }}>
              {s.emoji}
            </span>
            <h3 className="process__step-title">{s.title}</h3>
            <p className="process__step-text">{s.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.4}>
        <p className="process__loop label">↻ &nbsp;and back to the top</p>
      </Reveal>
    </section>
  )
}

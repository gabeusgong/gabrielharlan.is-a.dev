import { useRef, useState } from 'react'
import { unlock } from '../lib/achievements'

// a small bank of common words; the test string is generated fresh each round
const WORDS =
  'the of and to in that have for not with you this but his they at from say her she will one all would there their what out about who get which when make can like time just him know take people into year your good some could them see other than then now look only come over think also back after use two how our work first well even want way these give most tune build type hand code word line edit press layer board right place small great still every world light story point group keep found part here'.split(
    ' ',
  )

function genPhrase(count = 10) {
  const out: string[] = []
  let prev = ''
  while (out.length < count) {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)]
    if (w !== prev) {
      out.push(w)
      prev = w
    }
  }
  return out.join(' ')
}

/* A tiny WPM typing test for the Corne case study — feel the keyboard the OLED
   is measuring. Hidden input; the sample line is the interactive display. */
export default function TypingTest() {
  const [sample, setSample] = useState(genPhrase)
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const done = typed.length >= sample.length
  const correct = [...typed].filter((c, i) => c === sample[i]).length
  const elapsedMin = startedAt ? (performance.now() - startedAt) / 60000 : 0
  const wpm = elapsedMin > 0 ? Math.round(correct / 5 / elapsedMin) : 0
  const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100

  const onChange = (v: string) => {
    const begin = startedAt ?? (v.length ? performance.now() : null)
    if (startedAt === null && begin) setStartedAt(begin)
    // light up the pressed key on the keymap above
    if (v.length > typed.length) {
      window.dispatchEvent(new CustomEvent('corne-key', { detail: v[v.length - 1] }))
    }
    const next = v.slice(0, sample.length)
    setTyped(next)
    // secret: finish the phrase at 100+ wpm and 100% accuracy
    if (next.length === sample.length && begin) {
      const correctN = [...next].filter((c, i) => c === sample[i]).length
      const mins = (performance.now() - begin) / 60000
      const w = mins > 0 ? Math.round(correctN / 5 / mins) : 0
      const a = Math.round((correctN / next.length) * 100)
      if (w >= 100 && a === 100) unlock('speed')
    }
  }
  const reset = () => {
    setSample(genPhrase())
    setTyped('')
    setStartedAt(null)
    inputRef.current?.focus()
  }

  return (
    <div className="typetest" onClick={() => inputRef.current?.focus()}>
      <p className="typetest__sample" aria-hidden>
        {[...sample].map((ch, i) => {
          const state =
            i < typed.length ? (typed[i] === ch ? 'ok' : 'bad') : i === typed.length ? 'cur' : ''
          return (
            <span key={i} className={`typetest__ch ${state ? `typetest__ch--${state}` : ''}`}>
              {ch}
            </span>
          )
        })}
      </p>
      <input
        ref={inputRef}
        className="typetest__input"
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Type the sample sentence"
        spellCheck={false}
        autoComplete="off"
      />
      <div className="typetest__stats label">
        <span className="typetest__wpm">{wpm} wpm</span>
        <span>{acc}% acc</span>
        {done ? (
          <button type="button" className="typetest__again" onClick={reset} data-cursor>
            try again ↺
          </button>
        ) : (
          <span className="typetest__hint">click &amp; type it</span>
        )}
      </div>
    </div>
  )
}

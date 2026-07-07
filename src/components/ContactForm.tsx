import { useState, type FormEvent } from 'react'
import Reveal from './Reveal'
import { track } from '../lib/track'

// Create a free form at formspree.io and paste its ID here (the part after /f/).
// While this is empty the form is hidden and the direct links below still work.
const FORMSPREE_ID = 'xeebrvgd'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  if (!FORMSPREE_ID) return null

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        track('contact-submit')
        setStatus('ok')
        form.reset()
      } else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Reveal delay={0.1}>
      <form className="cform" onSubmit={onSubmit}>
        {status === 'ok' ? (
          <p className="cform__done" role="status">
            Thanks — I&apos;ll get back to you soon. 🦇
          </p>
        ) : (
          <>
            <div className="cform__row">
              <input
                className="cform__input"
                name="name"
                placeholder="your name"
                required
                aria-label="Your name"
              />
              <input
                className="cform__input"
                type="email"
                name="email"
                placeholder="your email"
                required
                aria-label="Your email"
              />
            </div>
            <textarea
              className="cform__input cform__area"
              name="message"
              placeholder="what should we build?"
              rows={4}
              required
              aria-label="Message"
            />
            <div className="cform__foot">
              <button
                className="btn btn--solid"
                type="submit"
                data-cursor
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'sending…' : 'send it →'}
              </button>
              {status === 'error' && (
                <span className="cform__err" role="alert">
                  something broke — email me instead?
                </span>
              )}
            </div>
          </>
        )}
      </form>
    </Reveal>
  )
}

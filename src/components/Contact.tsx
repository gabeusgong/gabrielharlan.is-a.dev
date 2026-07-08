import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { profile, links } from '../data'
import Reveal from './Reveal'
import ContactForm from './ContactForm'
import { track } from '../lib/track'

const REPO = 'https://github.com/gabeusgong/gabrielharlan.design'

const rows = [
  { key: 'email', label: 'Email', value: links.email, href: `mailto:${links.email}` },
  { key: 'github', label: 'GitHub', value: links.github, href: links.github },
  { key: 'linkedin', label: 'LinkedIn', value: links.linkedin, href: links.linkedin },
  { key: 'twitter', label: 'Twitter / X', value: links.twitter, href: links.twitter },
].filter((r) => r.value)

const clean = (v: string) => v.replace(/^https?:\/\//, '').replace(/\/$/, '')

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    track('email-copy')
    navigator.clipboard?.writeText(links.email).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <section className="section contact" id="contact">
      <Reveal>
        <p className="label">
          <span className="tick">06</span> / let&apos;s talk
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 className="contact__heading">
          Got something
          <br />
          <span className="contact__big">weird &amp; useful</span>
          <br />
          to build?
        </h2>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="contact__avail">
          <span className="contact__avail-dot" />
          <span>{profile.availability}</span>
          <span className="contact__avail-dot contact__avail-dot--end" aria-hidden />
        </p>
      </Reveal>

      <ContactForm />

      <Reveal delay={0.12}>
        <ul className="contact__list">
          {rows.map((r) =>
            r.key === 'email' ? (
              <li key={r.key}>
                <motion.div
                  className="contact__row"
                  whileHover={{ x: 14 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <span className="contact__row-label label">{r.label}</span>
                  <a className="contact__row-value contact__maillink" href={r.href} data-cursor>
                    {clean(r.value)}
                  </a>
                  <button className="contact__copy" onClick={copyEmail} data-cursor>
                    {copied ? 'copied ✓' : 'copy'}
                  </button>
                </motion.div>
              </li>
            ) : (
              <li key={r.key}>
                <motion.a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="contact__row"
                  data-cursor
                  whileHover={{ x: 14 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <span className="contact__row-label label">{r.label}</span>
                  <span className="contact__row-value">{clean(r.value)}</span>
                  <span className="contact__row-arrow">↗</span>
                </motion.a>
              </li>
            ),
          )}
        </ul>
      </Reveal>

      <Reveal delay={0.18}>
        <a
          className="btn btn--solid contact__resume"
          href="./Gabriel-Harlan-Resume.pdf"
          target="_blank"
          rel="noreferrer"
          data-cursor
          onClick={() => track('resume')}
        >
          Download résumé ↓
        </a>
      </Reveal>

      <footer className="footer">
        <span className="label">© {profile.name} · built with care, thanks for scrolling</span>
        <a href={REPO} target="_blank" rel="noreferrer" className="footer__src label" data-cursor>
          view source ↗
        </a>
      </footer>

      <AnimatePresence>
        {copied && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 12, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 12, x: '-50%' }}
          >
            Email copied ✓
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

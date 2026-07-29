import { useEffect, useState } from 'react'
import Reveal from './Reveal'

/* A live "recently shipped" strip pulled from the GitHub public API — my most
   recently pushed repos. Uses stale-while-revalidate: any cached list renders
   instantly (no empty flash, and it keeps requests well under the ~60/hr
   unauthenticated limit), then it re-fetches in the background whenever the
   cache is older than REVALIDATE so a fresh push shows up within ~30 min.
   Renders nothing on failure so the page never shows a broken/empty section. */

const USER = 'gabeusgong'
// v3: bump busts every visitor's stale v2 cache on next load
const CACHE_KEY = 'gh-recent-v3'
const REVALIDATE = 30 * 60 * 1000 // re-fetch in the background after 30 min

type Repo = {
  name: string
  description: string | null
  html_url: string
  pushed_at: string
  language: string | null
}

// per-repo tag overrides — GitHub's auto-detected language is blank or wrong
// for some repos (e.g. zmk-config, which is devicetree/Kconfig it can't label)
const TAG_OVERRIDES: Record<string, string[]> = {
  'zmk-config': ['Firmware'],
  karst: ['Next.js', 'Firebase'],
  'gabrielharlan.is-a.dev': ['TypeScript', 'HTML'],
}

// fallback descriptions so every card has a blurb even when the repo's GitHub
// description is empty. A live GitHub description always wins over these.
const DESC_OVERRIDES: Record<string, string> = {
  karst:
    "A caver's field guide to southern Indiana's karst — a privacy-first cave map, record-once / follow-in trails, and grotto tools, built on Next.js + Firebase.",
  'gabrielharlan.is-a.dev':
    'This site — a Vite + React + TypeScript portfolio, easter eggs and all.',
  'zmk-config':
    'ZMK firmware for my hand-wired wireless split Corne — custom layers, combos, and a scroll encoder.',
}
const GENERIC_DESC = 'A recent project — open the repo for the details.'

const ago = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

export default function RecentlyShipped() {
  const [repos, setRepos] = useState<Repo[] | null>(null)

  useEffect(() => {
    let cachedAt = 0
    // show any cached list immediately, then decide whether to revalidate
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const { at, data } = JSON.parse(raw)
        if (Array.isArray(data) && data.length) {
          setRepos(data)
          cachedAt = at
        }
      }
    } catch {
      /* ignore bad cache */
    }

    // fresh enough — skip the network entirely
    if (cachedAt && Date.now() - cachedAt < REVALIDATE) return

    let cancelled = false
    fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=12`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((all: (Repo & { fork: boolean })[]) => {
        if (cancelled || !Array.isArray(all)) return
        const top: Repo[] = all
          .filter((r) => !r.fork)
          .slice(0, 4)
          .map((r) => ({
            name: r.name,
            description: r.description,
            html_url: r.html_url,
            pushed_at: r.pushed_at,
            language: r.language,
          }))
        if (!top.length) return
        setRepos(top)
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: top }))
        } catch {
          /* storage full/blocked — fine */
        }
      })
      .catch(() => {
        /* offline or rate-limited — stay hidden */
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!repos || !repos.length) return null

  return (
    <section className="section shipped" id="shipped">
      <Reveal>
        <p className="label">
          <span className="tick">07</span> / recently shipped
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="shipped__heading">
          Fresh from <span className="shipped__under">the workbench.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="shipped__sub">
          Live from GitHub — whatever I&apos;ve pushed most recently. Not curated; just what I&apos;m
          actually working on.
        </p>
      </Reveal>

      <div className="shipped__grid">
        {repos.map((r, i) => (
          <Reveal key={r.name} delay={0.12 + i * 0.05}>
            <article className="shipcard">
              <div className="shipcard__top">
                <span className="shipcard__name">{r.name}</span>
                {(() => {
                  const tags = TAG_OVERRIDES[r.name] ?? (r.language ? [r.language] : [])
                  return tags.length ? (
                    <span className="shipcard__tags">
                      {tags.map((t) => (
                        <span key={t} className="shipcard__lang">
                          {t}
                        </span>
                      ))}
                    </span>
                  ) : null
                })()}
              </div>
              <p className="shipcard__desc">
                {r.description ?? DESC_OVERRIDES[r.name] ?? GENERIC_DESC}
              </p>
              <span className="shipcard__meta label">↑ pushed {ago(r.pushed_at)}</span>
              <a
                href={r.html_url}
                target="_blank"
                rel="noreferrer"
                className="shipcard__btn"
                data-cursor
                aria-label={`View ${r.name} on GitHub`}
              >
                View on GitHub ↗
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

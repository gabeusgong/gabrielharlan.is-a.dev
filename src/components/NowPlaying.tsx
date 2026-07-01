import { useEffect, useState } from 'react'

// Last.fm (Apple Music scrobbles here via a helper app). The API key is a
// client key and safe to ship. Set USER to '' to hide the widget.
const USER = 'gabeusgong'
const API_KEY = '10ed12f9dd116bc495ff66f0aae00e21'
const MIN_KEY = 'gh-np-min'

type Track = { name: string; artist: string; url: string; now: boolean; art: string }

export default function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null)
  const [min, setMin] = useState(() => {
    try {
      return localStorage.getItem(MIN_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!USER || !API_KEY) return
    let alive = true
    const fetchTrack = async () => {
      try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USER}&api_key=${API_KEY}&format=json&limit=1`
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()
        const t = data?.recenttracks?.track?.[0]
        if (!t || !alive) return
        const images: Array<{ size: string; '#text': string }> = t.image ?? []
        const art =
          images.find((i) => i.size === 'extralarge')?.['#text'] ||
          images[images.length - 1]?.['#text'] ||
          ''
        setTrack({
          name: t.name,
          artist: t.artist?.['#text'] ?? '',
          url: t.url ?? '#',
          now: t['@attr']?.nowplaying === 'true',
          art,
        })
      } catch {
        /* offline / rate-limited — just hide */
      }
    }
    fetchTrack()
    const id = window.setInterval(fetchTrack, 60000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [])

  const toggle = () =>
    setMin((m) => {
      const n = !m
      try {
        localStorage.setItem(MIN_KEY, n ? '1' : '0')
      } catch {
        /* ignore */
      }
      return n
    })

  if (!track) return null

  if (min) {
    return (
      <button
        className="np-fab"
        onClick={toggle}
        data-cursor
        aria-label={`Expand now playing: ${track.name}`}
        title={`${track.name} — ${track.artist}`}
      >
        {track.art ? <img src={track.art} alt="" /> : <span className="np-fab__note">♪</span>}
        {track.now && <span className="np-fab__pulse" aria-hidden />}
      </button>
    )
  }

  return (
    <section className={`np-card ${track.now ? 'np-card--live' : ''}`} aria-label="Now playing">
      <div className="np-card__cover">
        {track.art ? (
          <img src={track.art} alt="Album cover" />
        ) : (
          <span className="np-card__note">♪</span>
        )}
        <span className="np-card__eq" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </div>
      <a className="np-card__info" href={track.url} target="_blank" rel="noreferrer" data-cursor>
        <span className="np-card__label label">
          {track.now ? 'now playing' : 'last played'} · last.fm
        </span>
        <span className="np-card__track">{track.name}</span>
        <span className="np-card__artist">{track.artist}</span>
      </a>
      <button className="np-card__min" onClick={toggle} data-cursor aria-label="Minimize now playing">
        –
      </button>
    </section>
  )
}

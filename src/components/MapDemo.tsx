import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* A tiny live demo of Karst's geoprivacy model: toggle between exact entrance
   pins and the fuzzed approximate areas that sensitive caves actually show.
   Lazy-loaded from the Karst case study so Leaflet ships in its own chunk. */

// a handful of stand-in cave points across the southern-Indiana karst region
const CAVES: [number, number][] = [
  [39.1653, -86.5264],
  [39.21, -86.44],
  [39.12, -86.61],
  [39.085, -86.48],
  [39.24, -86.56],
]

// deterministic "fuzz": snap to a coarse grid so the shown area can never be
// walked back to the true entrance
const fuzz = (v: number) => Math.round(v / 0.03) * 0.03

export default function MapDemo() {
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const exactRef = useRef<L.LayerGroup | null>(null)
  const fuzzRef = useRef<L.LayerGroup | null>(null)
  const [mode, setMode] = useState<'exact' | 'fuzzed'>('fuzzed')

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, {
      center: [39.16, -86.52],
      zoom: 10,
      scrollWheelZoom: false, // don't hijack scrolling inside the modal
    })
    mapRef.current = map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map)

    exactRef.current = L.layerGroup(
      CAVES.map(([lat, lng]) =>
        L.circleMarker([lat, lng], {
          radius: 7,
          color: '#211b14',
          weight: 2,
          fillColor: '#f4502a',
          fillOpacity: 1,
        }).bindPopup('Exact entrance'),
      ),
    )
    fuzzRef.current = L.layerGroup(
      CAVES.map(([lat, lng]) =>
        L.circle([fuzz(lat), fuzz(lng)], {
          radius: 1600,
          color: '#f4502a',
          weight: 2,
          fillColor: '#f4502a',
          fillOpacity: 0.16,
        }).bindPopup('Approximate area only'),
      ),
    )
    fuzzRef.current.addTo(map) // default to the privacy-preserving view

    // the case-study modal animates in; size the map once it settles
    const t = window.setTimeout(() => map.invalidateSize(), 420)
    return () => {
      window.clearTimeout(t)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !exactRef.current || !fuzzRef.current) return
    if (mode === 'exact') {
      fuzzRef.current.remove()
      exactRef.current.addTo(map)
    } else {
      exactRef.current.remove()
      fuzzRef.current.addTo(map)
    }
  }, [mode])

  return (
    <div className="mapdemo">
      <div className="mapdemo__toggle" role="group" aria-label="Location precision">
        <button
          type="button"
          className={mode === 'fuzzed' ? 'is-active' : ''}
          onClick={() => setMode('fuzzed')}
          aria-pressed={mode === 'fuzzed'}
          data-cursor
        >
          🔒 Fuzzed
        </button>
        <button
          type="button"
          className={mode === 'exact' ? 'is-active' : ''}
          onClick={() => setMode('exact')}
          aria-pressed={mode === 'exact'}
          data-cursor
        >
          📍 Exact
        </button>
      </div>
      <div className="mapdemo__map" ref={elRef} />
      <p className="mapdemo__cap label">
        {mode === 'fuzzed'
          ? 'Sensitive caves show only an approximate area — never the true entrance.'
          : 'Exact pins — shown only for public caves, or unlocked for trusted grotto members.'}
      </p>
    </div>
  )
}

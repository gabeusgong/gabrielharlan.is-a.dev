import { useState, useEffect, lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import './App.css'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Process from './components/Process'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Testimonials from './components/Testimonials'

// lazy so Firebase ships in its own chunk, not the initial bundle
const Wall = lazy(() => import('./components/Wall'))
// lazy so the cave photos load only when the gallery is reached
const CaveGallery = lazy(() => import('./components/CaveGallery'))
import CaveMode from './components/CaveMode'
import DepthGauge from './components/DepthGauge'
import IdleSurprise from './components/IdleSurprise'
import Achievements from './components/Achievements'
import Terminal from './components/Terminal'
import NowPlaying from './components/NowPlaying'
import ScrollTop from './components/ScrollTop'
import Intro from './components/Intro'
import { unlock } from './lib/achievements'
import { apply as applyPrefs } from './lib/prefs'

const getRoute = () =>
  typeof window !== 'undefined' && window.location.hash === '#/caves' ? 'caves' : 'home'

function App() {
  const [cave, setCave] = useState(false)
  const [route, setRoute] = useState(getRoute)
  // first-visit flourish: after the intro lifts, the site emerges from cave
  // darkness into light via a slow-fading overlay
  const [caveFade, setCaveFade] = useState(false)

  // keep the theme attribute in sync with the pref and the OS
  useEffect(() => {
    applyPrefs()
    const onPref = () => applyPrefs()
    window.addEventListener('pref-change', onPref)
    const dark = window.matchMedia('(prefers-color-scheme: dark)')
    dark.addEventListener?.('change', applyPrefs)
    return () => {
      window.removeEventListener('pref-change', onPref)
      dark.removeEventListener?.('change', applyPrefs)
    }
  }, [])

  // tiny hash router so the cave gallery lives on its own page (#/caves) and
  // never appears inline on the main site
  useEffect(() => {
    let current = getRoute()
    const onHash = () => {
      const next = getRoute()
      // Only react to real page switches (home <-> #/caves). In-page section
      // anchors (#about, #work, …) don't change the route — let the browser
      // scroll to them instead of yanking back to the top.
      if (next === current) return
      current = next
      // reset scroll BEFORE the new page renders, so its scroll-in reveals
      // (whileInView) evaluate in view instead of staying blank
      window.scrollTo(0, 0)
      setRoute(next)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const toggleCave = () =>
    setCave((v) => {
      if (!v) unlock('cave')
      return !v
    })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCave(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // type the word "karst" anywhere to drop into cave mode
  useEffect(() => {
    let seq = ''
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key.length !== 1) return
      seq = (seq + e.key.toLowerCase()).slice(-5)
      if (seq === 'karst') {
        setCave(true)
        unlock('cave')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // playful tab title when you leave the tab
  useEffect(() => {
    const original = document.title
    const onVis = () => {
      document.title = document.hidden ? '🦇 come back…' : original
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      document.title = original
    }
  }, [])

  const onCaves = route === 'caves'

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Cursor />
      <DepthGauge />
      <Nav cave={cave} onToggleCave={toggleCave} route={route} />
      {onCaves ? (
        <main id="main" tabIndex={-1}>
          <Suspense fallback={null}>
            <CaveGallery />
          </Suspense>
        </main>
      ) : (
        <main id="main" tabIndex={-1}>
          <Hero />
          <About />
          <Skills />
          <Process />
          <Projects />
          <Suspense fallback={null}>
            <Wall />
          </Suspense>
          <Testimonials />
          <Contact />
        </main>
      )}
      <CaveMode active={cave} />
      <IdleSurprise />
      <Achievements />
      <Terminal onToggleCave={toggleCave} />
      <NowPlaying />
      <ScrollTop />
      <Intro onDone={() => setCaveFade(true)} />
      {caveFade && (
        <div
          className="cavefade"
          aria-hidden
          onAnimationEnd={() => setCaveFade(false)}
        />
      )}
    </MotionConfig>
  )
}

export default App

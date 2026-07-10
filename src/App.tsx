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
const Uses = lazy(() => import('./components/Uses'))
import CaveMode from './components/CaveMode'
import DepthGauge from './components/DepthGauge'
import IdleSurprise from './components/IdleSurprise'
import Achievements from './components/Achievements'
import Terminal from './components/Terminal'
import NowPlaying from './components/NowPlaying'
import ScrollTop from './components/ScrollTop'
import Intro from './components/Intro'
import { unlock } from './lib/achievements'

const getRoute = () => {
  const h = typeof window !== 'undefined' ? window.location.hash : ''
  if (h === '#/caves') return 'caves'
  if (h === '#/uses') return 'uses'
  return 'home'
}

function App() {
  const [cave, setCave] = useState(false)
  const [route, setRoute] = useState(getRoute)
  // first-visit flourish: the site loads already wearing the cave (black/amber)
  // colour scheme underneath the intro curtain, then — as the curtain lifts —
  // the actual scheme transitions live into the light scheme. Same check the
  // Intro uses; computed during render (before any effect sets the flag) so the
  // two agree.
  const [firstVisit] = useState(() => {
    try {
      return !localStorage.getItem('gh-intro-seen') && !navigator.webdriver
    } catch {
      return false
    }
  })

  // put the site in cave colours immediately on a first visit, before the
  // curtain lifts, so there's a real scheme to fade *from*
  useEffect(() => {
    if (firstVisit) document.documentElement.classList.add('cave-active')
  }, [firstVisit])

  // called when the intro curtain lifts: enable colour transitions on the whole
  // tree, then drop cave-active so every themed property interpolates from the
  // cave scheme to the light scheme
  const emergeToLight = () => {
    const html = document.documentElement
    html.classList.add('theme-fading')
    // flush styles so the cave values are the transition's start point, then
    // flip in the SAME tick — the scheme begins fading immediately, before the
    // veil has even finished lifting, for the earliest possible handoff
    void html.offsetWidth
    html.classList.remove('cave-active')
    window.setTimeout(() => html.classList.remove('theme-fading'), 2700)
  }

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

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Cursor />
      <DepthGauge />
      <Nav cave={cave} onToggleCave={toggleCave} route={route} />
      {route === 'caves' ? (
        <main id="main" tabIndex={-1}>
          <Suspense fallback={null}>
            <CaveGallery />
          </Suspense>
        </main>
      ) : route === 'uses' ? (
        <main id="main" tabIndex={-1}>
          <Suspense fallback={null}>
            <Uses />
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
      <Intro onDone={emergeToLight} />
    </MotionConfig>
  )
}

export default App

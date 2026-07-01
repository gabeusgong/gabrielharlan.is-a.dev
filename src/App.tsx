import { useState, useEffect, lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import './App.css'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'

// lazy so Firebase ships in its own chunk, not the initial bundle
const Wall = lazy(() => import('./components/Wall'))
// lazy so the cave photos load only when the gallery is reached
const CaveGallery = lazy(() => import('./components/CaveGallery'))
import CaveMode from './components/CaveMode'
import DepthGauge from './components/DepthGauge'
import IdleSurprise from './components/IdleSurprise'
import Achievements from './components/Achievements'
import { unlock } from './lib/achievements'

function App() {
  const [cave, setCave] = useState(false)

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
      <Nav cave={cave} onToggleCave={toggleCave} />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Suspense fallback={null}>
          <CaveGallery />
        </Suspense>
        <Suspense fallback={null}>
          <Wall />
        </Suspense>
        <Contact />
      </main>
      <CaveMode active={cave} />
      <IdleSurprise />
      <Achievements />
    </MotionConfig>
  )
}

export default App

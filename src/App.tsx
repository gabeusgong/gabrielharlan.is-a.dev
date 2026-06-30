import { useState, useEffect } from 'react'
import './App.css'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import CaveMode from './components/CaveMode'
import DepthGauge from './components/DepthGauge'
import IdleSurprise from './components/IdleSurprise'

function App() {
  const [cave, setCave] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCave(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Cursor />
      <DepthGauge />
      <Nav cave={cave} onToggleCave={() => setCave((v) => !v)} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <CaveMode active={cave} />
      <IdleSurprise />
    </>
  )
}

export default App

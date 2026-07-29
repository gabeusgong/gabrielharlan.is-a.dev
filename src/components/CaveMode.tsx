import { useEffect, useRef, useState } from 'react'
import { isMuted, flashlightOn } from '../lib/prefs'
import { getAudioContext } from '../lib/audio'

/* Synthesized cave "water drip" ambience — faint, randomly-timed drops fed
   through a feedback delay for an underground echo. No audio files; the
   AudioContext starts on the cave-mode toggle (a user gesture). Returns a
   stopper that fades the ambience out. */
function startCaveAmbience(): () => void {
  const ctx = getAudioContext()
  if (!ctx) return () => {}
  try {
    const master = ctx.createGain()
    master.gain.value = 0.0001
    master.connect(ctx.destination)
    master.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 1.4) // gentle fade-in

    // cave echo: a feedback delay line
    const delay = ctx.createDelay(1.0)
    delay.delayTime.value = 0.19
    const fb = ctx.createGain()
    fb.gain.value = 0.34
    const wet = ctx.createGain()
    wet.gain.value = 0.5
    delay.connect(fb)
    fb.connect(delay)
    delay.connect(wet)
    wet.connect(master)

    let stopped = false
    let timer: number | undefined

    const drip = () => {
      const t = ctx.currentTime + 0.02
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      const f = 620 + Math.random() * 1100 // vary the pitch per drop
      osc.frequency.setValueAtTime(f * 2.1, t)
      osc.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.055)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.1 + Math.random() * 0.06, t + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.19)
      osc.connect(g)
      g.connect(master) // dry
      g.connect(delay) // echo
      osc.start(t)
      osc.stop(t + 0.22)
    }

    const loop = () => {
      if (stopped) return
      drip()
      if (Math.random() < 0.22) window.setTimeout(drip, 90 + Math.random() * 130) // occasional double-drip
      timer = window.setTimeout(loop, 1100 + Math.random() * 3200)
    }
    timer = window.setTimeout(loop, 500 + Math.random() * 700)

    return () => {
      stopped = true
      if (timer) window.clearTimeout(timer)
      const end = ctx.currentTime
      master.gain.cancelScheduledValues(end)
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), end)
      master.gain.linearRampToValueAtTime(0.0001, end + 0.45)
      window.setTimeout(() => {
        try {
          master.disconnect()
        } catch {
          /* ignore */
        }
      }, 700)
    }
  } catch {
    return () => {}
  }
}

/* "Cave mode" Easter egg: recolors the whole site into a black/amber
   underground theme and casts a warm headlamp glow that follows the
   pointer (or finger), with faint water-drip ambience. Scrolling stays fully
   enabled. Exit via the nav lamp or the Escape key. */
export default function CaveMode({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  // the headlamp beam is a preference *within* cave mode — kept live so the
  // Settings / terminal toggle shows or hides it without leaving cave mode
  const [beamOn, setBeamOn] = useState(flashlightOn())
  useEffect(() => {
    const onPref = () => setBeamOn(flashlightOn())
    window.addEventListener('pref-change', onPref)
    return () => window.removeEventListener('pref-change', onPref)
  }, [])

  // cave-mode core: recolor the whole site into the underground (black/amber)
  // theme + faint dripping-water ambience. Independent of the beam.
  useEffect(() => {
    if (!active) return
    document.documentElement.classList.add('cave-active')

    // ambience respects the mute pref and starts/stops live when sound toggles;
    // ignore unrelated pref changes (e.g. the flashlight) so drips don't restart
    let muted = isMuted()
    let stopAmbience = muted ? () => {} : startCaveAmbience()
    const onPref = () => {
      const m = isMuted()
      if (m === muted) return
      muted = m
      stopAmbience()
      stopAmbience = m ? () => {} : startCaveAmbience()
    }
    window.addEventListener('pref-change', onPref)

    return () => {
      window.removeEventListener('pref-change', onPref)
      document.documentElement.classList.remove('cave-active')
      stopAmbience()
    }
  }, [active])

  // the warm headlamp pool that follows the pointer — only when cave mode is on
  // AND the flashlight effect is enabled
  useEffect(() => {
    if (!active || !beamOn) return
    const el = ref.current
    if (!el) return

    const move = (x: number, y: number) => {
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
    }
    move(window.innerWidth / 2, window.innerHeight * 0.4)

    const onMouse = (e: MouseEvent) => move(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) move(t.clientX, t.clientY)
    }

    // passive listeners — the beam follows the finger but never blocks scrolling
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [active, beamOn])

  return (
    <div ref={ref} className={`cavemode ${active && beamOn ? 'cavemode--on' : ''}`} aria-hidden />
  )
}

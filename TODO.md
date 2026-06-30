# TODO — future additions

Ideas for the next round of work on gabrielharlan.is-a.dev. ⭐ = highest impact.

## Portfolio depth (best ROI for the job hunt)
- [ ] ⭐ **More case studies** — give **ITIT (capstone)** and the **Corne 42 LP keyboard** the
      same modal treatment Karst has (problem → process → screenshots → outcome).
      Only Karst tells a full story right now.
- [ ] **Process / "how I work" beat** — a couple of wireframe→final shots or a short
      blurb on the design loop. Show the UX thinking, not just the result.
- [ ] **A testimonial** — one short quote from a professor, teammate, or the IT-team lead.

## Walk-the-talk accessibility (the hero literally says "accessible")
- [ ] ⭐ **Accessibility pass**
  - Keyboard-operable sticker game (focus + key controls)
  - Visible focus states across the site
  - `prefers-reduced-motion` variants for the heavy hero/scroll animations
  - Alt text / ARIA sweep; color-contrast check

## Performance
- [ ] **Lazy-load matter-js** — it's most of the ~137 KB gzipped bundle. Load the physics
      engine only when the About section scrolls into view, for a snappier first paint.

## Delight / signature
- [ ] ⭐ **Keyboard Easter egg** — type a secret word (e.g. `karst`) or the Konami code to
      trigger something playful. On-brand for the keyboard nerd.
- [ ] **Sound + mute toggle** — subtle clicks on sticker collisions, a chime on the win.
- [ ] **"/now" line** — "currently building Karst · reading X · deepest cave so far",
      kept fresh, to make the site feel alive.

## Gimmicks (pure delight)
- [x] **Scroll-velocity marquee** — the skills marquee speeds up / slows / reverses based on
      scroll speed and direction. Quick to add, high impact.
- [x] **"Meters deep" depth gauge** — slim left-side gauge that fills as you scroll, labeled
      like a cave descent (entrance → twilight zone → deep). On-theme + orienting.
- [x] **Idle surprise** — after ~20s of no input, a stray sticker drops in / the bat peeks
      out / the headlamp flickers.
- [x] **More physics** — make the project cards (or hero letters) throwable: fling them
      around with matter-js, then they spring back into place.

## Practical
- [ ] **Privacy-friendly analytics** (e.g. Plausible) to see traffic when sharing for jobs.
- [ ] **Real light/dark toggle** beyond cave mode.
- [ ] **Installable PWA** — manifest + service worker ("add to home screen"). Deferred.
- [ ] **Contact form** (e.g. Formspree) so people can message without an email client. Deferred.

## Shipped 2026-06-30
Custom 404 page · JSON-LD/SEO meta · "view source" footer · WebP case-study images
(1 MB→~100 KB) · copy-to-clipboard email + toast · inactive-tab title egg · sticker-game
best time (localStorage) · scroll-velocity marquee · depth gauge · idle bat · throwable cards.
Plus coworker fixes: cursor hides on exit + no blend flicker; modal scroll containment + de-jank.

---

### Still pending from this round
- [ ] Swap the dead-reckoning case-study image for the logged-in **recording** screen
      (done — Media.jpeg). Revisit if a richer shot becomes available.
- [ ] Buy/point a custom domain if you want something other than `gabrielharlan.is-a.dev`.

**Top 3 to start with:** more case studies · accessibility pass · keyboard Easter egg.

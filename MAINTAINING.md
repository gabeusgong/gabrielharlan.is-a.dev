# Maintaining gabrielharlan.is-a.dev

A plain-English guide to editing this site **by yourself**, without Claude Code.
Written for future-you. Nothing here needs deep React knowledge — 90% of edits are
one file (`src/data.ts`), and deploying is just `git push`.

- **Stack:** Vite + React 19 + TypeScript, animated with [Motion](https://motion.dev). No CSS framework.
- **Hosting:** GitHub Pages (repo `gabeusgong/gabrielharlan.is-a.dev`) at the custom domain `gabrielharlan.is-a.dev`.
- **Golden rule:** edit content, `git push` to `main`, and GitHub rebuilds + redeploys automatically (~1–2 min).

---

## 1. The 3-minute mental model

```
src/data.ts        ← almost all your words/content live here (edit this)
src/components/*    ← the UI. Reads from data.ts. A few hold their own text (see §4)
src/App.tsx         ← the page: which sections show, in what order + the routing
src/index.css       ← colors, fonts, design tokens (the "theme")
src/App.css         ← all component styling
public/             ← files served as-is: résumé, portrait, favicon, CNAME
.github/workflows/deploy.yml  ← the auto-deploy (don't need to touch it)
```

**Routing** is by URL hash (no server):
- `/` → home (all the scrolling sections)
- `#/uses` → the /uses gear page
- `#/notes` and `#/notes/<slug>` → field notes (blog)
- `#/caves` → cave photo gallery
- `#/work/<slug>` → a project case study (opens as a modal over home)

---

## 2. Editing content — `src/data.ts` (start here)

Open `src/data.ts`. It's one file of plain data, organized top to bottom. Change the
text between quotes, save, push. Each block below lists **what it controls** and
**where it shows up**.

| Export in `data.ts` | Controls | Shows on |
|---|---|---|
| `profile` | Name, hero tagline, rotating "I'm ___" words, About bio, location, status, availability line, the "now" list | Hero, About, Nav, Contact |
| `skills` | The skill chips | Skills marquee |
| `hobbies` | The draggable sticker badges (emoji + label) | About sticker toy |
| `projects` | The 6 project cards (title, blurb, tags, year, emoji, live link) | Selected work grid, Snapshot |
| `links` | email / github / linkedin / twitter | Contact, footer |
| `testimonials` | The "Kind words" quotes | Testimonials |
| `uses` | The gear/stack lists | `#/uses` page |
| `notes` | Your field notes / blog posts | `#/notes` + home teaser |

### The `tone` field
Many items take a `tone` — that's just the accent color. Valid values:
`'coral' | 'cobalt' | 'lime' | 'pink' | 'sun'`. Nothing else.

### Add a testimonial (example)
In the `testimonials` array, copy an existing block and edit it:
```ts
{
  quote: 'The quote text. Use … to mark where you trimmed the original.',
  name: 'Person Name',
  role: 'Their Title · Their Company',
},
```
Order in the array = left-to-right / top-to-bottom order on the page.

### Add a project (example)
In the `projects` array:
```ts
{
  title: 'Project Name',
  blurb: 'One-paragraph description shown on the card.',
  tags: ['Tag1', 'Tag2'],
  tone: 'coral',
  year: '2026',
  emoji: '🚀',
  href: 'https://live-demo-if-any.com',   // optional
  // caseStudy: true, study: 'slug'  ← ONLY if you also add a case study (see §4)
},
```
If you set `caseStudy: true`, you **must** also add matching prose in
`CaseStudy.tsx` (§4) or the card's "read more" will open an empty modal.

### Add a field note / blog post
In the `notes` array (newest first). A note's `body` is an array of blocks:
```ts
{
  slug: 'kebab-case-url',          // becomes #/notes/kebab-case-url — must be unique
  title: 'Post Title',
  dek: 'One-line summary under the title.',
  date: '2026-08-05',              // YYYY-MM-DD
  tags: ['UX', 'Whatever'],
  minutes: 4,                      // rough read time
  // study: 'traction',            // optional: links this note to a project case study
  body: [
    'A normal paragraph is just a string.',
    { h: 'A subheading' },
    'Another paragraph.',
    { quote: 'A pull-quote.', by: 'Optional attribution' },
    { list: ['A bulleted', 'list of', 'items'] },
  ],
},
```

> **Safety net:** before every deploy, CI runs a data check (`npm run check`) that
> catches duplicate/mis-formatted slugs, bad dates, and notes pointing at a project
> that doesn't exist. If you typo one of these, the deploy **fails instead of shipping
> broken links** — you'll see a red ✗ in the repo's Actions tab. Fix and push again.

---

## 3. Changing the look (colors & fonts)

- **Colors, fonts, spacing:** `src/index.css`, in the `:root { … }` block at the top.
  The palette variables are `--paper, --ink, --coral, --cobalt, --lime, --pink, --sun`.
  Change a value there and it updates everywhere that uses that token.
- **Component styling** (layout of a card, the nav, the gallery, etc.): `src/App.css`.
  Styles are keyed to the class names in each component (`.hero__…`, `.card…`, `.cs__…`,
  `.note__…`). Search `App.css` for the class you see in the browser's dev tools.
- **Fonts** are loaded from Google Fonts in `index.html` (Fraunces, Schibsted Grotesk,
  Space Mono). Swap them there **and** update the font variables in `index.css`.

---

## 4. Content that is NOT in data.ts (the exceptions)

Most content is in `data.ts`, but a few things live inside their component file. Edit
the text directly in these:

| To change… | Edit this file | Look for |
|---|---|---|
| Full **case-study** write-ups (the long prose, galleries, diagrams behind each project) | `src/components/CaseStudy.tsx` | the `STUDIES` object, keyed by slug (`traction`, `tracisms`, `karst`, `itit`, `corne`, `blenz`) |
| The **"How I work" 4 steps** | `src/components/Process.tsx` | the `STEPS` array |
| The **Snapshot / TL;DR** outcome one-liners | `src/components/Snapshot.tsx` | the `highlights` array |
| The **cave gallery** photo list + alt text | `src/components/CaveGallery.tsx` | the `PHOTOS` array |
| The **résumé** page itself | `public/resume/index.html` | it's a self-contained HTML page |
| SEO / social-share meta, page `<title>`, analytics | `index.html` (repo root) | the `<head>` |
| Nav links / section names | `src/components/Nav.tsx` | the hard-coded section list |

> **data.ts holds the short project `blurb`; `CaseStudy.tsx` holds the long story.**
> They're two different places for the same project — update both if the facts change.

---

## 5. Images

Two separate systems — pick by where the file goes:

1. **`public/`** — referenced by plain URL. The About **portrait** is `public/portrait.webp`.
   The résumé PDFs, favicon, and social image (`og.png`) also live here. To replace one,
   just overwrite the file with the same name.
2. **`src/assets/img/<group>/`** — for case-study and gallery images. These are referenced
   in code by logical name through a helper, e.g. `asset('karst/mobile-map.webp')`. Add a
   `.webp` to the right subfolder, then reference it by that name in `CaseStudy.tsx` or
   `CaveGallery.tsx`. (If you mistype a name, the **build fails** — a helpful guardrail.)

Prefer `.webp` for photos (small + fast). `hero.png`, `react.svg`, `vite.svg` in
`src/assets/` are unused leftovers — ignore them.

---

## 6. The résumé

- The **live `/resume/` page** is `public/resume/index.html` (self-contained; fonts embedded).
  Edit the HTML there to change the résumé.
- Downloadable copies are `public/Gabriel-Harlan-Resume.pdf` and `.docx` — regenerate the
  PDF by print-to-PDF from the page, and overwrite the file.
- The `resume/` folder at the repo root (no `public/`) is just the **authoring workspace**
  (fonts, the .docx source). It is not served to visitors. See `resume/README.md`.

---

## 7. External services (all keys are client-side & already set up)

These power the "live" bits. They're already configured; you only touch them if one breaks
or you change accounts. Each key is public by design.

| Feature | Where | Notes |
|---|---|---|
| Guestbook "wall" + visitor counter | Firebase/Firestore, `src/lib/firebase.ts` | project `gabrielharlan-site`; secured by `firestore.rules` |
| Contact form | Formspree, `src/components/ContactForm.tsx` | form ID `xeebrvgd` → your email. Change the ID to point elsewhere |
| "Recently shipped" repos | GitHub API, `src/components/RecentlyShipped.tsx` | pulls `gabeusgong`'s recently pushed repos |
| "Now playing" music | Last.fm API, `src/components/NowPlaying.tsx` | user `gabeusgong` |
| Analytics | GoatCounter, in `index.html` | dashboard: `gabrielharlan.goatcounter.com` |

---

## 8. Running the site on your computer (optional)

You do **not** need to run it locally to make edits — you can edit files and push, and the
live site rebuilds. But to preview before pushing:

```bash
npm install      # first time only
npm run dev      # opens http://localhost:5173, live-reloads as you edit
```

Other commands:
```bash
npm run check    # validates data.ts (same check CI runs)
npm run build    # full production build into dist/
npm run preview  # preview that production build
```

> **Gotcha on the current laptop:** this project lives in OneDrive, and `node_modules`
> was installed on a Mac, so `npm run dev/check/build` may fail on Windows with an
> "esbuild … wrong platform" error. Fix once with a fresh install on this machine:
> ```bash
> rm -rf node_modules package-lock.json   # or delete the folder in Explorer
> npm install
> ```
> CI on GitHub always installs fresh on Linux, so **deploys are unaffected** regardless.

---

## 9. Publishing changes (the deploy)

Every push to the `main` branch auto-deploys. From the project folder:

```bash
git add -A
git commit -m "Update testimonials"     # any message
git push
```

Then watch the **Actions** tab of the repo on GitHub — a green ✓ means it's live at
`gabrielharlan.is-a.dev` (hard-refresh if you still see the old version). A red ✗ means the
data check or build failed and **nothing shipped**; click it to read the error, fix, push again.

You can also edit files **directly on GitHub.com** (pencil icon on any file) and commit —
that triggers the same deploy, no laptop or git needed. Great for a quick typo fix.

### If `git push` asks for credentials / fails
- **"Host key verification failed"** → run once:
  `ssh-keyscan github.com >> ~/.ssh/known_hosts`
- **"Permission denied (publickey)"** → this machine's git shell has no GitHub SSH key.
  Easiest fix: push over HTTPS instead of SSH, e.g.
  `git push https://github.com/gabeusgong/gabrielharlan.is-a.dev.git main`
  and sign in when prompted (or use GitHub Desktop, which handles auth for you).

---

## 10. Quick recipes

- **Change a testimonial / project / bio** → `src/data.ts`, push.
- **Add a blog post** → add to `notes` in `src/data.ts`, push (§2).
- **Update the résumé** → edit `public/resume/index.html`, replace the PDF, push (§6).
- **Change a color** → `src/index.css` `:root`, push (§3).
- **Replace your portrait** → overwrite `public/portrait.webp`, push.
- **Fix a case-study detail** → `src/components/CaseStudy.tsx` `STUDIES`, push (§4).
- **Quick typo fix with no laptop** → edit the file on GitHub.com, commit (§9).

When in doubt: search `src/data.ts` first. If the text isn't there, check §4.

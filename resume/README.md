# Résumé — edit it yourself, keep the theme

The résumé is **integrated into the site**:

- **View online:** `gabrielharlan.is-a.dev/resume/` (served from `public/resume/index.html`)
- **Download PDF:** `gabrielharlan.is-a.dev/Gabriel-Harlan-Resume.pdf` (`public/Gabriel-Harlan-Resume.pdf`)
- Both are linked from the site's **Contact** section (*View résumé* / *Download PDF*).

| File | Edit in | Notes |
|------|---------|-------|
| `../public/resume/index.html` | any text editor / browser | **The master.** Fonts embedded (base64 woff2) — self-contained, themed offline. This IS the live `/resume/` page. |
| `../public/Gabriel-Harlan-Resume.pdf` | — | The downloadable PDF, rendered from the HTML (Letter, margins off). |
| `Gabriel-Harlan-Resume.docx` | **Word / LibreOffice** | Separate ATS/upload copy; fonts embedded. Not on the site. |

## How to edit it yourself (no AI)

**Your master copy is `public/resume/index.html`.** It's plain text — you only
change the words, never the styling.

1. Open `public/resume/index.html` in any editor (VS Code, even TextEdit).
2. Everything you'd change lives **between `<body>` and `</body>`**, after the
   `<!-- ===== EDIT YOUR CONTENT BELOW ===== -->` marker. Edit the text inside
   the tags — e.g. change a bullet by editing the text in a `<li>…</li>`, add a
   bullet by copying a whole `<li>…</li>` line, remove one by deleting its line.
   **Don't touch the `<head>`/`<style>` section** (that's the theme).
3. Save, then double-click the file to preview it in your browser.
4. **Regenerate the download PDF:** in the browser press ⌘P / Ctrl-P →
   *Destination:* **Save as PDF** → *Paper size:* **Letter** → *Margins:*
   **None** → *Scale:* **Default** → *More settings:* **Background graphics ON**
   (off = no sidebar card or paper color) → save over
   `public/Gabriel-Harlan-Resume.pdf`. Always print from Chrome/Edge — never
   export the PDF from the Word file, which drops the whole design. If the
   print spills onto a second page, lower `--print-zoom` in the `@media print`
   block (it's set to fit the current content on one page).
5. **Publish:** commit and `git push` — GitHub Pages redeploys, updating both
   the live `/resume/` page and the download.

That's the whole loop — edit text, print to PDF, push. The theme always holds
because the fonts are baked into the file.

> The `Gabriel-Harlan-Resume.docx` is a **separate, simpler ATS/upload copy** —
> edit it in Word if a job portal wants a `.docx`. It won't match the HTML's
> layout (Word can't reproduce the design); the HTML/PDF is the polished one.

## The Word doc is self-contained

The three theme fonts are embedded **inside** the `.docx`, so it stays themed
when you open and edit it in Microsoft Word or LibreOffice — no font install
needed. Edit the text normally and save; Word keeps the fonts embedded.

## If an editor ignores embedded fonts

Some tools (e.g. **Google Docs**) drop embedded fonts on import. If the theme
fonts look wrong there, install the three families once — they're in
[`fonts/`](fonts/) (double-click each → *Install*):

- **Fraunces** (headings) · **Schibsted Grotesk** (body) · **Space Mono** (labels)

All three are free Google Fonts under the SIL Open Font License, and they're the
same fonts the website and the résumé use. Once installed, every version renders
in the full theme.

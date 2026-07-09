# Résumé — edit it yourself, keep the theme

Three files, same content, "Analog Playground" theme:

| File | Edit in | Notes |
|------|---------|-------|
| `Gabriel-Harlan-Resume.docx` | **Word / LibreOffice** | **Fonts are embedded** — opens fully themed on any machine, no install, no AI. Just type. |
| `resume.html` | any text editor / browser | **Fonts embedded (base64 woff2)** — fully self-contained, renders themed offline. Edit the text between the tags; print to PDF (Letter, margins off) to refresh `preview.pdf`. |
| `preview.pdf` | — | A rendered snapshot of `resume.html`. Regenerate by printing the HTML to PDF (Letter, margins off). |

## How to edit it yourself (no AI)

**Your master copy is `resume.html`.** It's plain text — you only change the
words, never the styling.

1. Open `resume.html` in any editor (VS Code, even TextEdit).
2. Everything you'd change lives **between `<body>` and `</body>`**, after the
   `<!-- ===== EDIT YOUR CONTENT BELOW ===== -->` marker. Edit the text inside
   the tags — e.g. change a bullet by editing the text in a `<li>…</li>`, add a
   bullet by copying a whole `<li>…</li>` line, remove one by deleting its line.
   **Don't touch the `<head>`/`<style>` section** (that's the theme).
3. Save, then double-click `resume.html` to open it in your browser to preview.
4. **Regenerate the PDF:** in the browser press ⌘P / Ctrl-P → *Destination:*
   **Save as PDF** → *Paper size:* **Letter** → *Margins:* **Default/None** →
   Save over `preview.pdf`. (The page already forces Letter + no margins.)

That's the whole loop — edit text, print to PDF. The theme always holds because
the fonts are baked into the file.

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
same fonts the website and `resume.html` use. Once installed, every version
renders in the full theme.

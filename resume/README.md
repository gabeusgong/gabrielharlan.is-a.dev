# Résumé — edit it yourself, keep the theme

Three files, same content, "Analog Playground" theme:

| File | Edit in | Notes |
|------|---------|-------|
| `Gabriel-Harlan-Resume.docx` | **Word / LibreOffice** | **Fonts are embedded** — opens fully themed on any machine, no install, no AI. Just type. |
| `resume.html` | any text editor / browser | Themed via Google Fonts (needs internet); edit the text between the tags. |
| `preview.pdf` | — | A rendered snapshot of `resume.html`. Regenerate by printing the HTML to PDF (Letter, margins off). |

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

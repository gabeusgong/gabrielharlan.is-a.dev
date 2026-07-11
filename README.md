# gabrielharlan.is-a.dev

Personal site for Gabriel Harlan — "Analog Playground" theme. Vite + React + TypeScript, animated with [Motion](https://motion.dev).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Editing content

**All site content lives in [`src/data.ts`](src/data.ts).** Edit that one file — name, tagline, about, skills, hobby stickers, projects, and links — and the whole site updates. Spots that still need real content are marked with `TODO`.

## Deploy (GitHub Pages → gabrielharlan.design)

A GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) builds and deploys on every push to `main`.

**One-time setup:**

1. Create a GitHub repo and push this project to `main`.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Under **Settings → Pages → Custom domain**, enter `gabrielharlan.design` and save. (`public/CNAME` already pins this so the domain survives each deploy.)
4. Configure DNS at your domain registrar:

   **Apex (`gabrielharlan.design`) — four A records + four AAAA records:**

   | Type | Value |
   |------|-------|
   | A | 185.199.108.153 |
   | A | 185.199.109.153 |
   | A | 185.199.110.153 |
   | A | 185.199.111.153 |
   | AAAA | 2606:50c0:8000::153 |
   | AAAA | 2606:50c0:8001::153 |
   | AAAA | 2606:50c0:8002::153 |
   | AAAA | 2606:50c0:8003::153 |

   **`www` subdomain (optional, recommended):**

   | Type | Name | Value |
   |------|------|-------|
   | CNAME | www | `<your-github-username>.github.io` |

5. Back in **Settings → Pages**, tick **Enforce HTTPS** once the certificate is issued (can take a few minutes to an hour after DNS propagates).

After that, every `git push` to `main` redeploys automatically.

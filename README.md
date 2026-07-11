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

## Deploy (GitHub Pages → gabrielharlan.is-a.dev)

A GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) type-checks, runs the data-integrity check, builds, and deploys on every push to `main`.

**One-time setup:**

1. Push this project to `main` on GitHub.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Claim the free subdomain from [is-a.dev](https://is-a.dev): open a PR against [`is-a-dev/register`](https://github.com/is-a-dev/register) adding `domains/gabrielharlan.json`, which CNAMEs the subdomain to GitHub Pages:

   ```json
   {
     "owner": { "username": "gabeusgong", "email": "you@example.com" },
     "records": { "CNAME": "gabeusgong.github.io" }
   }
   ```

   Once merged (this site's was [PR #41704](https://github.com/is-a-dev/register/pull/41704)), `gabrielharlan.is-a.dev` resolves to GitHub Pages — no registrar or DNS records to manage yourself.

4. Under **Settings → Pages → Custom domain**, enter `gabrielharlan.is-a.dev` and save. (`public/CNAME` already pins this so the domain survives each deploy.)
5. Tick **Enforce HTTPS** once the certificate is issued (a few minutes to an hour after the record propagates).

After that, every `git push` to `main` redeploys automatically.

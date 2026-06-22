# harley-adams.github.io

Personal site for Harley Adams, hosted at **[harleyadams.dev](https://harleyadams.dev)**.

It is a single-page, print-friendly CV generated from one Markdown file, plus a small
collection of React games served under `/games/`.

## Layout

```
cv.md                 # single source of truth for the CV content
posts/                # Markdown blog posts ("Thoughts")
src/                  # HTML shells + styles (CV / post / thoughts list)
build.mjs             # static-site generator: cv.md + posts/ -> dist/, copies games
scripts/preview.mjs   # local static server that emulates GitHub Pages 404 handling
web-ui/               # existing Create React App games (unchanged logic)
dist/                 # build output (git-ignored)
```

Build output (`dist/`):

| Path           | Contents                                            |
| -------------- | --------------------------------------------------- |
| `/index.html`  | The CV (static HTML, inlined CSS, prints to PDF)     |
| `/thoughts/`   | Blog index + posts                                  |
| `/games/`      | React games (copied from `web-ui/build`)            |
| `/404.html`    | SPA redirect so `/games/...` deep links round-trip  |
| `/CNAME`       | Custom domain                                       |

## Develop

Edit the CV by editing **`cv.md`**. Add a blog post by dropping a Markdown file in
**`posts/`** (front-matter `title`, `date`, optional `draft: true`).

```bash
npm install                 # install generator deps (gray-matter, markdown-it)
npm run build:cv            # build only the CV + thoughts (fast)
npm run build               # full build: games + CV -> dist/
npm run preview             # serve dist/ at http://localhost:4178
```

`npm run build` runs the games build with `CI=false` so pre-existing CRA lint warnings
do not fail the build.

To preview the print/PDF output, open the CV and use your browser's Print (⌘P / Ctrl-P).

## Games

The React games live in `web-ui/` and are served under `/games/`. Their app logic is
unchanged; only deployment config is set for the subpath:

- `web-ui/package.json` → `"homepage": "/games"`
- `web-ui/src/index.tsx` → router `basename: "/games"`
- `web-ui/public/404.html` → `pathSegmentsToKeep = 1`

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the full `dist/`
and publishes it to GitHub Pages.

> **One-time setup:** in the repo's **Settings → Pages**, set **Source** to
> **GitHub Actions**. (The site previously deployed from the `gh-pages` branch via the
> `gh-pages` npm package; this workflow replaces that flow.)
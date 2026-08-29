# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimalist Portuguese (PT-PT) verb conjugation revision app for a French speaker, built as a single-page Vite + React app. No backend, no routing — the whole app is one page with in-memory view state and `localStorage` persistence.

It was implemented from a Claude Design handoff (see "Design provenance" below); that original prototype is not part of the running app.

## Commands

```
npm install       # install dependencies
npm run dev        # start local dev server (add -- --host to expose on LAN for phone testing)
npm run build       # production build to dist/
npm run preview      # serve the production build locally
```

There is no lint or test setup in this project.

## Architecture

- `src/verbs.js` — all verb data and conjugation logic, ported faithfully from the original prototype's script. `buildAll()` generates every verb's full conjugation (Presente, Pretérito Perfeito Simples, Futuro, Pretérito Perfeito Composto) from two source tables:
  - `REG`: regular verbs, conjugated algorithmically from their infinitive stem + ending group (`ar`/`er`/`ir`), including the AR-group orthographic exceptions (`orth()`: `ç→c`, `g→gu`, `c→qu` before certain endings, e.g. `cheguei`, `comecei`, `fiquei`).
  - `IRR`: irregular verbs, with explicit forms per tense; a `null` tense falls back to the regular pattern (tracked in `v.regTenses` so the UI can show a "régulier" badge on that specific tense).
  - `buildAll()` also seeds a deterministic shuffle (fixed LCG seed) for the word-cloud order, so the cloud layout is stable across reloads rather than re-randomizing.
  - `decorate()` computes `v.ambNos`: whether a verb's `nós` form is identical in Presente and Pretérito Perfeito Simples (e.g. `comemos`/`comemos`) — surfaced in the UI as a "≡" ambiguity marker.
- `src/App.jsx` — the entire UI. Single component tree, two top-level screens driven by `view` state (`'cloud'` vs `'verb'`; a `mode` state further toggles the cloud screen between word-cloud and alphabetical-list rendering). No router.
- `src/index.css` — global styles, fonts, and the two CSS keyframe animations (`ptFade`, `ptToast`). Safe-area handling (`--content-top`, `--safe-bottom`) accounts for iOS notches/home indicators since the app is meant to be added to a phone home screen.

### State persistence

`localStorage` key `ptconj.v1` stores `{ filter, mode, verb }` (last search filter, cloud/list mode, and last-opened verb's infinitive) so reopening the app resumes exactly where the user left off. Search query itself is intentionally *not* persisted.

### Design provenance

`README.md`, `chats/`, and `project/` are the original Claude Design handoff bundle (a `.dc.html` prototype using a design-tool-specific templating runtime) — kept for reference only, not built or imported by the app. When implementing new design requests, treat the current `src/` as the source of truth over the old prototype; do not resurrect the `.dc.html`/`support.js`/`ios-frame.jsx` structure.

One deliberate deviation from the original prototype: the copy-confirmation toast uses a `position: sticky` wrapper (not the prototype's `position: absolute` relative to the full scrollable content) so it reliably appears at the bottom of the *visible* viewport regardless of scroll position — the prototype's absolute positioning was an artifact of its iOS-frame preview scaffolding, which this app does not use.

## Deployment

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages automatically on every push to `main`. Two things must stay in sync if the repo is ever renamed or forked:

- `vite.config.js` sets `base: '/app-portugais/'` — this must match the GitHub repo name (Pages serves the site at `https://<owner>.github.io/<repo>/`).
- GitHub Pages must have "Build and deployment → Source" set to "GitHub Actions" in the repo settings (one-time manual step per repo; the Actions token cannot enable this itself on first run).

Live URL: `https://baptisteconsultantseo-hub.github.io/app-portugais/`

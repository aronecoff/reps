# Reps — brief for a coding agent

You've been handed this repo to make changes on Aron's behalf (e.g. via text
messages he relays). This file is everything you need to edit, build, and ship
it without further context.

## What it is
A local-first workout PWA. No backend, no accounts — all state is in the
browser's `localStorage` (key `reps.v1`). Deployed to GitHub Pages; a native
macOS Dock wrapper (`desktop/`) just loads the deployed URL in a WKWebView.

- **Live:** https://aronecoff.github.io/reps/
- **Repo:** https://github.com/aronecoff/reps  (public)
- **Stack:** vanilla JS + Vite + vite-plugin-pwa. No framework.

## Where things live
- `src/main.js` — the whole app. The training program is the `DAYS` object near
  the top (each day → blocks → exercises with `{ g, n, s, r, note }`). Views are
  `renderHome` / `renderDay` / `renderGuide`. Logging + "last weight" memory is
  the `store` object (localStorage).
- `src/style.css` — the liquid-glass design system (tokens at `:root`, `.glass`
  primitive, view transitions, reveal-on-scroll). WebKit-tuned (iPhone + Dock
  app), so avoid Chromium-only CSS; keep `-webkit-` prefixes on `backdrop-filter`.
- `public/icon.svg` — master app icon; `npm run icons` regenerates PNGs + the
  macOS iconset.
- `desktop/Reps.swift` + `desktop/build.sh` — the Mac Dock app.

## Common edits Aron will ask for
- **Change an exercise / sets / reps / cue:** edit the relevant entry in `DAYS`
  in `src/main.js`.
- **Swap the whole program to a new block:** replace the `DAYS` object; the app
  shell, logging, and last-weight memory carry over unchanged.
- **Tweak the look:** edit tokens/rules in `src/style.css`.

## Build & ship
```bash
npm install
npm run dev      # local preview at localhost:5173/reps/
npm run build    # type-free vite build -> dist/ (+ service worker)
```
Deploy = **just push to `main`.** GitHub Actions builds and publishes to Pages
(~1 min). Aron's phone PWA and Dock app auto-update on next open. Do NOT hand-edit
`dist/` — it's generated and gitignored.

## Guardrails
- Keep it offline-first and local-only — do not add a backend, analytics, or any
  network calls.
- Preserve `prefers-reduced-motion` handling and the reveal safety-net in
  `enhance()` (content must never be able to stay hidden).
- After any change, run `npm run build` to confirm it compiles before pushing.

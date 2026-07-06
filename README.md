# Reps — Training

A local-first workout app. Opens to the session you're training, remembers last
week's weights so you know the number to beat, and logs as you go. Installable
PWA, all data in the browser (localStorage). No backend, no accounts, no keys.

The current program is a **Push / Pull / Legs** split, 5 days a week with legs
once (Push · Pull · Legs · Push · Pull), shoulder-friendly (no barbell bench),
for the Dogpatch YMCA.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build + service worker -> dist/
npm run preview    # serve the production build
```

## Deploy

Pushed to `main` → GitHub Actions builds and publishes to GitHub Pages at
**https://aronecoff.github.io/reps/**. Install it on iPhone via Share → Add to
Home Screen.

## Mac Dock app

A native WKWebView wrapper (no Chrome), same pattern as Tally:

```bash
npm run icons                 # rasterize public/icon.svg -> desktop/Reps.iconset
bash desktop/build.sh         # -> ~/Applications/Reps.app, refreshes the Dock
```

Re-run `desktop/build.sh` after editing `desktop/Reps.swift`. ⌘R reloads,
⇧⌘R force-refreshes.

## Structure

```
src/
  main.js     app: program data, home / day / guide views, localStorage, logging
  style.css   ink + amber theme, phone-first
public/
  icon.svg    master icon -> PWA PNGs + macOS .icns (via npm run icons)
desktop/
  Reps.swift  native macOS wrapper
  build.sh    assembles ~/Applications/Reps.app
```

### Data model (localStorage key `reps.v1`)

- `checks[dayId][idx]` — checkmarks for the in-progress session
- `cur[dayId][idx]` — weights logged this session (free text, e.g. `135 x 8`)
- `last[dayId][idx]` — last finished session's weights (the "to beat" number)
- `lastFinished` — drives the "up next" suggestion on the home screen

**Finish workout** promotes `cur` → `last`, clears the checkmarks, and advances
"up next". **Reset without saving** clears the session without touching `last`.

## Next blocks

When strength stalls for ~2 weeks, swap `DAYS` in `src/main.js` for Block 02
(rebuilt via the design + verify workflow). The app shell, logging, and last-weight
memory carry over unchanged.

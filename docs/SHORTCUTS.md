# Reps — on-device conduits (Oura + Apple Watch)

Reps is a secret-less static app, so it never talks to Oura or Health directly.
Instead, two iOS Shortcuts run **on your phone**, read the data locally, and hand
Reps just the numbers via a URL. Your Oura token and health data never leave the
device; nothing touches a server or the public repo.

The app reads the numbers on load, stores them, and immediately scrubs them from
the URL. If a Shortcut never runs (or a token expires), the readiness dial just
falls back to the manual Fried / Solid / Primed tap — no failure state.

> **One caveat that shapes setup:** a Shortcut's "Open URL" always opens Reps in
> **Safari**, not your Home-Screen app, and iOS keeps those two as separate
> storage. So pick **one** home for Reps: if you want Oura/Watch sync, use Reps
> from a **Safari bookmark** (that's the copy the Shortcuts feed). The Home-Screen
> icon still works great offline with the manual readiness tap — it's just a
> separate copy. Don't split your logs across both.

---

## 1. "Reps Readiness" — morning Oura → the dial

Build one Shortcut named exactly **`Reps Readiness`**:

1. **Text** → paste your Oura personal access token. (Stays on-device.) Name it **Token**.
2. **Format Date** → Current Date, format `yyyy-MM-dd`. Name it **Today**.
3. **Get Contents of URL**
   - URL: `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=[Today]&end_date=[Today]&fields=day,score`
   - Method **GET** · Header: `Authorization` = `Bearer [Token]`
4. **Get Dictionary from Input**
5. **Get Dictionary Value** → `data` → **Get Last Item** → **Get Dictionary Value** → `score`. Name it **Score**.
6. **Text** → `https://aronecoff.github.io/reps/?readiness=[Score]`
7. **Open URLs** → that Text.

Run it each morning (add a home-screen icon, or an Automation → Time of Day ~7am).
The dial shows e.g. **"Oura 90 · Primed"** and every target adjusts. Score bands:
**<70 → Fried, 70–84 → Solid, 85+ → Primed.** A manual tap still overrides it.

There's also a **Pull from Oura** link inside the app's readiness card that fires
this shortcut.

**Token note:** Oura deprecated personal access tokens in Dec 2025. A still-valid
legacy token works; a brand-new one needs OAuth2 (awkward in a Shortcut). A 401
means the token expired; a 403 means the Oura membership lapsed — either way the
app silently falls back to the manual tap.

---

## 2. "Reps Session" — after a lift, Apple Watch stats → the app

Build one Shortcut named exactly **`Reps Session`**:

1. **Find Workouts** → `End Date` `is today`, **Sort by** `End Date` **Latest First**, **Limit** `1`. Name it **Workout**.
2. **Get Details of Workouts** → `Duration` → **Calculate** `÷ 60` → **Round**. Name it **Min**.
3. **Get Details of Workouts** → `Active Energy`. Name it **Cal**.
4. **Get Details of Workouts** → `Start Date` (**Start**) and `End Date` (**End**).
5. **Find Health Samples** → type `Heart Rate`, filter `Start Date is after [Start]` **and** `End Date is before [End]`.
6. **Calculate Statistics** → `Average` → **AvgHR**.
7. **Text** → `https://aronecoff.github.io/reps/?wdur=[Min]&whr=[AvgHR]&wcal=[Cal]`
8. **Open URLs** → that Text.

Run it right after your session (the **Pull stats from Apple Watch** button on the
day screen fires it). The app shows **"Today on Apple Watch · 47min · 128bpm · 412cal."**
Health will ask permission the first time — Allow.

---

## 3. Starting the Watch workout (honest note)

Starting a **Traditional Strength Training** workout so the Watch actually records
HR only works reliably when triggered **on the Watch** — an iPhone can't
dependably start the Watch's workout engine. So either:

- Just swipe to **Traditional Strength Training** in the Watch's Workout app, or
- Make a one-action Watch shortcut **`Reps Start`** ( **Start Workout** →
  Traditional Strength Training ) and run it from a Watch complication or the
  Action button.

Then run **Reps Session** afterward to pull the stats in.

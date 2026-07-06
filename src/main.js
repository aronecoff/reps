import './style.css'

/* ------------------------------------------------------------------ *
 * Reps — a coaching app, not a logbook. It reads your history and the
 * progression rules and tells you today's exact weight and reps for every
 * lift, adjusts for how recovered you are, and flags what's stalling.
 * All local (localStorage). Program below = "Base Block" (recomp, no
 * barbell bench, ~45-min sessions).
 * ------------------------------------------------------------------ */

const PROGRAM = 'Base Block'
const ORDER = ['ua', 'la', 'ub', 'lb']

const DAYS = {
  ua: {
    no: '01', title: 'Upper A', sub: 'Strength lean / lower reps on the main press and pull', min: '~44 min',
    blocks: [
      { key: 'A', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'A1', n: 'Machine chest press', s: '4', r: '6-8', inc: 5, note: 'Primary bench replacement. Handles at mid-chest, shoulder blades pinned back and down, elbows ~45 deg, controlled lockout.' },
        { g: 'A2', n: 'Chest-supported machine row', s: '4', r: '6-8', inc: 5, note: 'Pull to the lower ribs, 1s squeeze; the chest pad takes the low back out of it.' },
      ] },
      { key: 'B', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'B1', n: 'Incline neutral-grip DB press', s: '3', r: '8-10', inc: 5, note: 'Palms in to spare the front delt. Depth cap: stop when elbows reach torso level, no deep stretch.' },
        { g: 'B2', n: 'Lat pulldown (neutral / shoulder-width grip)', s: '3', r: '8-10', inc: 10, note: 'Neutral-close grip is shoulder-friendlier than wide. Drive elbows to the ribs, chest tall.' },
      ] },
      { key: 'C', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'C1', n: 'Cable lateral raise', s: '4', r: '12-15', inc: 5, note: 'Stop below shoulder height (~60-75 deg). Lead with the elbow, no shrug or swing.' },
        { g: 'C2', n: 'Face pull', s: '3', r: '15-20', inc: 5, note: 'Anchor at chest height, pull to the collarbone, upper arms below shoulder height. Keep it light.' },
      ] },
      { key: 'D', opt: true, kind: 'Optional / drop first if short on time', ex: [
        { g: 'D1', n: 'DB or cable biceps curl', s: '3', r: '8-12', inc: 5, note: 'Elbows pinned, control the lowering.' },
        { g: 'D2', n: 'Cable triceps pushdown', s: '3', r: '10-12', inc: 5, note: 'Elbows tucked, full lockout.' },
      ] },
    ],
  },
  la: {
    no: '02', title: 'Lower A', sub: 'Squat focus / knee-dominant main lift', min: '~43 min',
    blocks: [
      { key: 'A', kind: 'Straight sets / ~2 min rest', ex: [
        { g: 'A', n: 'Hack squat', s: '4', r: '6-10', inc: 10, note: 'Or leg press if it is taken. Controlled full depth, drive through mid-foot, no bounce.' },
      ], during: { n: 'Weighted plank or dead bug', s: '3', r: '30-45s', note: 'During the hack-squat rest — costs no extra time. Brace hard, ribs down.' } },
      { key: 'B', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'B1', n: 'Seated leg curl', s: '3', r: '10-12', inc: 10, note: 'Hamstring, pause at full flexion.' },
        { g: 'B2', n: 'DB walking lunge', s: '3', r: '10-12/leg', inc: 5, note: 'Or split squat. Long stride, tall torso; cut the last set if form breaks.' },
      ] },
      { key: 'C', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'C1', n: 'Leg extension', s: '3', r: '12-15', inc: 10, note: 'Quad isolation, 1s squeeze at the top.' },
        { g: 'C2', n: 'Standing calf raise', s: '3', r: '12-15', inc: 10, note: 'Full stretch at the bottom, 1s pause.' },
      ] },
    ],
  },
  ub: {
    no: '03', title: 'Upper B', sub: 'Hypertrophy lean / more reps across fast pairs', min: '~44 min',
    blocks: [
      { key: 'A', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'A1', n: 'Flat neutral-grip DB press', s: '3', r: '10-12', inc: 5, note: 'Palms in throughout; elbows ~45 deg. Depth cap at torso level.' },
        { g: 'A2', n: 'Seated cable row', s: '3', r: '10-12', inc: 10, note: 'Neutral handle, full stretch at the front, 1s squeeze at the back.' },
      ] },
      { key: 'B', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'B1', n: 'Landmine press', s: '3', r: '10-12', inc: 5, note: 'Half-kneeling or standing. Scapular plane, stop short of full lockout. Any overhead pinch means switch to a seated neutral-grip machine press.' },
        { g: 'B2', n: 'Lat pulldown, underhand', s: '3', r: '10-12', inc: 10, note: 'Elbows to hips; lats plus a biceps assist.' },
      ] },
      { key: 'C', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'C1', n: 'Cable lateral raise', s: '4', r: '15-20', inc: 5, note: 'Stop below shoulder height. Constant tension, high reps, honest light load.' },
        { g: 'C2', n: 'Pec-deck fly', s: '3', r: '12-15', inc: 5, note: 'Shoulder-sparing chest isolation — the fallback if any press must be pulled. No overstretch.' },
      ] },
    ],
  },
  lb: {
    no: '04', title: 'Lower B', sub: 'Hinge / glute focus / hip-dominant main lift', min: '~43 min',
    blocks: [
      { key: 'A', kind: 'Straight sets / ~2 min rest', ex: [
        { g: 'A', n: 'DB or trap-bar RDL', s: '4', r: '8-10', inc: 10, note: 'Soft knees, hips back, flat back, feel the hamstring stretch, stop 1-2 reps shy. Trap-bar is easiest to load.' },
      ], during: { n: 'Pallof press', s: '3', r: '10-12/side', note: 'Anti-rotation, during the RDL rest. Brace and resist the pull, no twisting.' } },
      { key: 'B', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'B1', n: 'Machine or barbell hip thrust', s: '3', r: '10-12', inc: 10, note: 'Full lockout, 1s squeeze, chin tucked, do not hyperextend the low back.' },
        { g: 'B2', n: 'Leg press, feet high and wide', s: '3', r: '12-15', inc: 10, note: 'Shifts to glutes and hams with zero spinal load. Do not let the low back round off the pad.' },
      ] },
      { key: 'C', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'C1', n: 'Lying or seated leg curl', s: '3', r: '12-15', inc: 10, note: 'Control the negative; second hamstring angle for the week.' },
        { g: 'C2', n: 'Seated calf raise', s: '3', r: '15-20', inc: 10, note: 'Bent-knee soleus emphasis, pause top and bottom.' },
      ] },
    ],
  },
}

function flat(id) {
  const out = []
  for (const b of DAYS[id].blocks) {
    for (const e of b.ex) out.push({ ...e, during: false })
    if (b.during) out.push({ ...b.during, g: null, during: true })
  }
  return out
}

/* ---------------- storage ---------------- */
const KEY = 'reps.v2'
let store = read()
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
store.history ||= {}     // history[dayId][idx] = [{ d, w, r }]  (oldest -> newest)
store.session ||= {}     // session[dayId][idx] = { w, r, done }  (in progress today)
store.readiness ||= {}   // readiness[YYYY-MM-DD] = 'fried' | 'solid' | 'primed'
store.oura ||= {}        // oura[YYYY-MM-DD] = { level, score } — fed on-device by the "Reps Readiness" iOS Shortcut
store.watch ||= {}       // watch[YYYY-MM-DD] = { dur, hr, cal } — fed on-device by the "Reps Session" iOS Shortcut
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)) } catch {} }

// On-device conduits: iOS Shortcuts read Oura + Apple Watch on the phone and
// hand values to the app via URL query params. Nothing leaves the device; we
// store them and scrub the URL so nothing persists in Safari history.
function ingestFromURL() {
  const p = new URLSearchParams(location.search)
  let touched = false
  const raw = p.get('readiness')
  if (raw != null) {
    const n = parseInt(raw, 10)
    if (Number.isFinite(n) && n >= 0 && n <= 100) {
      store.oura[today()] = { level: n < 70 ? 'fried' : n < 85 ? 'solid' : 'primed', score: n }
      touched = true
    }
  }
  if (p.get('wdur') != null) {
    store.watch[today()] = { dur: parseInt(p.get('wdur'), 10) || 0, hr: parseInt(p.get('whr'), 10) || 0, cal: parseInt(p.get('wcal'), 10) || 0 }
    touched = true
  }
  if (touched) { save(); if (history.replaceState) history.replaceState(null, '', location.pathname) }
}

function today() { return new Date().toISOString().slice(0, 10) }
function round5(x) { return Math.max(5, Math.round(x / 5) * 5) }

function nextDay() {
  if (!store.lastFinished) return 'ua'
  return ORDER[(ORDER.indexOf(store.lastFinished) + 1) % ORDER.length]
}
function hist(dayId, i) { return ((store.history[dayId] || {})[i]) || [] }

/* ---------------- the coach ---------------- */
// Today's readiness — Oura feed if present, else the manual check-in, else neutral.
function readiness() {
  const t = today()
  // A manual tap is a deliberate override and wins for the day; otherwise the
  // Oura score (fed by the Shortcut) is the truth; otherwise neutral.
  if (store.readiness[t]) return { level: store.readiness[t], source: 'you' }
  if (store.oura[t]) return { level: store.oura[t].level, source: 'oura' }
  return { level: 'solid', source: 'default' }
}
const READY = { fried: 'Fried', solid: 'Solid', primed: 'Primed' }

function parseRange(r) {
  const s = String(r)
  const isTime = /\d\s*s\b/i.test(s) || /\ds/i.test(s)
  const m = s.match(/(\d+)\s*[-–]\s*(\d+)/)
  let lo, hi
  if (m) { lo = +m[1]; hi = +m[2] } else { const n = s.match(/(\d+)/); lo = hi = n ? +n[1] : 8 }
  return { lo, hi, unit: isTime ? 'time' : 'reps', perSide: /\/(leg|side)/i.test(s) }
}

// The prescription for one exercise today: what weight, what reps, and why.
function prescribe(dayId, i, ex) {
  const pr = parseRange(ex.r)
  const h = hist(dayId, i)
  const last = h[h.length - 1]
  const rd = readiness().level

  // Time-based holds (planks, etc.) — progress by seconds, no load.
  if (pr.unit === 'time') {
    if (!last) return { unit: 'time', reps: pr.lo, state: 'new', why: `First time — hold ${pr.lo}s, add time as it gets easy.`, pr }
    if (last.r >= pr.hi) return { unit: 'time', reps: pr.hi, state: 'hold', why: `Solid at ${last.r}s — hold ${pr.hi}s or add a little load.`, pr }
    return { unit: 'time', reps: Math.min(pr.hi, last.r + 5), state: 'up', why: `Beat last time: ${last.r}s → ${Math.min(pr.hi, last.r + 5)}s.`, pr }
  }

  let weight = null, reps = pr.lo, state = 'new', why = ''
  if (!last) {
    why = `First time — pick a weight you can do ~${pr.lo} clean reps with, 1-2 in reserve.`
  } else {
    const W = last.w, R = last.r, inc = ex.inc || 5
    if (R >= pr.hi) { weight = W + inc; reps = pr.lo; state = 'up'; why = `Up from ${W} — you hit ${R} last time.` }
    else if (R >= pr.lo) { weight = W; reps = Math.min(pr.hi, R + 1); state = 'hold'; why = `Same ${W} — beat ${R} reps.` }
    else {
      const prev = h[h.length - 2]
      const missedTwice = prev && prev.w >= W && prev.r < pr.lo
      if (missedTwice) { weight = round5(W * 0.9); reps = pr.lo; state = 'deload'; why = `Deload ${W} → ${round5(W * 0.9)} — two misses, reset and rebuild.` }
      else { weight = W; reps = pr.lo; state = 'repeat'; why = `Repeat ${W} — get all sets to ${pr.lo} first.` }
    }
    // Autoregulate to readiness
    if (rd === 'fried') {
      if (state === 'up') { weight = W; reps = pr.lo; state = 'ease'; why = `Low readiness — hold ${W} today, take the jump next time.` }
      else if (state === 'hold' || state === 'repeat') { weight = round5(weight * 0.92); state = 'ease'; why = `Low readiness — ~8% lighter, leave it in the tank.` }
    } else if (rd === 'primed' && state === 'hold') {
      why += ' Primed — chase a rep PR.'
    }
  }
  return { unit: 'reps', weight, reps, state, why, pr }
}

// Self-evolving: read every exercise's trend and surface what's stalling.
function insights() {
  const out = []
  for (const dayId of ORDER) {
    flat(dayId).forEach((ex, i) => {
      const h = hist(dayId, i)
      if (h.length < 3) return
      const w = h.slice(-3).map(e => e.w)
      const r = h.slice(-3).map(e => e.r)
      const noWeightGain = w[2] <= w[0]
      const noRepGain = r[2] <= r[0]
      if (noWeightGain && noRepGain) {
        out.push({ dayId, exName: ex.n, kind: 'stall', text: `${ex.n} hasn't moved in 3 sessions.`, fix: 'Deload 10%, swap the variation, or add a set.' })
      } else if (w[2] > w[0] && w[1] > w[0]) {
        out.push({ dayId, exName: ex.n, kind: 'fly', text: `${ex.n} is climbing fast.`, fix: 'Take bigger jumps — it can handle it.' })
      }
    })
  }
  return out.slice(0, 4)
}

/* ---------------- view state ---------------- */
let view = 'home', active = null
const appEl = document.getElementById('app')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let scrollHandler = null

function nav(v, id) {
  const go = () => { view = v; if (id) active = id; window.scrollTo(0, 0); render() }
  if (!reduceMotion && document.startViewTransition) document.startViewTransition(go)
  else go()
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

function render() {
  if (view === 'day') renderDay()
  else if (view === 'guide') renderGuide()
  else renderHome()
  enhance()
}

function enhance() {
  const els = Array.from(appEl.querySelectorAll('.reveal'))
  const reveal = e => e.classList.add('in')
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(reveal); setupParallax(); return }
  const io = new IntersectionObserver((ents, obs) => { ents.forEach(en => { if (en.isIntersecting) { reveal(en.target); obs.unobserve(en.target) } }) }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 })
  els.forEach(e => { if (e.getBoundingClientRect().top < window.innerHeight * 0.98) reveal(e); else io.observe(e) })
  window.setTimeout(() => els.forEach(reveal), 1200)
  setupParallax()
}
function setupParallax() {
  if (scrollHandler) { window.removeEventListener('scroll', scrollHandler); scrollHandler = null }
  const hero = appEl.querySelector('[data-parallax]')
  if (!hero || reduceMotion) return
  let ticking = false
  scrollHandler = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { const y = window.scrollY || 0; hero.style.transform = `translateY(${(y * 0.22).toFixed(1)}px)`; hero.style.opacity = String(Math.max(0, 1 - y / 340)); ticking = false }) }
  window.addEventListener('scroll', scrollHandler, { passive: true })
}

/* ---------------- home ---------------- */
function renderHome() {
  const nxt = nextDay()
  const rd = readiness()
  const ins = insights()

  const readySel = ['fried', 'solid', 'primed'].map(l =>
    `<button class="rd ${rd.level === l ? 'on ' + l : ''}" data-ready="${l}">${READY[l]}</button>`).join('')
  const oScore = (store.oura[today()] || {}).score
  const readyLine = rd.source === 'oura'
    ? `Oura <b>${oScore}</b> &middot; <b>${READY[rd.level]}</b> &mdash; targets set.`
    : rd.source === 'you' ? `You set <b>${READY[rd.level]}</b> &mdash; targets set.` : `Tap how you feel, or pull it from Oura.`
  const w = store.watch[today()]
  const watchCard = w ? `<div class="watchcard glass reveal">
      <span class="wc-k">Today on Apple Watch</span>
      <div class="wc-stats"><span>${w.dur}<i>min</i></span><span>${w.hr}<i>bpm</i></span><span>${w.cal}<i>cal</i></span></div>
    </div>` : ''

  const cards = ORDER.map((id, ix) => {
    const d = DAYS[id]
    const list = flat(id)
    const done = Object.keys(store.session[id] || {}).filter(k => store.session[id][k].done).length
    let badge = ''
    if (done > 0) badge = `<span class="badge prog num">${done}/${list.length}</span>`
    else if (id === nxt) badge = `<span class="badge next">Up next</span>`
    const trained = (store.history[id] && store.history[id][0]) ? '' : `<span class="est">new</span>`
    return `<button class="daycard glass reveal ${id === nxt && done === 0 ? 'next' : ''}" data-day="${id}" style="--i:${ix}">
      <div class="dc-top"><span class="dc-no">${d.no}</span><span class="dc-title">${esc(d.title)}</span>${badge}</div>
      <div class="dc-sub">${esc(d.sub)} <span class="est">${esc(d.min)}</span></div>
    </button>`
  }).join('')

  const insHtml = ins.length ? `
    <div class="uplabel">What to watch</div>
    ${ins.map(o => `<div class="insight glass reveal ${o.kind}"><div class="ins-k">${o.kind === 'stall' ? 'Stalled' : 'Flying'}</div><div class="ins-t">${esc(o.text)} <span class="m">${esc(o.fix)}</span></div></div>`).join('')}` : ''

  appEl.innerHTML = `
    <div class="app">
      <div class="hero" data-parallax>
        <div class="mono" style="margin-bottom:14px">${esc(PROGRAM)} / Recomposition</div>
        <div class="word">Today's<br><b>numbers.</b></div>
        <div class="sub">No blank sheet. Reps reads your history and hands you the <b>exact weight and reps</b> to hit — you just show up and beat them.</div>
      </div>

      <div class="readycard glass reveal">
        <div class="rd-head"><span class="k">Readiness</span><span class="rd-src">${readyLine}</span></div>
        <div class="rd-row">${readySel}</div>
        <a class="mini-sync" href="shortcuts://run-shortcut?name=Reps%20Readiness">Pull from Oura</a>
      </div>
      ${watchCard}

      <div class="uplabel">Your week &mdash; up next is <b>${esc(DAYS[nxt].title)}</b></div>
      ${cards}
      ${insHtml}
      <div class="homelinks">
        <button class="linkcard glass reveal" data-go="guide">
          <div class="k">Reference</div><div class="t">The engine &amp; fuel</div>
          <div class="d">How the coach decides your numbers, plus shoulder rules, nutrition, conditioning.</div>
        </button>
      </div>
      <div class="foot"><b>Start honest.</b> Log what you actually lift — the weights you enter are what tomorrow's targets are built from. Everything is saved on this device.</div>
    </div>`

  appEl.querySelectorAll('.daycard').forEach(el => el.addEventListener('click', () => nav('day', el.dataset.day)))
  appEl.querySelector('[data-go="guide"]').addEventListener('click', () => nav('guide'))
  appEl.querySelectorAll('[data-ready]').forEach(el => el.addEventListener('click', () => {
    store.readiness[today()] = el.dataset.ready; save(); render()
  }))
}

/* ---------------- day ---------------- */
function stateChip(s) {
  const map = { up: ['Progress', 'up'], hold: ['Hold', 'hold'], ease: ['Recover', 'ease'], repeat: ['Repeat', 'repeat'], deload: ['Deload', 'deload'], new: ['New lift', 'new'] }
  const [label, cls] = map[s] || ['', 'new']
  return `<span class="chip ${cls}">${label}</span>`
}

function renderDay() {
  const d = DAYS[active]
  const list = flat(active)
  const sess = store.session[active] || {}

  let i = 0
  const blocksHtml = d.blocks.map(b => {
    const rows = []
    for (const e of b.ex) { rows.push(exRow(e, i, sess, false)); i++ }
    if (b.during) { rows.push(exRow({ ...b.during, g: null }, i, sess, true)); i++ }
    return `<div class="block ${b.opt ? 'opt' : ''}">
      <div class="block-head"><span class="block-key">${esc(b.key)}</span><span class="block-kind">${esc(b.kind)}</span></div>
      ${rows.join('')}</div>`
  }).join('')

  appEl.innerHTML = `
    <div class="app">
      <div class="topbar"><button class="bar-btn" data-back><span class="chev">&lsaquo;</span> Week</button><div class="grow"></div></div>
      <div class="day-hd reveal">
        <h2>${esc(d.title)}</h2>
        <div class="sub">${esc(d.sub)}</div>
        <div class="meta"><span class="pill amber">${esc(d.min)} on the floor</span><span class="pill"><b>${list.length}</b> movements</span><span class="pill">Readiness: <b>${READY[readiness().level]}</b></span></div>
      </div>
      ${blocksHtml}
      <div class="finish">
        <button class="btn" data-finish>Finish &amp; save</button>
        <div class="hint">Banks what you logged as history, so next ${esc(d.title)} opens with fresh targets. Then clears the board.</div>
        <a class="btn ghost" href="shortcuts://run-shortcut?name=Reps%20Session">Pull stats from Apple Watch</a>
        <button class="btn ghost" data-reset>Discard this session</button>
      </div>
    </div>`

  appEl.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', () => nav('home')))
  appEl.querySelector('[data-finish]').addEventListener('click', finishDay)
  appEl.querySelector('[data-reset]').addEventListener('click', () => { delete store.session[active]; save(); render() })
  wireRows()
}

function exRow(e, idx, sess, during) {
  const rx = prescribe(active, idx, e)
  const logged = sess[idx]
  const done = logged && logged.done
  const g = during ? `<span class="ex-g rest-tag">During rest</span>` : (e.g ? `<span class="ex-g">${esc(e.g)}</span>` : '')

  // The prescription headline
  let head
  if (rx.unit === 'time') head = `<span class="rx-w">${rx.reps}s</span>`
  else if (rx.weight == null) head = `<span class="rx-w new">Choose weight</span><span class="rx-x">&times; ${rx.reps}${rx.pr.perSide ? '/side' : ''}</span>`
  else head = `<span class="rx-w">${rx.weight}<span class="u">lb</span></span><span class="rx-x">&times; ${rx.reps}${rx.pr.perSide ? '/side' : ''}</span>`

  // Log fields (prefilled to the prescription)
  const wVal = logged ? logged.w : (rx.weight != null ? rx.weight : '')
  const rVal = logged ? logged.r : rx.reps
  const fields = rx.unit === 'time'
    ? `<input class="lf lf-r" data-idx="${idx}" inputmode="numeric" value="${rVal}" aria-label="seconds"><span class="lf-u">sec</span>`
    : `<input class="lf lf-w" data-idx="${idx}" inputmode="decimal" value="${wVal}" placeholder="wt" aria-label="weight"><span class="lf-x">&times;</span><input class="lf lf-r" data-idx="${idx}" inputmode="numeric" value="${rVal}" aria-label="reps">`

  return `<div class="ex glass ${done ? 'done' : ''} ${during ? 'during' : ''}" data-idx="${idx}">
    <div class="ex-main">
      <div class="ex-body"><div class="ex-top">${g}<span class="ex-name">${esc(e.n)}</span>${during ? '' : stateChip(rx.state)}</div>
      ${e.note ? `<div class="ex-note">${esc(e.note)}</div>` : ''}</div>
      <div class="ex-scheme num">${esc(e.s)} <span>&times;</span> ${esc(e.r)}</div>
    </div>
    <div class="rx">
      <div class="rx-head">${head}</div>
      <div class="rx-why">${esc(rx.why)}</div>
    </div>
    <div class="logrow">
      <div class="lf-wrap">${fields}</div>
      <button class="hit" data-hit="${idx}" aria-pressed="${done ? 'true' : 'false'}">${done ? 'Logged' : 'Hit it'}</button>
    </div>
  </div>`
}

function wireRows() {
  appEl.querySelectorAll('.hit').forEach(btn => btn.addEventListener('click', () => {
    const idx = btn.dataset.hit
    const ex = document.querySelector(`.ex[data-idx="${idx}"]`)
    const wEl = ex.querySelector('.lf-w'), rEl = ex.querySelector('.lf-r')
    const w = wEl ? parseFloat(wEl.value) : null
    const r = parseInt(rEl.value, 10)
    if ((wEl && !(w > 0)) || !(r > 0)) { ex.classList.add('nudge'); setTimeout(() => ex.classList.remove('nudge'), 400); return }
    const s = (store.session[active] ||= {})
    const was = s[idx] && s[idx].done
    if (was) { delete s[idx]; ex.classList.remove('done'); btn.textContent = 'Hit it'; btn.setAttribute('aria-pressed', 'false') }
    else { s[idx] = { w: wEl ? w : null, r, done: true }; ex.classList.add('done'); btn.textContent = 'Logged'; btn.setAttribute('aria-pressed', 'true') }
    save()
  }))
}

function finishDay() {
  const id = active
  const sess = store.session[id] || {}
  const H = (store.history[id] ||= {})
  const t = today()
  Object.keys(sess).forEach(k => {
    if (!sess[k].done) return
    const arr = (H[k] ||= [])
    arr.push({ d: t, w: sess[k].w, r: sess[k].r })
    if (arr.length > 8) arr.shift()
  })
  delete store.session[id]
  store.lastFinished = id
  save()
  nav('home')
}

/* ---------------- guide ---------------- */
function renderGuide() {
  const cond = [
    ['Dose', '<b>2-3x / week, ~15-20 min</b>, on non-lifting days or after a lift. Keep it easy enough that it never leaves you too sore to train.'],
    ['Base', '<b>Zone 2, conversational pace.</b> The pool swim or water jog is the best low-impact option and gives the shoulder a full break.'],
    ['Hard', '<b>Intervals, once a week at most.</b> 6-10 rounds of ~20-30s harder / ~60-90s easy on the bike or in the pool.'],
    ['Note', '<b>Favor the pool, bike, and incline walk</b> over anything overhead. If freestyle bugs the shoulder, flutter-kick with a board.'],
  ]
  appEl.innerHTML = `
    <div class="app">
      <div class="topbar"><button class="bar-btn" data-back><span class="chev">&lsaquo;</span> Week</button><div class="grow"></div><span class="bar-title">Guide</span></div>

      <div class="sec-head"><span class="idx">00</span><h3>How the coach decides</h3></div>
      <div class="note-card glass reveal">
        <p class="lead">You don't run the math — the app does. Every session it reads your last log and sets today's target:</p>
        <div class="rows">
          <div class="row"><span class="lead">Up</span><span class="txt"><span class="m">Hit the <b>top</b> of the rep range last time? It adds weight and resets reps to the bottom.</span></span></div>
          <div class="row"><span class="lead">Hold</span><span class="txt"><span class="m">Landed <b>mid-range</b>? Same weight, beat your reps by one.</span></span></div>
          <div class="row"><span class="lead">Reset</span><span class="txt"><span class="m">Missed the bottom <b>twice</b>? It deloads ~10% so you can rebuild with momentum.</span></span></div>
          <div class="row"><span class="lead steel">Ready</span><span class="txt"><span class="m">Logged <b>Fried</b> (or Oura says so)? It eases the load and skips the jump — hammer next time.</span></span></div>
        </div>
      </div>

      <div class="sec-head"><span class="idx">01</span><h3>The two levers</h3></div>
      <div class="levers">
        <div class="lever glass reveal"><div class="k">The gym</div><h4>Progressive overload</h4><p>Lift hard, add over time. The coach drives this for you — your only job is to log honestly and chase the target.</p></div>
        <div class="lever glass reveal"><div class="k">The kitchen</div><h4>Slight deficit, high protein</h4><p>Fat loss is decided here. Eat a little under maintenance, keep protein high, fat comes off while muscle stays.</p></div>
      </div>

      <div class="sec-head"><span class="idx">02</span><h3>Shoulder rules</h3></div>
      <div class="callout reveal"><div class="k">Every session</div>
        <p><b>Press to controlled depth, not a deep stretch.</b> <b>Raises and overhead stay under the painful arc.</b> Sharp pain (not fatigue) means stop and use the pec-deck / seated-machine fallback. This manages around a sensitive shoulder — it doesn't replace a clinician.</p></div>

      <div class="sec-head"><span class="idx">03</span><h3>Fuel</h3></div>
      <div class="note-card glass reveal"><div class="rows">
        <div class="row"><span class="lead">01</span><span class="txt"><b>Slight deficit.</b> <span class="m">~250-500 kcal under maintenance, or maintenance while you're new. Don't crash it.</span></span></div>
        <div class="row"><span class="lead">02</span><span class="txt"><b>Protein first.</b> <span class="m">~0.8-1 g per lb of bodyweight, every day.</span></span></div>
        <div class="row"><span class="lead">03</span><span class="txt"><b>Sleep 7-9 hours.</b> <span class="m">Muscle is built in recovery — and it's what the readiness dial reads.</span></span></div>
      </div></div>

      <div class="sec-head"><span class="idx">04</span><h3>Conditioning</h3></div>
      <div class="note-card glass reveal"><div class="rows">
        ${cond.map(([l, t]) => `<div class="row"><span class="lead steel" style="width:56px">${l}</span><span class="txt">${t}</span></div>`).join('')}
      </div></div>

      <div class="foot"><b>Base Block.</b> When "What to watch" starts flagging stalls across the board, the block's done its job — time to rebuild it. Just ask.</div>
    </div>`
  appEl.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', () => nav('home')))
}

ingestFromURL()
render()

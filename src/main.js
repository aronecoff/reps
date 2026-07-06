import './style.css'

/* Reps — a quiet coach. It knows your split, hands you today's weight, you tap
 * to confirm. Push / Pull / Legs, 5 days, legs once. All on-device. */

const PROGRAM = 'Push · Pull · Legs'
const ORDER = ['push1', 'pull1', 'legs', 'push2', 'pull2']

const DAYS = {
  push1: { title: 'Push', focus: 'Chest', ex: [
    { n: 'Machine chest press', s: '4', r: '6-8', inc: 5 },
    { n: 'Incline DB press, neutral grip', s: '3', r: '8-10', inc: 5 },
    { n: 'Seated DB shoulder press', s: '3', r: '8-10', inc: 5 },
    { n: 'Cable lateral raise', s: '3', r: '12-15', inc: 5 },
    { n: 'Triceps rope pushdown', s: '3', r: '10-12', inc: 5 },
  ] },
  pull1: { title: 'Pull', focus: 'Width', ex: [
    { n: 'Lat pulldown', s: '4', r: '8-10', inc: 10 },
    { n: 'Chest-supported row', s: '3', r: '8-10', inc: 5 },
    { n: 'Seated cable row', s: '3', r: '10-12', inc: 10 },
    { n: 'Face pull', s: '3', r: '15-20', inc: 5 },
    { n: 'DB curl', s: '3', r: '10-12', inc: 5 },
  ] },
  legs: { title: 'Legs', focus: '', ex: [
    { n: 'Hack squat', s: '4', r: '6-10', inc: 10 },
    { n: 'Romanian deadlift', s: '3', r: '8-10', inc: 10 },
    { n: 'Leg press', s: '3', r: '10-12', inc: 10 },
    { n: 'Seated leg curl', s: '3', r: '10-12', inc: 10 },
    { n: 'Leg extension', s: '3', r: '12-15', inc: 10 },
    { n: 'Standing calf raise', s: '4', r: '12-15', inc: 10 },
  ] },
  push2: { title: 'Push', focus: 'Shoulders', ex: [
    { n: 'Incline machine press', s: '4', r: '8-10', inc: 5 },
    { n: 'Machine shoulder press', s: '3', r: '8-10', inc: 5 },
    { n: 'Pec-deck fly', s: '3', r: '12-15', inc: 5 },
    { n: 'Cable lateral raise', s: '4', r: '15-20', inc: 5 },
    { n: 'Overhead triceps extension', s: '3', r: '10-12', inc: 5 },
  ] },
  pull2: { title: 'Pull', focus: 'Thickness', ex: [
    { n: 'Lat pulldown, underhand', s: '3', r: '8-10', inc: 10 },
    { n: 'One-arm DB row', s: '3', r: '8-10', inc: 5 },
    { n: 'Machine row', s: '3', r: '10-12', inc: 10 },
    { n: 'Rear-delt fly', s: '3', r: '15-20', inc: 5 },
    { n: 'Incline DB curl', s: '3', r: '10-12', inc: 5 },
  ] },
}
const DNUM = { push1: '01', pull1: '02', legs: '03', push2: '04', pull2: '05' }

/* ---------------- storage ---------------- */
const KEY = 'reps.v3'
let store = read()
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
store.history ||= {}; store.session ||= {}; store.readiness ||= {}; store.oura ||= {}; store.watch ||= {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)) } catch {} }
function today() { return new Date().toISOString().slice(0, 10) }
function round5(x) { return Math.max(5, Math.round(x / 5) * 5) }
function hist(id, i) { return ((store.history[id] || {})[i]) || [] }
function nextDay() { return store.lastFinished ? ORDER[(ORDER.indexOf(store.lastFinished) + 1) % ORDER.length] : 'push1' }

/* On-device conduits: iOS Shortcuts hand values via URL params, then we scrub. */
function ingestFromURL() {
  const p = new URLSearchParams(location.search); let touched = false
  const raw = p.get('readiness')
  if (raw != null) { const n = parseInt(raw, 10); if (Number.isFinite(n) && n >= 0 && n <= 100) { store.oura[today()] = { level: n < 70 ? 'fried' : n < 85 ? 'solid' : 'primed', score: n }; touched = true } }
  if (p.get('wdur') != null) { store.watch[today()] = { dur: parseInt(p.get('wdur'), 10) || 0, hr: parseInt(p.get('whr'), 10) || 0, cal: parseInt(p.get('wcal'), 10) || 0 }; touched = true }
  if (touched) { save(); if (history.replaceState) history.replaceState(null, '', location.pathname) }
}

/* ---------------- the coach ---------------- */
const READY = { fried: 'Fried', solid: 'Solid', primed: 'Primed' }
function readiness() {
  const t = today()
  if (store.readiness[t]) return { level: store.readiness[t], source: 'you' }
  if (store.oura[t]) return { level: store.oura[t].level, source: 'oura' }
  return { level: 'solid', source: 'default' }
}
function parseRange(r) {
  const m = String(r).match(/(\d+)\s*[-–]\s*(\d+)/); let lo, hi
  if (m) { lo = +m[1]; hi = +m[2] } else { const n = String(r).match(/(\d+)/); lo = hi = n ? +n[1] : 8 }
  return { lo, hi }
}
// Suggested weight + reps + a terse note for today.
function prescribe(id, i, ex) {
  const pr = parseRange(ex.r), h = hist(id, i), last = h[h.length - 1], rd = readiness().level
  if (!last) return { weight: null, reps: pr.lo, note: 'set your weight' }
  const W = last.w, R = last.r, inc = ex.inc || 5
  let weight, reps, note
  if (R >= pr.hi) { weight = W + inc; reps = pr.lo; note = `up from ${W}` }
  else if (R >= pr.lo) { weight = W; reps = Math.min(pr.hi, R + 1); note = `beat ${R} reps` }
  else {
    const prev = h[h.length - 2], twice = prev && prev.w >= W && prev.r < pr.lo
    if (twice) { weight = round5(W * 0.9); reps = pr.lo; note = `deload from ${W}` }
    else { weight = W; reps = pr.lo; note = `hold ${W}` }
  }
  if (rd === 'fried' && (R >= pr.hi)) { weight = W; reps = pr.lo; note = `easy — hold ${W}` }
  else if (rd === 'fried') { weight = round5(weight * 0.92); note = `easy — light` }
  return { weight, reps, note }
}
function insights() {
  const out = []
  for (const id of ORDER) DAYS[id].ex.forEach((ex, i) => {
    const h = hist(id, i); if (h.length < 3) return
    const w = h.slice(-3).map(e => e.w)
    if (w[2] <= w[0] && h.slice(-3).map(e => e.r)[2] <= h.slice(-3).map(e => e.r)[0]) out.push(`${ex.n} has stalled — deload, swap, or add a set.`)
  })
  return out.slice(0, 3)
}

/* ---------------- view state ---------------- */
let view = 'home', active = null
const appEl = document.getElementById('app')
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
function nav(v, id) {
  const go = () => { view = v; if (id) active = id; scrollTo(0, 0); render() }
  if (!reduceMotion && document.startViewTransition) document.startViewTransition(go); else go()
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
function render() { view === 'day' ? renderDay() : view === 'guide' ? renderGuide() : renderHome() }

/* ---------------- home ---------------- */
function renderHome() {
  const nxt = nextDay(), rd = readiness(), oScore = (store.oura[today()] || {}).score
  const segs = ['fried', 'solid', 'primed'].map(l => `<button class="rseg ${rd.level === l ? 'on' : ''}" data-ready="${l}">${READY[l]}</button>`).join('')
  const w = store.watch[today()]
  const watchLine = w ? `<div class="watch-line"><span class="wl-lab">Last session</span><div class="wl-stats"><span>${w.dur}<i>min</i></span><span>${w.hr}<i>bpm</i></span><span>${w.cal}<i>cal</i></span></div></div>` : ''

  const rows = ORDER.map(id => {
    const d = DAYS[id]
    const tag = id === nxt ? `<span class="d-tag today">Today</span>` : `<span class="chev">›</span>`
    return `<button class="drow" data-day="${id}">
      <span class="idx">${DNUM[id]}</span>
      <span class="d-main"><span class="d-name">${d.title}${d.focus ? `<span class="d-focus">${d.focus}</span>` : ''}</span>
      <span class="d-sub">${d.ex.length} exercises</span></span>
      ${tag}
    </button>`
  }).join('')

  appEl.innerHTML = `<div class="app">
    <div class="home-head">
      <div class="eyebrow">${esc(PROGRAM)}</div>
      <h1>This week.</h1>
      <div class="sub">Five sessions. Tap today's — your numbers are already set.</div>
    </div>
    <div class="ready"><span class="ready-lab">Readiness</span>${oScore ? `<span class="ready-oura">Oura <b>${oScore}</b></span>` : ''}<div class="ready-seg">${segs}</div></div>
    ${watchLine}
    <nav class="week">${rows}</nav>
    <div class="home-foot"><b>Start honest.</b> Log what you actually lift — it's what tomorrow's targets are built from. <a data-go="guide">How it works ›</a></div>
  </div>`

  appEl.querySelectorAll('.drow').forEach(el => el.addEventListener('click', () => nav('day', el.dataset.day)))
  appEl.querySelectorAll('[data-ready]').forEach(el => el.addEventListener('click', () => { store.readiness[today()] = el.dataset.ready; save(); render() }))
  appEl.querySelector('[data-go="guide"]').addEventListener('click', () => nav('guide'))
}

/* ---------------- day ---------------- */
function targetHTML(logged, rx, ex) {
  if (logged && logged.done) return `<span class="big">${logged.w != null ? logged.w + ' lb' : ''} × ${logged.r}</span> <span class="prog">logged</span>`
  if (rx.weight == null) return `<span class="prog">${rx.note}</span>`
  return `<span class="big">${rx.weight} lb</span> <span class="prog">${esc(rx.note)}</span>`
}
function renderDay() {
  const d = DAYS[active], rd = readiness()
  const rows = d.ex.map((ex, i) => {
    const rx = prescribe(active, i, ex), logged = (store.session[active] || {})[i]
    const done = logged && logged.done
    const wVal = logged ? logged.w : rx.weight, rVal = logged ? logged.r : rx.reps
    return `<div class="exrow ${done ? 'done' : ''}" data-idx="${i}">
      <div class="ex-line">
        <button class="ex-check" data-check="${i}" aria-label="complete"></button>
        <div class="ex-body" data-edit="${i}"><span class="ex-name">${esc(ex.n)}</span><span class="ex-target">${targetHTML(logged, rx, ex)}</span></div>
        <span class="ex-scheme">${esc(ex.s)}×${esc(ex.r)}</span>
      </div>
      <div class="ex-edit">
        <input class="e-w" data-idx="${i}" inputmode="decimal" value="${wVal != null ? wVal : ''}" placeholder="wt" aria-label="weight">
        <span class="x">×</span>
        <input class="e-r" data-idx="${i}" inputmode="numeric" value="${rVal}" aria-label="reps">
        <button class="save" data-save="${i}">Save</button>
      </div>
    </div>`
  }).join('')

  appEl.innerHTML = `<div class="app">
    <div class="bar"><button class="back" data-back><span class="chev">‹</span> Week</button><span class="grow"></span><span class="b-meta">Readiness <b>${READY[rd.level]}</b></span></div>
    <div class="day-head"><div class="eyebrow">${d.focus ? esc(d.focus) : 'Legs'}</div><h2>${esc(d.title)}</h2></div>
    <div class="exlist">${rows}</div>
    <div class="finish">
      <button class="btn" data-finish>Finish</button>
      <div class="hint">Saves today's weights as next time's targets.</div>
      <a class="btn quiet" href="shortcuts://run-shortcut?name=Reps%20Session">Pull stats from Apple Watch</a>
      <button class="btn quiet" data-reset>Discard session</button>
    </div>
  </div>`
  wireDay()
}
function wireDay() {
  appEl.querySelector('[data-back]').addEventListener('click', () => nav('home'))
  appEl.querySelector('[data-finish]').addEventListener('click', finishDay)
  appEl.querySelector('[data-reset]').addEventListener('click', () => { delete store.session[active]; save(); render() })

  appEl.querySelectorAll('[data-check]').forEach(btn => btn.addEventListener('click', () => {
    const i = btn.dataset.check, row = btn.closest('.exrow')
    const s = (store.session[active] ||= {})
    if (s[i] && s[i].done) { delete s[i]; row.classList.remove('done') }
    else {
      const ex = DAYS[active].ex[i], rx = prescribe(active, i, ex)
      if (rx.weight == null && !(s[i] && s[i].w)) { row.classList.add('editing'); const wi = row.querySelector('.e-w'); if (wi) wi.focus(); return }
      s[i] = { w: (s[i] && s[i].w != null) ? s[i].w : rx.weight, r: (s[i] && s[i].r) ? s[i].r : rx.reps, done: true }
      row.classList.add('done'); row.classList.remove('editing')
    }
    updateTarget(row, i); save()
  }))
  appEl.querySelectorAll('[data-edit]').forEach(el => el.addEventListener('click', () => el.closest('.exrow').classList.toggle('editing')))
  appEl.querySelectorAll('[data-save]').forEach(btn => btn.addEventListener('click', () => {
    const i = btn.dataset.save, row = btn.closest('.exrow')
    const w = parseFloat(row.querySelector('.e-w').value), r = parseInt(row.querySelector('.e-r').value, 10)
    if (!(r > 0)) { return }
    const s = (store.session[active] ||= {})
    s[i] = { w: Number.isFinite(w) ? w : null, r, done: true }
    row.classList.add('done'); row.classList.remove('editing'); updateTarget(row, i); save()
  }))
}
function updateTarget(row, i) {
  const ex = DAYS[active].ex[i], rx = prescribe(active, i, ex), logged = (store.session[active] || {})[i]
  row.querySelector('.ex-target').innerHTML = targetHTML(logged, rx, ex)
}
function finishDay() {
  const id = active, sess = store.session[id] || {}, H = (store.history[id] ||= {}), t = today()
  Object.keys(sess).forEach(k => { if (!sess[k].done) return; const arr = (H[k] ||= []); arr.push({ d: t, w: sess[k].w, r: sess[k].r }); if (arr.length > 8) arr.shift() })
  delete store.session[id]; store.lastFinished = id; save(); nav('home')
}

/* ---------------- guide (minimal) ---------------- */
function renderGuide() {
  const ins = insights()
  appEl.innerHTML = `<div class="app">
    <div class="bar"><button class="back" data-back><span class="chev">‹</span> Week</button></div>
    <div class="day-head"><div class="eyebrow">Reference</div><h2>How it works</h2></div>
    <div class="guide-sec"><h3>The numbers</h3><p>Each lift shows the weight to hit today, set from your last session. <b>Hit the top of the rep range</b> and it adds weight next time; <b>land mid-range</b> and it asks for one more rep; <b>miss twice</b> and it deloads. You just tap the circle to confirm, or tap the name to adjust.</p></div>
    <div class="guide-sec"><h3>Readiness</h3><p>Set <b>Fried / Solid / Primed</b> (or sync Oura) and every target eases or holds to match. Fried skips the jump and lightens the load.</p></div>
    <div class="guide-sec"><h3>Shoulders</h3><p>Press to controlled depth, keep raises under the painful arc, and swap to the pec-deck / machine press if anything is sharp. No barbell bench.</p></div>
    <div class="guide-sec"><h3>Fuel</h3><p>Slight deficit or maintenance, <b>protein ~0.8-1 g/lb</b> daily, sleep 7-9 hours. The gym builds it; the kitchen reveals it.</p></div>
    ${ins.length ? `<div class="guide-sec"><h3>Watching</h3>${ins.map(t => `<p>${esc(t)}</p>`).join('')}</div>` : ''}
  </div>`
  appEl.querySelector('[data-back]').addEventListener('click', () => nav('home'))
}

ingestFromURL()
render()

import './style.css'

/* ------------------------------------------------------------------ *
 * Reps — a local-first training app. All state lives in localStorage;
 * there is no backend and no account. The program below is "Base Block"
 * (a 4-day recomposition block, no barbell bench, ~45 min sessions).
 * ------------------------------------------------------------------ */

const PROGRAM = 'Base Block'
const ORDER = ['ua', 'la', 'ub', 'lb']

const DAYS = {
  ua: {
    no: '01', title: 'Upper A', sub: 'Strength lean / lower reps on the main press and pull', min: '~44 min',
    blocks: [
      { key: 'A', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'A1', n: 'Machine chest press', s: '4', r: '6-8', note: 'Primary bench replacement. Handles at mid-chest, shoulder blades pinned back and down, elbows ~45 deg, controlled lockout - no slam.' },
        { g: 'A2', n: 'Chest-supported machine row', s: '4', r: '6-8', note: 'Antagonist to the press. Pull to the lower ribs, 1s squeeze; the chest pad takes the low back out of it.' },
      ] },
      { key: 'B', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'B1', n: 'Incline neutral-grip DB press', s: '3', r: '8-10', note: 'Palms in to spare the front delt; upper-chest emphasis. Depth cap: stop when elbows reach torso level, no deep stretch.' },
        { g: 'B2', n: 'Lat pulldown (neutral / shoulder-width grip)', s: '3', r: '8-10', note: 'Neutral-close grip is shoulder-friendlier than wide. Drive elbows to the ribs, chest tall, no swing.' },
      ] },
      { key: 'C', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'C1', n: 'Cable lateral raise', s: '4', r: '12-15', note: 'Stop below shoulder height (~60-75 deg) - stay under the painful arc. Lead with the elbow, no shrug or swing.' },
        { g: 'C2', n: 'Face pull', s: '3', r: '15-20', note: 'Anchor at chest height, pull to the collarbone, upper arms below shoulder height. Rear-delt + cuff insurance - keep it light.' },
      ] },
      { key: 'D', opt: true, kind: 'Optional / drop first if short on time', ex: [
        { g: 'D1', n: 'DB or cable biceps curl', s: '3', r: '8-12', note: 'Direct biceps. Elbows pinned, control the lowering.' },
        { g: 'D2', n: 'Cable triceps pushdown', s: '3', r: '10-12', note: 'Direct triceps. Elbows tucked, full lockout.' },
      ] },
    ],
  },
  la: {
    no: '02', title: 'Lower A', sub: 'Squat focus / knee-dominant main lift', min: '~43 min',
    blocks: [
      { key: 'A', kind: 'Straight sets / ~2 min rest', ex: [
        { g: 'A', n: 'Hack squat (or leg press if it is taken)', s: '4', r: '6-10', note: 'Main quad compound. Controlled full depth, drive through mid-foot, no bounce out of the bottom.' },
      ], during: { n: 'Weighted plank or dead bug', s: '3', r: '30-45s', note: 'Done during the hack-squat rest periods - costs no extra time. Brace hard, ribs down.' } },
      { key: 'B', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'B1', n: 'Seated leg curl', s: '3', r: '10-12', note: 'Hamstring, pause at full flexion.' },
        { g: 'B2', n: 'DB walking lunge (or split squat)', s: '3', r: '10-12/leg', note: 'Longest item of the day. Long stride, tall torso; if form breaks under fatigue, cut the last set.' },
      ] },
      { key: 'C', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'C1', n: 'Leg extension', s: '3', r: '12-15', note: 'Quad isolation, 1s squeeze at the top.' },
        { g: 'C2', n: 'Standing calf raise', s: '3', r: '12-15', note: 'Full stretch at the bottom, 1s pause. Gastroc emphasis.' },
      ] },
    ],
  },
  ub: {
    no: '03', title: 'Upper B', sub: 'Hypertrophy lean / more reps across fast pairs', min: '~44 min',
    blocks: [
      { key: 'A', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'A1', n: 'Flat neutral-grip DB press', s: '3', r: '10-12', note: 'Palms in throughout; elbows ~45 deg. Depth cap: stop when elbows reach torso level. Main horizontal press this day.' },
        { g: 'A2', n: 'Seated cable row', s: '3', r: '10-12', note: 'Neutral handle, full stretch at the front, 1s squeeze at the back.' },
      ] },
      { key: 'B', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'B1', n: 'Landmine press (half-kneeling or standing)', s: '3', r: '10-12', note: 'Only vertical press of the week. Press in the scapular plane, stop short of full lockout. Any overhead discomfort means switch to the seated neutral-grip machine press.' },
        { g: 'B2', n: 'Lat pulldown, underhand', s: '3', r: '10-12', note: 'Elbows to hips; lats plus a biceps assist.' },
      ] },
      { key: 'C', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'C1', n: 'Cable lateral raise', s: '4', r: '15-20', note: 'Stop below shoulder height. Constant tension, high reps, honest light load. Second side-delt session of the week.' },
        { g: 'C2', n: 'Pec-deck fly', s: '3', r: '12-15', note: 'Shoulder-sparing chest isolation - the pain-free fallback if any press must be pulled. Controlled, no overstretch. (Swap to reverse pec-deck for rear delts if chest feels covered.)' },
      ] },
    ],
  },
  lb: {
    no: '04', title: 'Lower B', sub: 'Hinge / glute focus / hip-dominant main lift', min: '~43 min',
    blocks: [
      { key: 'A', kind: 'Straight sets / ~2 min rest', ex: [
        { g: 'A', n: 'DB or trap-bar RDL', s: '4', r: '8-10', note: 'Main hinge. Soft knees, hips back, flat back, feel the hamstring stretch, stop 1-2 reps shy. Trap-bar is easiest to load. (Back-extension or hinge machine if loading the spine is undesirable.)' },
      ], during: { n: 'Pallof press (anti-rotation)', s: '3', r: '10-12/side', note: 'Done during the RDL rest periods - time-neutral. Brace and resist the pull, no twisting.' } },
      { key: 'B', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'B1', n: 'Machine or barbell hip thrust', s: '3', r: '10-12', note: 'Glute-dominant. Full lockout, 1s squeeze, chin tucked, do not hyperextend the low back.' },
        { g: 'B2', n: 'Leg press, feet high and wide', s: '3', r: '12-15', note: 'High/wide stance shifts to glutes and hams with zero spinal load. Do not let the low back round off the pad.' },
      ] },
      { key: 'C', kind: 'Superset / alternate, 60-90s rest', ex: [
        { g: 'C1', n: 'Lying or seated leg curl', s: '3', r: '12-15', note: 'Control the negative; second hamstring angle for the week.' },
        { g: 'C2', n: 'Seated calf raise', s: '3', r: '15-20', note: 'Bent-knee soleus emphasis, pause top and bottom - complements the standing raise on Lower A.' },
      ] },
    ],
  },
}

/* Flatten a day into an ordered list of exercises (including the during-rest
 * core item), so each has a stable index for checks + logging. */
function flat(id) {
  const out = []
  for (const b of DAYS[id].blocks) {
    for (const e of b.ex) out.push({ ...e, during: false })
    if (b.during) out.push({ ...b.during, g: null, during: true })
  }
  return out
}

/* ---------------- storage ---------------- */
const KEY = 'reps.v1'
let store = read()
function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
store.checks ||= {}
store.cur ||= {}
store.last ||= {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* private mode */ } }

function nextDay() {
  if (!store.lastFinished) return 'ua'
  const i = ORDER.indexOf(store.lastFinished)
  return ORDER[(i + 1) % ORDER.length]
}
function doneCount(id) {
  const c = store.checks[id] || {}
  return Object.keys(c).filter(k => c[k]).length
}

/* ---------------- view state ---------------- */
let view = 'home'
let active = null
const appEl = document.getElementById('app')

function nav(v, id) { view = v; if (id) active = id; window.scrollTo(0, 0); render() }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/* ---------------- render ---------------- */
function render() {
  if (view === 'day') renderDay()
  else if (view === 'guide') renderGuide()
  else renderHome()
}

function renderHome() {
  const nxt = nextDay()
  const cards = ORDER.map(id => {
    const d = DAYS[id]
    const total = flat(id).length
    const done = doneCount(id)
    let badge = ''
    if (done > 0) badge = `<span class="badge prog num">${done}/${total}</span>`
    else if (id === nxt) badge = `<span class="badge next">Up next</span>`
    return `<button class="daycard ${id === nxt && done === 0 ? 'next' : ''}" data-day="${id}">
      <div class="dc-top">
        <span class="dc-no">${d.no}</span>
        <span class="dc-title">${esc(d.title)}</span>
        ${badge}
      </div>
      <div class="dc-sub">${esc(d.sub)} <span class="est">${esc(d.min)}</span></div>
    </button>`
  }).join('')

  appEl.innerHTML = `
    <div class="app">
      <div class="hero">
        <div class="mono" style="margin-bottom:14px">${esc(PROGRAM)} / Recomposition</div>
        <div class="word">Ready to<br><b>train.</b></div>
        <div class="sub">Pick today's session. Last week's weights are remembered, so you always know the number to <b>beat</b>.</div>
      </div>
      <div class="uplabel">The week &mdash; up next is <b style="color:var(--amber)">${esc(DAYS[nxt].title)}</b></div>
      ${cards}
      <div class="homelinks">
        <button class="linkcard" data-go="guide">
          <div class="k">Reference</div>
          <div class="t">Guide &amp; fuel</div>
          <div class="d">Principles, shoulder rules, how to progress, nutrition, conditioning.</div>
        </button>
      </div>
      <div class="foot"><b>Start lighter than you think.</b> The first weeks are about showing up four times a week and grooving the movements. Everything is saved on this device.</div>
    </div>`

  appEl.querySelectorAll('.daycard').forEach(el =>
    el.addEventListener('click', () => nav('day', el.dataset.day)))
  appEl.querySelector('[data-go="guide"]').addEventListener('click', () => nav('guide'))
}

function loadTag(e) {
  if (e.during) return `<span class="ex-load num">${esc(e.s)} <span>x</span> ${esc(e.r)}</span>`
  return `<span class="ex-load num">${esc(e.s)} <span>x</span> ${esc(e.r)}</span>`
}

function renderDay() {
  const d = DAYS[active]
  const list = flat(active)
  const checks = store.checks[active] || {}
  const cur = store.cur[active] || {}
  const last = store.last[active] || {}

  let i = 0
  const blocksHtml = d.blocks.map(b => {
    const rows = []
    for (const e of b.ex) { rows.push(exRow(e, i, checks, cur, last, false)); i++ }
    if (b.during) { rows.push(exRow({ ...b.during, g: null }, i, checks, cur, last, true)); i++ }
    return `<div class="block ${b.opt ? 'opt' : ''}">
      <div class="block-head"><span class="block-key">${esc(b.key)}</span><span class="block-kind">${esc(b.kind)}</span></div>
      ${rows.join('')}
    </div>`
  }).join('')

  appEl.innerHTML = `
    <div class="app">
      <div class="topbar">
        <button class="bar-btn" data-back><span class="chev">&lsaquo;</span> Week</button>
        <div class="grow"></div>
        <button class="bar-btn accent" data-finish>Finish</button>
      </div>
      <div class="day-hd">
        <h2>${esc(d.title)}</h2>
        <div class="sub">${esc(d.sub)}</div>
        <div class="meta">
          <span class="pill amber">${esc(d.min)} on the floor</span>
          <span class="pill"><b>${list.length}</b> movements</span>
        </div>
      </div>
      ${blocksHtml}
      <div class="finish">
        <button class="btn" data-finish>Finish workout</button>
        <div class="hint">Saves your logged weights as the numbers to beat next ${esc(d.title)}, and clears the checkmarks.</div>
        <button class="btn ghost" data-reset>Reset without saving</button>
      </div>
    </div>`

  appEl.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', () => nav('home')))
  appEl.querySelectorAll('[data-finish]').forEach(el => el.addEventListener('click', finishDay))
  appEl.querySelector('[data-reset]').addEventListener('click', resetDay)

  appEl.querySelectorAll('.ex-tap').forEach(el => el.addEventListener('click', () => {
    const idx = el.dataset.idx
    const c = (store.checks[active] ||= {})
    const now = !c[idx]
    if (now) c[idx] = 1; else delete c[idx]
    save()
    const ex = el.closest('.ex')
    ex.classList.toggle('done', now)
    el.setAttribute('aria-pressed', String(now))
  }))

  appEl.querySelectorAll('.loginput').forEach(el => el.addEventListener('input', () => {
    const idx = el.dataset.idx
    const cc = (store.cur[active] ||= {})
    const v = el.value.trim()
    if (v) cc[idx] = v; else delete cc[idx]
    save()
  }))
}

function exRow(e, idx, checks, cur, last, during) {
  const done = !!checks[idx]
  const g = during
    ? `<span class="ex-g rest-tag">During rest</span>`
    : (e.g ? `<span class="ex-g">${esc(e.g)}</span>` : '')
  const lastVal = last[idx]
  const curVal = cur[idx] || ''
  return `<div class="ex ${done ? 'done' : ''} ${during ? 'during' : ''}" data-idx="${idx}">
    <button class="ex-tap" data-idx="${idx}" aria-pressed="${done}">
      <span class="tick"></span>
      <span class="ex-body">
        <span class="ex-top">${g}<span class="ex-name">${esc(e.n)}</span></span>
        ${e.note ? `<span class="ex-note">${esc(e.note)}</span>` : ''}
      </span>
    </button>
    ${loadTag(e)}
    <div class="logline">
      <span class="loglast">${lastVal ? `last <b>${esc(lastVal)}</b>` : 'log'}</span>
      <input class="loginput" data-idx="${idx}" type="text" inputmode="text" autocomplete="off"
             placeholder="${lastVal ? esc(lastVal) : 'weight x reps'}" value="${esc(curVal)}" />
    </div>
  </div>`
}

function finishDay() {
  const id = active
  const cur = store.cur[id] || {}
  const last = (store.last[id] ||= {})
  for (const k of Object.keys(cur)) if (cur[k]) last[k] = cur[k]
  delete store.checks[id]
  delete store.cur[id]
  store.lastFinished = id
  save()
  nav('home')
}

function resetDay() {
  delete store.checks[active]
  delete store.cur[active]
  save()
  render()
}

/* ---------------- guide ---------------- */
function renderGuide() {
  const cond = [
    ['Dose', '<b>2-3x / week, ~15-20 min</b>, on non-lifting days or after a lift (never before). Keep it genuinely easy - it should not leave you too sore to train.'],
    ['Base', '<b>Zone 2, conversational pace</b> - you can talk in full sentences. The pool swim or water jog is the standout low-impact option and gives the shoulder a full break. Incline walk, bike, or elliptical also work.'],
    ['Hard', '<b>Intervals, once a week at most.</b> Swap one zone-2 session for 6-10 rounds of ~20-30s harder / ~60-90s easy on the bike or in the pool. A garnish, not the main dish.'],
    ['Note', '<b>Favor the pool, bike, and incline walk</b> over anything that loads the arms overhead. If freestyle bugs the shoulder, switch to flutter-kick with a board.'],
  ]
  appEl.innerHTML = `
    <div class="app">
      <div class="topbar">
        <button class="bar-btn" data-back><span class="chev">&lsaquo;</span> Week</button>
        <div class="grow"></div>
        <span class="bar-title">Guide</span>
      </div>

      <div class="sec-head"><span class="idx">00</span><h3>The two levers</h3></div>
      <div class="levers">
        <div class="lever"><div class="k">The gym</div><h4>Progressive overload</h4><p>Lift hard, add weight or reps over time. The signal that tells your body to keep the muscle - and build more.</p></div>
        <div class="lever"><div class="k">The kitchen</div><h4>Slight deficit, high protein</h4><p>Fat loss is decided here, not on the treadmill. Eat a little under maintenance, keep protein high, fat comes off while muscle stays.</p></div>
      </div>

      <div class="sec-head"><span class="idx">01</span><h3>How the hour works</h3></div>
      <div class="note-card">
        <p class="lead"><b>Supersets beat the clock.</b> Movements share a letter (A1 / A2) - do a set of A1, ~60-90s rest, a set of A2, repeat. One muscle recovers while its partner works.</p>
        <div class="timemap">
          <span class="tm">Upper A <b>~44m</b></span><span class="tm">Lower A <b>~43m</b></span><span class="tm">Upper B <b>~44m</b></span><span class="tm">Lower B <b>~43m</b></span>
        </div>
        <p class="lead" style="margin:0">Each includes a 5-min warm-up. On a busy floor, budget 45-48. Run long? Cut the Upper A arm pair (D) first. The heavy lower-day lift is straight sets with core folded into the rest, so core never gets skipped.</p>
      </div>

      <div class="sec-head"><span class="idx">02</span><h3>Shoulder rules</h3></div>
      <div class="callout">
        <div class="k">Every session</div>
        <p><b>Press to controlled depth, not a deep stretch</b> (elbows to torso level, no lower). <b>Raises and overhead work stay under the painful arc.</b> If a movement is sharp pain rather than muscle fatigue, stop and use the pec-deck / seated-machine-press fallbacks. This manages around a sensitive shoulder - it does not replace a clinician's look.</p>
      </div>

      <div class="sec-head"><span class="idx">03</span><h3>Fuel</h3></div>
      <div class="note-card"><div class="rows">
        <div class="row"><span class="lead">01</span><span class="txt"><b>Slight deficit.</b> <span class="m">~250-500 kcal under maintenance - or maintenance while you are new, since beginners recomp well. Do not crash it.</span></span></div>
        <div class="row"><span class="lead">02</span><span class="txt"><b>Protein first.</b> <span class="m">~0.8-1 g per lb of bodyweight, every day. It is what protects muscle in a deficit.</span></span></div>
        <div class="row"><span class="lead">03</span><span class="txt"><b>Build the plate.</b> <span class="m">Protein + vegetables + a fist or two of carbs around training. Mostly whole foods.</span></span></div>
        <div class="row"><span class="lead">04</span><span class="txt"><b>Sleep 7-9 hours.</b> <span class="m">Muscle is built during recovery, not during the set.</span></span></div>
      </div></div>

      <div class="sec-head"><span class="idx">04</span><h3>How to progress</h3></div>
      <div class="note-card"><div class="rows">
        <div class="row"><span class="lead">1</span><span class="txt"><span class="m">Pick a weight you can hit the <b>bottom</b> of the rep range with clean form.</span></span></div>
        <div class="row"><span class="lead">2</span><span class="txt"><span class="m">Add reps each session until you hit the <b>top</b> of the range on every set, two sessions running.</span></span></div>
        <div class="row"><span class="lead">3</span><span class="txt"><span class="m">Then add the <b>smallest increment</b> and drop back to the bottom.</span></span></div>
        <div class="row"><span class="lead">4</span><span class="txt"><span class="m"><b>Log every set</b> - that is what the weight fields on each exercise are for. The log is the progression engine.</span></span></div>
      </div></div>

      <div class="sec-head"><span class="idx">05</span><h3>Reading the results</h3></div>
      <div class="note-card"><div class="rows">
        <div class="row"><span class="lead steel">Daily</span><span class="txt"><b>Bodyweight</b> <span class="m">- same time each morning. Watch the weekly average, ignore daily noise.</span></span></div>
        <div class="row"><span class="lead steel">Weekly</span><span class="txt"><b>Logbook</b> <span class="m">- your numbers should climb. The clearest sign it is working.</span></span></div>
        <div class="row"><span class="lead steel">Monthly</span><span class="txt"><b>Photos</b> <span class="m">- one set every 4 weeks, same spot and light.</span></span></div>
        <div class="row"><span class="lead steel">8-12 wks</span><span class="txt"><b>The verdict.</b> <span class="m">Strength up while weight holds or slowly drops = recomposition is happening.</span></span></div>
      </div></div>

      <div class="sec-head"><span class="idx">06</span><h3>Conditioning</h3></div>
      <div class="note-card"><div class="rows">
        ${cond.map(([l, t]) => `<div class="row"><span class="lead steel" style="width:56px">${l}</span><span class="txt">${t}</span></div>`).join('')}
      </div></div>

      <div class="foot"><b>Base Block.</b> When strength stops climbing for a couple of weeks, it is time to rebuild the block - just ask.</div>
    </div>`

  appEl.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', () => nav('home')))
}

render()

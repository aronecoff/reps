// JARVIS bridge — watch iMessage, run Claude Code on the Reps repo, reply.
//
// Flow: you text "reps: <what to change>" from your phone to the Apple ID this
// Mac is signed into. This polls the Messages database, and when a new text from
// YOUR handle starts with the trigger word, it runs headless Claude Code in the
// repo (edit -> build -> commit -> push, which auto-deploys), then texts you back
// a one-line summary.
//
// No npm deps: reads chat.db via the built-in `sqlite3` CLI (read-only) and
// sends replies via `osascript` (AppleScript). Requires, on THIS Mac:
//   - Full Disk Access for whatever runs this (Terminal, or `node` under launchd)
//   - Automation permission for Messages (granted on first send)
//   - `claude` and `git`/`gh` on PATH, authed, with the repo cloned
//
// Modes:
//   node watch.mjs            run the bridge (default)
//   node watch.mjs --selftest print the last few parsed messages and exit (prove
//                             reading works BEFORE arming the agent — no edits)
//   node watch.mjs --reply-test  send yourself one test text and exit
import { execFile, execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CHAT_DB = join(homedir(), 'Library', 'Messages', 'chat.db')
const STATE = join(HERE, '.state.json')
const MODE = process.argv[2] || ''

// ---- config ----
const defaults = { trigger: 'reps:', model: 'haiku', budgetUsd: 0.3, pollSeconds: 4, repo: join(HERE, '..') }
let cfg = { ...defaults }
const cfgPath = join(HERE, 'config.json')
if (existsSync(cfgPath)) cfg = { ...defaults, ...JSON.parse(readFileSync(cfgPath, 'utf8')) }
else if (MODE !== '--selftest') { console.error('Missing bridge/config.json — copy config.example.json to config.json and fill it in.'); process.exit(1) }

const TRIGGER = String(cfg.trigger).toLowerCase()
const HANDLE = cfg.handle          // your iMessage address exactly as it appears (e.g. "+15551234567" or "you@icloud.com")
// Empty/omitted repo -> the repo this bridge lives in (the clone). So config
// doesn't need a machine-specific absolute path.
const REPO = (cfg.repo && String(cfg.repo).trim()) ? cfg.repo : join(HERE, '..')
const POLL = Math.max(2, cfg.pollSeconds) * 1000

// ---- sqlite (read-only) ----
function sqlite(query) {
  const out = execFileSync('sqlite3', ['-json', '-readonly', CHAT_DB, query], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 })
  return out.trim() ? JSON.parse(out) : []
}

// Modern macOS often stores the body in `attributedBody` (an encoded blob) with
// message.text NULL. We don't need to fully decode it: we pull the printable
// runs and take the one containing the trigger. Robust to blob-format quirks.
function extractText(row) {
  if (row.text && row.text.trim()) return row.text.trim()
  if (!row.body_hex) return ''
  const buf = Buffer.from(row.body_hex, 'hex')
  const runs = []
  let cur = []
  for (const b of buf) {
    if (b === 0x0a || b === 0x09 || (b >= 0x20 && b !== 0x7f)) cur.push(b)
    else { if (cur.length >= 2) runs.push(Buffer.from(cur).toString('utf8')); cur = [] }
  }
  if (cur.length >= 2) runs.push(Buffer.from(cur).toString('utf8'))
  const hit = runs.find(r => r.toLowerCase().includes(TRIGGER))
  if (hit) return hit.trim()
  return (runs.sort((a, b) => b.length - a.length)[0] || '').trim()
}

const RECENT = `SELECT m.ROWID AS rowid, m.is_from_me AS fromMe, h.id AS sender,
                       m.text AS text, hex(m.attributedBody) AS body_hex
                FROM message m LEFT JOIN handle h ON m.handle_id = h.ROWID`

// ---- reply via AppleScript ----
function reply(text) {
  if (!HANDLE) { console.error('no handle configured; cannot reply'); return }
  const msg = (text.length > 600 ? text.slice(0, 600) + '…' : text)
  try {
    execFileSync('osascript', [join(HERE, 'reply.applescript'), HANDLE, msg], { timeout: 20000 })
  } catch (e) {
    console.error('reply failed (grant Messages Automation permission?):', e.message)
  }
}

// ---- headless Claude Code ----
const SYSTEM = [
  'You are editing the "Reps" web app in response to a text message from its owner, Aron.',
  'Make the minimal change he asked for. Then run `npm run build` to confirm it still compiles.',
  'Then stage everything, commit with a short message prefixed "iMessage:", and `git push`.',
  'If the request is unclear, unsafe, or would break the build, make NO changes and explain briefly instead of guessing.',
  'Always end your final message with one line starting "SUMMARY: " — a single sentence on what you changed (or why you did not).',
].join(' ')

function runClaude(userText, done) {
  const args = [
    '-p', userText,
    '--model', cfg.model,
    '--permission-mode', 'bypassPermissions',
    '--disallowedTools', 'WebFetch WebSearch Bash(rm:*) Bash(sudo:*) Bash(git checkout:*) Bash(git clean:*) Bash(git reset:*)',
    '--max-budget-usd', String(cfg.budgetUsd),
    '--append-system-prompt', SYSTEM,
    '--output-format', 'json',
  ]
  execFile('claude', args, { cwd: REPO, timeout: 5 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
    let summary
    try {
      const obj = JSON.parse(stdout)
      const result = obj.result || obj.text || ''
      const m = /SUMMARY:\s*(.+)/i.exec(result)
      summary = m ? m[1].trim() : (result.trim().slice(0, 240) || 'Done.')
      if (obj.is_error) summary = 'Ran into an error: ' + summary
    } catch {
      summary = 'Error: ' + String(stderr || (err && err.message) || stdout || 'unknown').slice(0, 200)
    }
    done(summary)
  })
}

// ---- one-at-a-time queue ----
let busy = false
const queue = []
function enqueue(prompt) { queue.push(prompt); drain() }
function drain() {
  if (busy || !queue.length) return
  busy = true
  const prompt = queue.shift()
  console.log(`[${new Date().toISOString()}] running: ${prompt}`)
  runClaude(prompt, (summary) => {
    console.log('  ->', summary)
    reply(summary + '  (live in ~1 min)')
    busy = false
    drain()
  })
}

// ---- modes ----
if (MODE === '--selftest') {
  const rows = sqlite(`${RECENT} ORDER BY m.ROWID DESC LIMIT 8`)
  console.log(`Last ${rows.length} messages (newest first). Confirm your texts show up with the right sender + text:\n`)
  for (const r of rows) {
    console.log(`  #${r.rowid}  fromMe=${r.fromMe}  sender=${r.sender || '(me)'}\n     text: "${extractText(r)}"`)
  }
  console.log(`\nTrigger is "${cfg.trigger}". Set "handle" in config.json to the sender string shown above for YOUR phone.`)
  process.exit(0)
}
if (MODE === '--reply-test') {
  reply('JARVIS bridge: replies are working.')
  console.log('Sent a test reply to', HANDLE || '(no handle set!)')
  process.exit(0)
}

// ---- live ----
function getState() { try { return JSON.parse(readFileSync(STATE, 'utf8')) } catch { return {} } }
let { lastRowId } = getState()
if (lastRowId == null) {
  const r = sqlite('SELECT MAX(ROWID) AS maxid FROM message')[0] || {}
  lastRowId = r.maxid || 0
  writeFileSync(STATE, JSON.stringify({ lastRowId }))
  console.log('Initialized at ROWID', lastRowId, '(older history is ignored).')
}

function poll() {
  let rows
  try {
    rows = sqlite(`${RECENT} WHERE m.ROWID > ${lastRowId} AND m.is_from_me = 0 ORDER BY m.ROWID ASC`)
  } catch (e) { console.error('db read error:', e.message); return }
  for (const row of rows) {
    lastRowId = Math.max(lastRowId, row.rowid)
    if (HANDLE && row.sender !== HANDLE) continue
    const text = extractText(row)
    const at = text.toLowerCase().indexOf(TRIGGER)
    if (at === -1) continue
    const prompt = text.slice(at + TRIGGER.length).trim()
    if (prompt) enqueue(prompt)
  }
  writeFileSync(STATE, JSON.stringify({ lastRowId }))
}

console.log(`JARVIS bridge watching ${CHAT_DB}\n  trigger="${cfg.trigger}"  handle="${HANDLE || '(any!)'}"  model=${cfg.model}  repo=${REPO}`)
setInterval(poll, POLL)
poll()

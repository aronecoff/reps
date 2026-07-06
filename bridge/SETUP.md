# JARVIS bridge — setup (do this on the always-on Mac)

Text `reps: <change>` from your phone → this Mac edits the Reps app, builds,
pushes, and deploys → you get a text back. This is v1: **Reps only**, **auto-ship**.

## Safety model (read once)
A text can now run code on this Mac. It's fenced in:
- Only messages from **your** handle, only if they start with **`reps:`**.
- Runs the cheap **Haiku** model with a hard **$0.30/run** budget cap.
- Hard-denied: `rm`, `sudo`, `git reset/checkout/clean`, force-push, reading `.env`.
- Scoped to the one repo. It edits, builds to confirm it compiles, commits, pushes.

## The Apple ID choice (important)
The bridge only sees your texts as "incoming" if they arrive from a **different**
Apple ID than the one it's reading. Two options:
- **Recommended:** sign this Mac's Messages into a **dedicated "JARVIS" Apple ID**,
  and text *that* address from your phone. Clean separation.
- Or sign into your own ID and text your own number — then in `watch.mjs` you'd
  flip the filter to `is_from_me = 1`. (Ask me and I'll adjust it.)

## 1. Tools (on the JARVIS Mac)
```bash
# Node 18+, git, GitHub CLI, Claude Code
node -v && git --version
brew install gh            # if missing
gh auth login              # so it can push
claude --version           # install Claude Code if missing; then:
claude   # sign in once (or set ANTHROPIC_API_KEY), then /exit
```

## 2. Get the repo
```bash
mkdir -p ~/code && cd ~/code
git clone https://github.com/aronecoff/reps.git
cd reps && npm install            # so `npm run build` works during edits
```

## 3. Configure the bridge
```bash
cd ~/code/reps/bridge
cp config.example.json config.json
```
Edit `config.json`:
- `repo`: `/Users/<you>/code/reps` (absolute path to the clone)
- `handle`: leave the placeholder for now — step 4 tells you the exact string.

## 4. Prove it can READ your texts (no edits happen)
Grant **Full Disk Access** to **Terminal** first: System Settings → Privacy &
Security → Full Disk Access → add Terminal. Then:
```bash
npm run selftest
```
Send yourself/JARVIS a text, run it again. It prints recent messages with a
`sender=` string. Put that exact string in `config.json` → `handle`. Re-run
`npm run selftest` and confirm your `reps: hello` shows up with the right text.

> If the text shows up garbled, tell me — that's the one blob-decoding edge case
> and I'll harden the parser (or we switch reading to BlueBubbles).

## 5. Prove it can SEND
```bash
npm run reply-test
```
macOS will ask to allow controlling Messages — **Allow**. You should get a text
"JARVIS bridge: replies are working."

## 6. Live test (in Terminal, watch it work)
```bash
npm start
```
From your phone: `reps: change the home headline to "Let's go."`
Watch the log: it runs Claude, pushes, and texts you a summary. Confirm the
change is live at https://aronecoff.github.io/reps/ after ~1 min. `Ctrl-C` to stop.

## 7. Make it always-on
```bash
bash install.sh                    # installs a launchd service, starts it
tail -f bridge.log                 # watch it
# then give `node` Full Disk Access too (Settings > Full Disk Access > add the
# node binary shown by `which node`), and: bash install.sh   (re-run to restart)
```
Stop/remove later: `bash install.sh stop`.

## Notes
- **Cost:** Haiku + `$0.30`/run cap. ~$0.05–0.30 per edit. Bump `budgetUsd` in
  config for bigger jobs.
- **It won't guess:** unclear/unsafe requests get a "didn't do it because…" text.
- **Widen scope later:** point `repo` elsewhere, or ask me to make it multi-repo.
- **First run rarely goes 100% clean** (permissions, the exact AppleScript send
  form, or the handle string). Text me the log line that breaks and we fix it.

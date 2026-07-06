#!/bin/bash
# Install the JARVIS bridge as an always-on background service (launchd) on this
# Mac. Run AFTER you've: created config.json, confirmed `npm run selftest` shows
# your texts, and confirmed `npm run reply-test` sends you a message.
#
#   bash install.sh          install + start the service
#   bash install.sh stop     stop + remove the service
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
NODE="$(command -v node)"
LABEL="com.aronecoff.jarvis-bridge"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ "$1" = "stop" ]; then
  launchctl unload "$PLIST" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Stopped and removed $LABEL."
  exit 0
fi

if [ -z "$NODE" ]; then echo "node not found on PATH"; exit 1; fi
if [ ! -f "$DIR/config.json" ]; then echo "Create $DIR/config.json first (copy config.example.json)."; exit 1; fi

mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>$DIR/watch.mjs</string>
  </array>
  <key>WorkingDirectory</key><string>$DIR</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$DIR/bridge.log</string>
  <key>StandardErrorPath</key><string>$DIR/bridge.log</string>
</dict>
</plist>
PLISTEOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "Installed and started $LABEL."
echo "Logs: tail -f $DIR/bridge.log"
echo
echo "IMPORTANT: give '$NODE' Full Disk Access (System Settings > Privacy &"
echo "Security > Full Disk Access) or it can't read Messages. Then: launchctl kickstart -k gui/\$(id -u)/$LABEL"

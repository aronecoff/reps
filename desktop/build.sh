#!/bin/bash
# Build the native macOS Reps.app (WKWebView wrapper, no Chrome) into
# ~/Applications and refresh the Dock. Idempotent: creates the bundle,
# Info.plist, and icon on first run; recompiles the binary on later runs.
#
# Icon: run `npm run icons` first (generates desktop/Reps.iconset), then this
# script turns it into Reps.icns. Re-run after editing desktop/Reps.swift.
set -e

APP="$HOME/Applications/Reps.app"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONTENTS="$APP/Contents"

mkdir -p "$CONTENTS/MacOS" "$CONTENTS/Resources"

# Info.plist (rewritten every run so metadata stays in sync)
cat > "$CONTENTS/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Reps</string>
  <key>CFBundleDisplayName</key><string>Reps</string>
  <key>CFBundleIdentifier</key><string>com.aronecoff.reps</string>
  <key>CFBundleExecutable</key><string>Reps</string>
  <key>CFBundleIconFile</key><string>Reps</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>0.1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>12.0</string>
  <key>LSApplicationCategoryType</key><string>public.app-category.healthcare-fitness</string>
  <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

# Icon: iconset -> icns (only if the iconset exists)
if [ -d "$DIR/desktop/Reps.iconset" ]; then
  iconutil -c icns "$DIR/desktop/Reps.iconset" -o "$CONTENTS/Resources/Reps.icns"
elif [ ! -f "$CONTENTS/Resources/Reps.icns" ]; then
  echo "warn: no icon yet. Run 'npm run icons' then re-run this script for a Dock icon."
fi

# Compile the binary
swiftc -O -o "$CONTENTS/MacOS/Reps" "$DIR/desktop/Reps.swift" \
  -framework Cocoa -framework WebKit

touch "$APP"
killall Dock 2>/dev/null || true
echo "Built native app -> $APP"

// Rasterize public/icon.svg into the PNGs the PWA manifest and the macOS Dock
// app need. Web PNGs go to public/; the macOS .iconset goes to desktop/ for
// iconutil to turn into Reps.icns. Re-run after editing the icon: npm run icons
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = join(root, 'public', 'icon.svg')

async function png(size, out) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(out)
  console.log('  •', out.replace(root + '/', ''), `${size}x${size}`)
}

// Web / PWA icons
const pub = join(root, 'public')
await png(192, join(pub, 'pwa-192.png'))
await png(512, join(pub, 'pwa-512.png'))
await png(512, join(pub, 'maskable-512.png'))
await png(180, join(pub, 'apple-touch-icon.png'))

// macOS .iconset — the sizes iconutil expects, incl. @2x retina variants
const iconset = join(root, 'desktop', 'Reps.iconset')
await mkdir(iconset, { recursive: true })
const macSizes = [16, 32, 64, 128, 256, 512]
for (const s of macSizes) {
  await png(s, join(iconset, `icon_${s}x${s}.png`))
  await png(s * 2, join(iconset, `icon_${s}x${s}@2x.png`))
}

console.log('Icons generated. Run: iconutil -c icns desktop/Reps.iconset -o desktop/Reps.icns')

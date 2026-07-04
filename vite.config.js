import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Deployed to GitHub Pages at aronecoff.github.io/reps/, so everything lives
// under the /reps/ base path. (For a root-domain host, set base to '/'.)
const base = '/reps/'

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Reps — Training',
        short_name: 'Reps',
        description: 'Your training block, logged rep by rep. Offline-first, on-device.',
        theme_color: '#111317',
        background_color: '#111317',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})

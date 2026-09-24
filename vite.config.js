import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Never serve a stale app: HTML always comes from the network (NetworkFirst, cache
      // only as an offline fallback), and a new service worker takes over immediately and
      // deletes the old precache. Without this the old bundle kept running after deploys.
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // pages only - never the app downloads (APK) in public/downloads
            urlPattern: ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/downloads/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'pages', networkTimeoutSeconds: 4 },
          },
        ],
      },
      // Installable on Android, Windows, macOS, ChromeOS (Chrome/Edge "Install") and
      // iPhone/iPad (Safari "Add to Home Screen" - uses the apple-touch-icon in index.html).
      // Icons come from scripts/generate-icons.mjs.
      manifest: {
        id: '/',
        name: 'Instagram',
        short_name: 'Instagram',
        description: 'Share photos, videos, stories and reels, and chat with friends.',
        start_url: '/?source=app',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        theme_color: '#000000',
        background_color: '#000000',
        categories: ['social', 'photo'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // long-press the app icon on Android / right-click in the Windows taskbar
        shortcuts: [
          { name: 'Messages', url: '/messages', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Reels', url: '/reels', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Notifications', url: '/notifications', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
    }),
  ],
  server: {
    port: 7005, // Replace 4000 with your desired port
  },
  test: {//This is how we setup the tests
    environment: 'jsdom',
    setupFiles: './setupTests.js',
  }
})
// Regular Colors
// console.log('\x1b[31m%s\x1b[0m', 'This is red');       // Red text
// console.log('\x1b[32m%s\x1b[0m', 'This is green');     // Green text
// console.log('\x1b[33m%s\x1b[0m', 'This is yellow');    // Yellow text
// console.log('\x1b[34m%s\x1b[0m', 'This is blue');      // Blue text
// console.log('\x1b[35m%s\x1b[0m', 'This is magenta');   // Magenta text
// console.log('\x1b[36m%s\x1b[0m', 'This is cyan');      // Cyan text
// console.log('\x1b[37m%s\x1b[0m', 'This is white');     // White text

// // Background Colors
// console.log('\x1b[41m%s\x1b[0m', 'This has red background'); // Red background
// console.log('\x1b[42m%s\x1b[0m', 'This has green background'); // Green background

// // Bold and Underline
// console.log('\x1b[1m%s\x1b[0m', 'This is bold');        // Bold text
// console.log('\x1b[4m%s\x1b[0m', 'This is underlined');  // Underlined text

// // Reset Style
// console.log('\x1b[0m%s\x1b[0m', 'This is normal again'); // Reset style


//npm install @chakra-ui/icons @chakra-ui/react
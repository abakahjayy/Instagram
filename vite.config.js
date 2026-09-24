import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Amazon React',
        short_name: 'Amazon',
        description: 'Your app description',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
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
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      // Use the existing sw.ts file
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'sw.ts',
      devOptions: {
        enabled: true
      }
    ,
      manifest: {
        name: 'Pace Tracker',
        short_name: 'Pace',
        description: 'A simple app to track the average time between button presses.',
        theme_color: '#007bff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }    })
  ]
})
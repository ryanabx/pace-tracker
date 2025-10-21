import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Use the existing sw.ts file
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'sw.ts',
      devOptions: {
        enabled: true
      }
    })
  ]
})
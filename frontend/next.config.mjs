import withPWA from 'next-pwa'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const defaultCache = require('next-pwa/cache')

const pwaConfig = withPWA({
  dest: 'public',
  // Auto-injection targets the Pages Router and does not reliably fire in
  // the App Router — we register /sw.js manually instead, see
  // components/ServiceWorkerRegister.js (included in app/layout.js).
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // AI model files (model.json + .bin weight shards) — must be cached
    // explicitly so offline disease detection actually works once a crop
    // model has been loaded at least once while online.
    {
      urlPattern: /^\/models\/.*\.(?:json|bin)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'govi-nena-ai-models',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year — models rarely change
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Keep next-pwa's sensible defaults for everything else (fonts, JS, images, API calls)
    ...defaultCache,
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}
}

export default pwaConfig(nextConfig)

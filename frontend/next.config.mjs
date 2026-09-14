import withPWA from 'next-pwa'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const defaultCache = require('next-pwa/cache')

const pwaConfig = withPWA({
  dest: 'public',
  // Auto-injection targets the Pages Router and does not reliably fire in

  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // /scan?crop=paddy, /scan?crop=tomato etc. must all resolve to the same

  ignoreURLParametersMatching: [/^crop$/],
  runtimeCaching: [
    // AI model files (model.json + .bin weight shards) — must be cached

    {
      urlPattern: ({ url }) =>
        url.pathname.startsWith('/models/') &&
        (url.pathname.endsWith('.json') || url.pathname.endsWith('.bin')),
      handler: 'CacheFirst',
      options: {
        cacheName: 'govi-nena-ai-models',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, 
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  
    ...defaultCache,
  ],
})


const nextConfig = {
  experimental: {
  cpus: 2,
},
  turbopack: {}
}

export default pwaConfig(nextConfig)

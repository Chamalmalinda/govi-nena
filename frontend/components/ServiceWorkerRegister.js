'use client';

import { useEffect } from 'react';

// next-pwa's auto-register mechanism targets the Pages Router (_app.js) and
// does not reliably inject into the App Router. This component registers
// the generated /sw.js manually so offline caching (models, treatments,
// pages) actually activates in production builds.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ Service worker registered:', reg.scope);
      })
      .catch((err) => {
        console.error('❌ Service worker registration failed:', err);
      });
  }, []);

  return null;
}

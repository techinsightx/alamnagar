// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Alamnagar - आलमनगर',
    short_name: 'Alamnagar',
    description: 'आलमनगर: जड़ों से जुड़ा, मिथिला की धरती का गौरव। हमारा डिजिटल चौपाल।',
    start_url: '/',
    display: 'standalone', // App jaisa feel dene ke liye (browser bar hide ho jayega)
    background_color: '#fafaf9', // stone-50
    theme_color: '#fafaf9',
    orientation: 'portrait-primary',
    categories: ['community', 'lifestyle', 'local business'],
    lang: 'hi-IN',
    icons: [
      // ✅ Icon for regular display (bookmarks, tab switcher, etc.)
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // ✅ Icon for Android adaptive icons & splash screens (maskable)
      {
        src: '/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
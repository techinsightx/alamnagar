import type { MetadataRoute } from 'next'

const BASE_URL = 'https://alamnagar.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ============================================
      // 🌐 ALL SEARCH ENGINES (Google, Bing, etc.)
      // ============================================
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/gallery',
          '/community',
          '/marketplace',
          '/contact',
          '/spotlights/*',
          '/profile/*',
          // ✅ Static assets (SEO ke liye zaroori)
          '/*.css$',
          '/*.js$',
          '/*.png$',
          '/*.jpg$',
          '/*.jpeg$',
          '/*.gif$',
          '/*.svg$',
          '/*.webp$',
          '/*.ico$',
          '/*.woff$',
          '/*.woff2$',
          '/*.ttf$',
          '/*.mp4$',
          '/*.webm$',
        ],
        disallow: [
          // 🔒 Admin & Auth
          '/admin',
          '/admin/',
          '/api/',
          '/auth',
          '/auth/',
          '/login',
          '/signup',
          '/register',
          '/logout',

          // 🔒 User private areas
          '/dashboard',
          '/dashboard/',
          '/account',
          '/account/',
          '/settings',
          '/settings/',
          '/profile/settings',
          '/profile/edit',
          '/profile/analytics',
          '/profile/billing',
          '/profile/notifications',

          // 🔒 Internal/Dev & Next.js internals
          '/private',
          '/private/',
          '/internal',
          '/internal/',
          '/tmp',
          '/tmp/',
          '/temp',
          '/temp/',
          '/cdn-cgi/',
          '/_next/',
          '/debug/',
          '/preview/',

          // 🚫 Tracking params (duplicate content prevention)
          '/*?utm_*',
          '/*?ref=*',
          '/*?gclid=*',
          '/*?fbclid=*',
          '/*?session=*',
          '/*?token=*',
          '/*?source=*',
          '/*?campaign=*',
          '/*?medium=*',

          // 🚫 Thin content pages
          '/search?*',
          '/search/?*',
          '/tags?*',
          '/embed/*',
        ],
      },

      // ============================================
      // 🔍 GOOGLE-SPECIFIC BOTS (Explicitly allowed)
      // ============================================
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },
      { userAgent: 'Googlebot-Video', allow: '/' },
      { userAgent: 'Googlebot-News', allow: '/' },
      { userAgent: 'Google-Read-Aloud', allow: '/' },
      { userAgent: 'AdsBot-Google', allow: '/' },
      { userAgent: 'AdsBot-Google-Mobile', allow: '/' },
      { userAgent: 'APIs-Google', allow: '/' },
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: 'FeedFetcher-Google', allow: '/' },

      // ============================================
      // 🤖 AI SEARCH BOTS (Allow — traffic source)
      // ============================================
      { userAgent: 'GPTBot', allow: '/' },                 // OpenAI
      { userAgent: 'ChatGPT-User', allow: '/' },           // ChatGPT Browse
      { userAgent: 'OAI-SearchBot', allow: '/' },          // OpenAI Search
      { userAgent: 'ClaudeBot', allow: '/' },              // Anthropic
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },          // Perplexity
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'YouBot', allow: '/' },                 // You.com
      { userAgent: 'cohere-ai', allow: '/' },              // Cohere
      { userAgent: 'Applebot', allow: '/' },               // Siri/Apple
      { userAgent: 'Google-Extended', allow: '/' },        // Google AI

      // ============================================
      // 🛑 BAD/SPAM BOTS & AI TRAINING (Always block)
      // ============================================
      { userAgent: 'AhrefsBot', disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
      { userAgent: 'MJ12bot', disallow: '/' },
      { userAgent: 'DotBot', disallow: '/' },
      { userAgent: 'PetalBot', disallow: '/' },            // Huawei spam
      { userAgent: 'DataForSeoBot', disallow: '/' },
      { userAgent: 'magpie-crawler', disallow: '/' },
      { userAgent: 'AwarioRadar', disallow: '/' },
      { userAgent: 'BLEXBot', disallow: '/' },
      { userAgent: 'Buck', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },               // Common Crawl (AI dataset)
      { userAgent: 'ChatGPT-Scraper', disallow: '/' },
      { userAgent: 'scrapy', disallow: '/' },
      { userAgent: 'Go-http-client', disallow: '/' },
      { userAgent: 'Python-urllib', disallow: '/' },
      { userAgent: 'wget', disallow: '/' },
      { userAgent: 'curl', disallow: '/' },
      { userAgent: 'Nimbostratus-Bot', disallow: '/' },
      { userAgent: 'Bytespider', disallow: '/' },          // TikTok AI
      { userAgent: 'meta-externalagent', disallow: '/' },  // Meta AI
      { userAgent: 'anthropic-ai', disallow: '/' },        // Anthropic training
      { userAgent: 'Diffbot', disallow: '/' },
      { userAgent: 'ImagesiftBot', disallow: '/' },
      { userAgent: 'Timpibot', disallow: '/' },
    ],
    
    // ✅ Sitemap URL pointing to alamnagar.in
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
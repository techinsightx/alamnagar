import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Enable compression for faster page loads (Gzip/Brotli)
  compress: true,
  
  // ✅ Hide "X-Powered-By: Next.js" header for security (attackers ko pata na chale)
  poweredByHeader: false,
  
  // ✅ React Strict Mode for better development experience
  reactStrictMode: true,
  
  // ✅ Image Optimization: Allow Cloudinary URLs (used in Gallery & Marketplace)
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats for 50% smaller sizes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // For About page hero images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google user profile photos
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase storage fallback
        pathname: '/**',
      },
    ],
    // Minimum cache time for optimized images (1 year for static assets)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // ✅ Advanced Security & PWA Headers
  async headers() {
    return [
      // 🔥 Service Worker Headers (Critical for PWA)
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate', // Always fetch fresh SW
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      // 🔥 Web App Manifest Headers
      {
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // Cache for 24 hours
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      // 🔥 Global Security Headers (Applied to all pages)
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent clickjacking attacks
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Privacy protection
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Disable unused APIs
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on', // Faster DNS resolution
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // Force HTTPS
          },
        ],
      },
      // 🔥 Static Assets: Long-term caching for performance
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year cache
          },
        ],
      },
      // 🔥 Public Folder Assets (Icons, Images)
      {
        source: '/(.*\\.(?:ico|png|jpg|jpeg|webp|svg|gif))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, must-revalidate', // 1 week cache
          },
        ],
      },
    ];
  },
  
  // ✅ Experimental Features for Maximum Performance
  experimental: {
    // Optimize CSS delivery
    optimizeCss: true,
    // Faster server components
    serverActions: {
      bodySizeLimit: '2mb', // Allow larger form submissions
    },
  },
  
  // ✅ Web Vitals Optimization
  // Automatically optimize for Core Web Vitals (LCP, FID, CLS)
  compiler: {
    // Remove console.log in production for smaller bundle size
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] } 
      : false,
  },
};

export default nextConfig;
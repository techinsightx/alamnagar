import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Enable compression for faster page loads (Gzip/Brotli)
  compress: true,
  
  // ✅ Hide "X-Powered-By: Next.js" header for security
  poweredByHeader: false,
  
  // ✅ React Strict Mode for better development experience
  reactStrictMode: true,
  
  // ✅ Image Optimization: Allow Cloudinary URLs and others
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
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
            value: 'public, max-age=0, must-revalidate',
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
            value: 'public, max-age=86400',
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
            value: 'DENY', 
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', 
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', 
          },
          // 🔥 FIXED: Ab Camera aur Microphone ALLOW hoga!
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self)', 
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on', 
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', 
          },
        ],
      },
      // 🔥 Static Assets: Long-term caching for performance
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', 
          },
        ],
      },
      // 🔥 Public Folder Assets (Icons, Images)
      {
        source: '/(.*\\.(?:ico|png|jpg|jpeg|webp|svg|gif))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, must-revalidate', 
          },
        ],
      },
    ];
  },
  
  // ✅ Experimental Features for Maximum Performance
  experimental: {
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: '2mb', 
    },
  },
  
  // ✅ Web Vitals Optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] } 
      : false,
  },
};

export default nextConfig;
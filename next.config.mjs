/** @type {import('next').NextConfig} */

import withPWAInit from "@ducanh2912/next-pwa";

const pwaConfig = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // runtimeCaching: [
  //   {
  //     urlPattern: /\/api\/auth\//,
  //     handler: "NetworkOnly",
  //     options: {
  //       backgroundSync: {
  //         name: "authQueue",
  //         options: {
  //           maxRetentionTime: 24 * 60, // 24 hours
  //         },
  //       },
  //     },
  //   },
  //   // Cache static assets
  //   {
  //     urlPattern: /\.(js|css|png|jpg|jpeg|svg|gif|ico|webp)$/,
  //     handler: "CacheFirst",
  //     options: {
  //       cacheName: "static-assets",
  //       expiration: {
  //         maxEntries: 200,
  //         maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
  //       },
  //     },
  //   },
  //   // Cache API responses
  //   {
  //     urlPattern: /^https?:\/\/api\./i,
  //     handler: "NetworkFirst",
  //     options: {
  //       cacheName: "api-cache",
  //       expiration: {
  //         maxEntries: 50,
  //         maxAgeSeconds: 60 * 60, // 1 hour
  //       },
  //       networkTimeoutSeconds: 10,
  //     },
  //   },
  // ],
};

const withPWA = withPWAInit(pwaConfig);

// Content Security Policy
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com https://*.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "frame-src 'self' https://accounts.google.com https://oauth.telegram.org",
      "connect-src 'self' https://accounts.google.com https://*.google.com https://play.google.com",
    ].join('; '),
  },
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
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  // reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.istockphoto.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "img.icons8.com" },
      { protocol: "https", hostname: "kaktarang.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" }, // For Google profile pictures
    ],
    minimumCacheTTL: 60,
  },

  // API route rewrites
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },


  // Security headers
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: securityHeaders,
  //     },
  //   ];
  // },

  // Environment variables
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3001",
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  },
};

// Compose the final config with PWA support
export default withPWA(nextConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable production optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    domains: [],
    formats: ["image/webp", "image/avif"],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      {
        source: "/api/track/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Output configuration for production
  output: "standalone",
};

module.exports = nextConfig;

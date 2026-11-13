/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ['192.168.31.151', '192.168.*', 'localhost:3000', 'localhost:3001'],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'reel-xpress.vercel.app',
          },
        ],
        destination: 'https://www.reelxpress.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'reelxpress-final.vercel.app',
          },
        ],
        destination: 'https://www.reelxpress.com/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';

    return [
      {
        // Cache static brand assets, thumbnails, fonts, and videos for 1 year
        source: '/(brand|thumbnails|assets|fonts)/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Security headers across all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          ...(isPreview
            ? [
                {
                  key: 'X-Robots-Tag',
                  value: 'noindex, nofollow',
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;

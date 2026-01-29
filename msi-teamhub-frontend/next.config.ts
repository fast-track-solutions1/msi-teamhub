import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Headers CORS pour autoriser les requêtes cross-origin
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization',
          },
        ],
      },
    ];
  },

  // ✅ Rewrites pour proxy les requêtes API
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
        },
      ],
    };
  },

  webpack: (config, { isServer }) => {
    return config;
  },
};

export default nextConfig;

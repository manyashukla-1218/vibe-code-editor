import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },

  // Strict mode off karo (WebContainer ke liye better)
  reactStrictMode: false,

  // Images ke liye
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

 
  webpack: (config, { isServer }) => {
    // Client-side ke liye fix
    if (!isServer) {
      config.output = {
        ...config.output,
        // Fix globalObject to prevent "self is not defined" error
        globalObject: 'typeof self !== "undefined" ? self : this',
      };

     
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          net: false,
          tls: false,
        },
      };
    }

    return config;
  },
};

export default nextConfig;
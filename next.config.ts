import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rapidtechpro.com',
      },
      {
        protocol: 'https',
        hostname: 'www.rapidtechpro.com',
      },
      {
        protocol: 'https',
        hostname: 'files.rapidtechpro.com',
      },
      {
        protocol: 'http',
        hostname: 'files.rapidtechpro.com',
      }
    ],
  },
};

export default nextConfig;

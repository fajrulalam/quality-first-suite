import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configure for Vercel deployment
  basePath: process.env.NODE_ENV === 'production' ? '/automate-failure-analysis' : ''
};

export default nextConfig;

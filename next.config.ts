import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove server-side features for static export
  basePath: process.env.NODE_ENV === 'production' ? '/automate-failure-analysis' : ''
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;

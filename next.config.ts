import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output is only for self-hosting.
  // On Vercel we keep the standard build output.
  output: process.env.VERCEL ? undefined : "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

export default nextConfig;

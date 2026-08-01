import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/ui"],
  experimental: {
    optimizePackageImports: ["@repo/ui"],
  },
};

export default nextConfig;

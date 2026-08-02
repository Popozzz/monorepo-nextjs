import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/i18n"],
  experimental: {
    optimizePackageImports: ["@repo/ui", "@repo/i18n"],
  },
};

export default withNextIntl(nextConfig);

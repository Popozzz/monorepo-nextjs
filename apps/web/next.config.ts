import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/ui",
    "@repo/i18n",
    "@repo/components",
    "@repo/layouts",
    "@repo/utils",
    "@repo/hooks",
  ],
  experimental: {
    optimizePackageImports: [
      "@repo/ui",
      "@repo/i18n",
      "@repo/components",
      "@repo/layouts",
      "@repo/utils",
      "@repo/hooks",
    ],
  },
};

export default withNextIntl(nextConfig);

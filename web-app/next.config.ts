import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/budget-consolidation-saas",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

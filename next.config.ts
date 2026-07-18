import type { NextConfig } from "next";

const basePath =
  process.env.BASE_PATH !== undefined ? process.env.BASE_PATH : "";

const nextConfig: NextConfig = {
  output: process.env.OUTPUT_MODE === "export" ? "export" : undefined,

  env: {
    NEXT_PUBLIC_TBANK_TERMINAL_KEY:
      process.env.NEXT_PUBLIC_TBANK_TERMINAL_KEY || "",
  },

  ...(basePath && {
    basePath,
    assetPrefix: basePath,
  }),

  ...(process.env.OUTPUT_MODE === "export" && {
    images: {
      unoptimized: true,
    },
  }),
  ...(process.env.NODE_ENV !== "production" && {
    allowedDevOrigins: ["*.*", "*.sourcecraft.dev", "*.sourcecraft.site"],
  }),

  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;

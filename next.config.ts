import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
    "pdf-parse",
    "@napi-rs/canvas",
  ],
  outputFileTracingIncludes: {
    "/api/upload-resume": ["node_modules/@napi-rs/canvas*/**/*"],
  },
};

export default nextConfig;

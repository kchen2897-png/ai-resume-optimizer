import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "pdf-parse",
    "@napi-rs/canvas",
  ],
  outputFileTracingIncludes: {
    "/api/upload-resume": [
      "node_modules/@napi-rs/canvas*/**/*",
      "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs",
    ],
  },
};

export default nextConfig;

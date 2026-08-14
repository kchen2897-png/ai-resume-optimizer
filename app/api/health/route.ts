import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const checks = {
    app: true,
    deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY?.trim()),
    pdfRendererConfigured:
      process.platform === "linux" ||
      process.platform === "win32" ||
      Boolean(process.env.CHROMIUM_LOCAL_EXEC_PATH?.trim()),
  };
  const healthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      service: "ai-resume-optimizer",
      checks,
      runtime: {
        node: process.version,
        platform: process.platform,
        environment: process.env.RAILWAY_ENVIRONMENT_NAME || "local",
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

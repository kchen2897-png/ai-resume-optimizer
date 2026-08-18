const DEFAULT_URL = "http://127.0.0.1:3000";
const DEFAULT_TIMEOUT_MS = 60_000;

function readArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

async function request(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(init.headers || {}),
        "User-Agent": "ai-resume-deployment-smoke-test/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkPage(path, marker) {
  const response = await request(path);
  const body = await response.text();
  if (!response.ok || !body.includes(marker)) {
    throw new Error(`${path} failed (${response.status}); expected marker: ${marker}`);
  }
  return { path, status: response.status };
}

async function checkHealth() {
  const response = await request("/api/health");
  const body = await response.json();
  if (!response.ok || body.status !== "ok") {
    throw new Error(`health check failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return { path: "/api/health", status: response.status, checks: body.checks };
}

async function checkPdfExport() {
  const response = await request("/api/builder/export-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modules: [
        {
          id: "deployment-smoke-header",
          type: "header",
          title: "头部信息",
          content: "部署自检简历\\nsmoke@example.com",
          order: 0,
          isCollapsed: false,
          styles: {
            fontFamily: "Inter",
            fontSize: 18,
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none",
            color: "#1f2937",
            textAlign: "left",
            paddingTop: 2,
            paddingBottom: 6,
            lineHeight: 1.6,
            itemSpacing: 0,
            titleFontSize: 18
          }
        }
      ]
    })
  });
  const bytes = new Uint8Array(await response.arrayBuffer());
  const signature = new TextDecoder().decode(bytes.slice(0, 4));
  if (!response.ok || signature !== "%PDF") {
    throw new Error(`PDF export failed (${response.status}); signature: ${signature}`);
  }
  return {
    path: "/api/builder/export-pdf",
    status: response.status,
    contentType: response.headers.get("content-type"),
    bytes: bytes.length
  };
}

const baseUrl = normalizeBaseUrl(
  readArg("url") || process.env.DEPLOYMENT_SMOKE_TEST_URL || DEFAULT_URL
);

try {
  const results = [];
  results.push(await checkHealth());
  results.push(await checkPage("/", "AI 简历工作台"));
  results.push(await checkPage("/builder", "导入你的简历"));
  results.push(await checkPdfExport());
  console.log(JSON.stringify({ ok: true, baseUrl, results }, null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        baseUrl,
        error: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  );
  process.exitCode = 1;
}

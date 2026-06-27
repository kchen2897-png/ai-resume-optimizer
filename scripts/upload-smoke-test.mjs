import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const DEFAULT_URL = "http://127.0.0.1:3000/api/upload-resume";
const DEFAULT_TIMEOUT_MS = 60_000;

function readArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function parseTimeout(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function pdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSmokePdf() {
  const lines = [
    "Upload Smoke Test Resume",
    "13800000000 | test@example.com | Shanghai",
    "Experience: Verified PDF upload and text extraction pipeline.",
  ];

  const stream = [
    "BT",
    "/F1 16 Tf",
    "72 740 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "0 -26 Td",
      `(${pdfText(line)}) Tj`,
    ]),
    "ET",
  ]
    .filter(Boolean)
    .join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf);
}

async function loadPdf() {
  const filePath = readArg("file") || process.env.UPLOAD_SMOKE_TEST_PDF;
  if (!filePath) {
    return {
      buffer: createSmokePdf(),
      fileName: "upload-smoke-test.pdf",
      source: "generated fixture",
    };
  }

  return {
    buffer: await readFile(filePath),
    fileName: path.basename(filePath),
    source: filePath,
  };
}

async function main() {
  const url = readArg("url") || process.env.UPLOAD_SMOKE_TEST_URL || DEFAULT_URL;
  const timeoutMs = parseTimeout(readArg("timeout") || process.env.UPLOAD_SMOKE_TEST_TIMEOUT_MS);
  const { buffer, fileName, source } = await loadPdf();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: "application/pdf" }), fileName);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    const body = await response.text();
    let json;
    try {
      json = JSON.parse(body);
    } catch {
      throw new Error(`Expected JSON response, got: ${body.slice(0, 300)}`);
    }

    if (json.success || json.rawText) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            url,
            source,
            status: response.status,
            requestId: json.requestId,
            extractionMethod: json.extractionMethod,
            charCount: json.charCount ?? json.rawText?.length,
            aiParsed: Boolean(json.success),
          },
          null,
          2
        )
      );
      return;
    }

    throw new Error(
      JSON.stringify(
        {
          status: response.status,
          code: json.code,
          stage: json.stage,
          error: json.error,
          requestId: json.requestId,
        },
        null,
        2
      )
    );
  } finally {
    clearTimeout(timeout);
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        host: os.hostname(),
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});

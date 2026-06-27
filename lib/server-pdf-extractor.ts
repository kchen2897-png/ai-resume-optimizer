/**
 * Server-side PDF text extraction.
 *
 * Uses PyMuPDF (fitz) via Python subprocess for best Chinese text extraction
 * accuracy — handles Canva, WPS, and other PDF generators that pdftotext/pdfsjs
 * struggle with.
 *
 * Local dev: requires Python 3 + PyMuPDF (`pip install PyMuPDF`)
 * Production: uses pdf-parse (Mozilla pdf.js) as fallback via extractWithPdfParseFallback
 */

import { spawn } from "child_process";
import { existsSync } from "fs";
import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";

const PYTHON_TIMEOUT_MS = 30_000;

export interface ExtractionResult {
  success: boolean;
  text?: string;
  charCount?: number;
  pageCount?: number;
  method: "pymupdf" | "pdfjs-fallback";
  fallbackReason?: string;
  error?: string;
}

/**
 * Extract text from PDF buffer using PyMuPDF (Python subprocess).
 * Falls back to pdf-parse if Python/PyMuPDF is not available.
 */
export async function extractPDFTextServer(
  pdfBuffer: Buffer,
  fileName?: string
): Promise<ExtractionResult> {
  const pymupdfResult = await extractWithPyMuPDF(pdfBuffer, fileName);
  if (pymupdfResult.success && pymupdfResult.text?.trim()) {
    return pymupdfResult;
  }

  console.warn(
    "PyMuPDF extraction failed or returned empty text, falling back to pdf-parse:",
    pymupdfResult.error
  );
  const fallbackResult = await extractWithPdfParse(pdfBuffer);
  return {
    ...fallbackResult,
    fallbackReason: pymupdfResult.error,
  };
}

async function extractWithPyMuPDF(
  pdfBuffer: Buffer,
  fileName?: string
): Promise<ExtractionResult> {
  let tmpDir: string | undefined;

  try {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "resume-upload-"));
    const safeName = sanitizePdfFileName(fileName);
    const tmpPath = path.join(tmpDir, safeName);

    await writeFile(tmpPath, pdfBuffer);

    const pythonPath = process.env.PYTHON_PATH || findPython();
    const scriptPath = path.join(process.cwd(), "lib", "extract_pdf.py");

    const result = await runPythonScript(pythonPath, scriptPath, tmpPath);

    if (result.success && result.text?.trim()) {
      return { ...result, method: "pymupdf" };
    }
    return {
      success: false,
      method: "pymupdf",
      error: result.error || "No text extracted",
    };
  } catch (err) {
    return {
      success: false,
      method: "pymupdf",
      error: err instanceof Error ? err.message : "PyMuPDF extraction failed",
    };
  } finally {
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}

function sanitizePdfFileName(fileName?: string): string {
  const rawName = fileName?.trim() || "resume.pdf";
  const safeName = rawName
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/[^\w.-]/g, "_")
    .slice(0, 120);

  return safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;
}

function findPython(): string {
  // On Windows, python3 may not be on PATH from Git Bash
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || "C:\\Users\\Default\\AppData\\Local";
    const candidates = [
      `${localAppData}\\Programs\\Python\\Python311\\python.exe`,
      `${localAppData}\\Programs\\Python\\Python312\\python.exe`,
      "C:\\Python311\\python.exe",
      "C:\\Python312\\python.exe",
      "python",  // fallback to PATH
    ];
    return candidates.find((candidate) => candidate === "python" || existsSync(candidate)) || "python";
  }
  return "python3";
}

async function runPythonScript(
  pythonPath: string,
  scriptPath: string,
  pdfPath: string
): Promise<{ success: boolean; text?: string; error?: string; charCount?: number; pageCount?: number }> {
  return new Promise((resolve) => {
    let settled = false;
    const proc = spawn(pythonPath, [scriptPath, pdfPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    const finish = (result: { success: boolean; text?: string; error?: string; charCount?: number; pageCount?: number }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      finish({
        success: false,
        error: `PyMuPDF timed out after ${PYTHON_TIMEOUT_MS}ms`,
      });
    }, PYTHON_TIMEOUT_MS);

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString("utf-8");
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString("utf-8");
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        finish({
          success: false,
          error: `Python exited with code ${code}: ${stderr}`,
        });
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        finish(result);
      } catch {
        finish({
          success: false,
          error: `Failed to parse Python output: ${stdout.slice(0, 200)}`,
        });
      }
    });

    proc.on("error", (err) => {
      finish({
        success: false,
        error: `Failed to start Python: ${err.message}`,
      });
    });
  });
}

/**
 * Fallback extraction using pdf-parse (Mozilla pdf.js server-side).
 * Used when PyMuPDF is not available (e.g., Vercel serverless).
 * To enable: npm install pdf-parse && npm install @types/pdf-parse
 */
async function extractWithPdfParse(
  pdfBuffer: Buffer
): Promise<ExtractionResult> {
  let parser: import("pdf-parse").PDFParse | undefined;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse") as typeof import("pdf-parse");
    parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
    const data = await parser.getText({ pageJoiner: "" });

    if (data.text?.trim()) {
      return {
        success: true,
        text: data.text,
        charCount: data.text.length,
        pageCount: data.total,
        method: "pdfjs-fallback",
      };
    }
    return {
      success: false,
      method: "pdfjs-fallback",
      error: "No text extracted from PDF",
    };
  } catch (err) {
    return {
      success: false,
      method: "pdfjs-fallback",
      error:
        err instanceof Error ? err.message : "pdf-parse extraction failed",
    };
  } finally {
    await parser?.destroy().catch(() => undefined);
  }
}

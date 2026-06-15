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
import path from "path";
import fs from "fs/promises";
import os from "os";
import { writeFile } from "fs/promises";

export interface ExtractionResult {
  success: boolean;
  text?: string;
  charCount?: number;
  pageCount?: number;
  method: "pymupdf" | "pdfjs-fallback";
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
  // Try PyMuPDF first
  const pymupdfResult = await extractWithPyMuPDF(pdfBuffer, fileName);
  if (pymupdfResult.success && pymupdfResult.text?.trim()) {
    return pymupdfResult;
  }

  console.warn(
    "PyMuPDF extraction failed or returned empty text, falling back to pdf-parse:",
    pymupdfResult.error
  );
  return extractWithPdfParse(pdfBuffer);
}

async function extractWithPyMuPDF(
  pdfBuffer: Buffer,
  fileName?: string
): Promise<ExtractionResult> {
  const tmpDir = os.tmpdir();
  const safeName = fileName?.replace(/[^a-zA-Z0-9_.-]/g, "_") || "resume.pdf";
  const tmpPath = path.join(tmpDir, `resume-${Date.now()}-${safeName}`);

  try {
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
    // Clean up temp file
    try {
      await fs.unlink(tmpPath);
    } catch {
      // Ignore cleanup errors
    }
  }
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
    // Return the most likely candidate; child_process will error if not found
    return candidates[0];
  }
  return "python3";
}

async function runPythonScript(
  pythonPath: string,
  scriptPath: string,
  pdfPath: string
): Promise<{ success: boolean; text?: string; error?: string; charCount?: number; pageCount?: number }> {
  return new Promise((resolve) => {
    const proc = spawn(pythonPath, [scriptPath, pdfPath], {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 30000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString("utf-8");
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString("utf-8");
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Python exited with code ${code}: ${stderr}`,
        });
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch {
        resolve({
          success: false,
          error: `Failed to parse Python output: ${stdout.slice(0, 200)}`,
        });
      }
    });

    proc.on("error", (err) => {
      resolve({
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
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(pdfBuffer);

    if (data.text?.trim()) {
      return {
        success: true,
        text: data.text,
        charCount: data.text.length,
        pageCount: data.numpages,
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
  }
}

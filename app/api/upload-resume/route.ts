import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { extractPDFTextServer } from "@/lib/server-pdf-extractor";
import { parseResumeWithAI } from "@/lib/ai-parser";

export const maxDuration = 60; // PDF extraction + AI parsing needs time

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

type UploadErrorCode =
  | "MISSING_FILE"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "TEXT_EXTRACTION_FAILED"
  | "AI_PARSE_FAILED"
  | "INTERNAL_ERROR";

type UploadStage = "validation" | "extract" | "ai-parse" | "unknown";

function uploadError(
  status: number,
  code: UploadErrorCode,
  stage: UploadStage,
  message: string,
  requestId: string,
  extras: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      success: false,
      code,
      stage,
      error: message,
      requestId,
      ...extras,
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return uploadError(
        400,
        "MISSING_FILE",
        "validation",
        "请上传简历 PDF 文件",
        requestId
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".pdf")) {
      return uploadError(
        400,
        "INVALID_FILE_TYPE",
        "validation",
        `不支持 .${fileName.split(".").pop()} 格式，目前仅支持 PDF 文件`,
        requestId
      );
    }

    // Validate file size (max 10MB)
    if (file.size > MAX_UPLOAD_SIZE) {
      return uploadError(
        400,
        "FILE_TOO_LARGE",
        "validation",
        "文件大小超过 10MB 限制",
        requestId,
        { maxSize: MAX_UPLOAD_SIZE }
      );
    }

    // Step 1: Extract text from PDF (server-side, PyMuPDF)
    const buffer = Buffer.from(await file.arrayBuffer());
    const extraction = await extractPDFTextServer(buffer, file.name);

    if (!extraction.success || !extraction.text?.trim()) {
      console.warn("Upload PDF text extraction failed", {
        requestId,
        fileName: file.name,
        method: extraction.method,
        error: extraction.error,
        fallbackReason: extraction.fallbackReason,
      });

      return uploadError(
        422,
        "TEXT_EXTRACTION_FAILED",
        "extract",
        "未能从 PDF 中提取文字。文件可能是扫描图片，建议换成可复制文字的 PDF，或进入制作器手动粘贴内容。",
        requestId,
        {
          extractionMethod: extraction.method,
          debug:
            process.env.NODE_ENV === "production"
              ? undefined
              : {
                  error: extraction.error,
                  fallbackReason: extraction.fallbackReason,
                },
        }
      );
    }

    const rawText = extraction.text.trim();

    // Step 2: Parse text into structured modules via AI
    const parseResult = await parseResumeWithAI(rawText);

    if (!parseResult.success) {
      console.warn("Upload AI parse failed; returning raw text fallback", {
        requestId,
        fileName: file.name,
        error: parseResult.error,
      });

      return NextResponse.json(
        {
          success: false,
          code: "AI_PARSE_FAILED",
          stage: "ai-parse",
          error: parseResult.error,
          requestId,
          rawText,
          extractionMethod: extraction.method,
          charCount: extraction.charCount,
          pageCount: extraction.pageCount,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      modules: parseResult.modules,
      rawText,
      extractionMethod: extraction.method,
      charCount: extraction.charCount,
      pageCount: extraction.pageCount,
    });
  } catch (err) {
    console.error("Upload resume unexpected error", { requestId, err });
    return uploadError(
      500,
      "INTERNAL_ERROR",
      "unknown",
      "上传服务暂时不可用，请稍后重试。若问题持续，请记录错误编号联系维护者。",
      requestId
    );
  }
}

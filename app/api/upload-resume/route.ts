import { NextRequest, NextResponse } from "next/server";
import { extractPDFTextServer } from "@/lib/server-pdf-extractor";
import { parseResumeWithAI } from "@/lib/ai-parser";

export const maxDuration = 60; // PDF extraction + AI parsing needs time

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "请上传简历文件" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".pdf")) {
      return NextResponse.json(
        {
          success: false,
          error: `不支持 .${fileName.split(".").pop()} 格式，目前仅支持 PDF 文件`,
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "文件大小超过 10MB 限制" },
        { status: 400 }
      );
    }

    // Step 1: Extract text from PDF (server-side, PyMuPDF)
    const buffer = Buffer.from(await file.arrayBuffer());
    const extraction = await extractPDFTextServer(buffer, file.name);

    if (!extraction.success || !extraction.text?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: extraction.error || "未能从 PDF 中提取文字，文件可能为扫描图片",
          extractionMethod: extraction.method,
        },
        { status: 422 }
      );
    }

    const rawText = extraction.text.trim();

    // Step 2: Parse text into structured modules via AI
    const parseResult = await parseResumeWithAI(rawText);

    if (!parseResult.success) {
      // Return raw text even if AI parsing fails — client can show it
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error,
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
      modules: parseResult.modules,
      rawText,
      extractionMethod: extraction.method,
      charCount: extraction.charCount,
      pageCount: extraction.pageCount,
    });
  } catch (err: any) {
    console.error("Upload resume error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "文件处理失败" },
      { status: 500 }
    );
  }
}

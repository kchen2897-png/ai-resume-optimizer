"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeModule } from "@/lib/editor-types";
import { extractPDFText, cleanExtractedText, type ExtractionProgress } from "@/lib/pdf-extractor";

interface FileUploadZoneProps {
  onTextExtracted: (text: string) => void;
  onModulesParsed?: (modules: ResumeModule[]) => void;
  onFileProcessed?: () => void;
  className?: string;
}

type Status = "idle" | "parsing" | "done" | "error";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ".pdf,.docx,.txt";

function getAcceptString() { return ACCEPTED; }

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function extractTxtText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file);
  });
}

async function extractText(file: File, onProgress?: (p: ExtractionProgress) => void): Promise<{ text: string; method: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": {
      const result = await extractPDFText(file, onProgress);
      return { text: cleanExtractedText(result.text), method: result.method };
    }
    case "docx": return { text: await extractDocxText(file), method: "docx" };
    case "txt": return { text: await extractTxtText(file), method: "txt" };
    default: throw new Error(`不支持的文件格式：.${ext}`);
  }
}

export default function FileUploadZone({ onTextExtracted, onModulesParsed, onFileProcessed, className }: FileUploadZoneProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [extractedChars, setExtractedChars] = useState(0);
  const [extractMethod, setExtractMethod] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext || "")) {
      setStatus("error");
      setErrorMessage(`不支持 .${ext} 格式，请上传 PDF、DOCX 或 TXT 文件`);
      return;
    }
    if (file.size > MAX_SIZE) {
      setStatus("error");
      setErrorMessage("文件大小超过 10MB 限制");
      return;
    }

    setFileName(file.name);
    setStatus("parsing");
    setErrorMessage("");

    try {
      const { text, method } = await extractText(file);
      if (!text.trim()) throw new Error("未能从文件中提取到文字，文件可能为扫描图片或空白文档");

      onTextExtracted(text);
      setExtractMethod(method);
      setExtractedChars(text.trim().length);
      setStatus("done");
      onFileProcessed?.();
      setTimeout(() => { setStatus("idle"); setFileName(""); setExtractedChars(0); setExtractMethod(""); }, 4000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "文件解析失败，请重试");
    }
  }, [onTextExtracted, onModulesParsed]);

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setDragOver(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setDragOver(false); }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleClick() { inputRef.current?.click(); }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleInputChange} className="hidden" />
      <div
        onClick={status === "idle" || status === "error" ? handleClick : undefined}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-sm transition-all",
          dragOver && "border-brand-400 bg-brand-50/60",
          status === "idle" && "border-gray-200 hover:border-brand-300 hover:bg-brand-50/30",
          status === "parsing" && "cursor-default border-brand-300 bg-brand-50/40",
          status === "done" && "cursor-default border-emerald-300 bg-emerald-50/40",
          status === "error" && "border-red-300 bg-red-50/40",
        )}
      >
        {status === "idle" && (
          <>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Upload className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-600">拖拽简历文件到这里，或<span className="text-brand-600">点击选择文件</span></p>
              <p className="text-xs text-gray-400">支持 PDF、DOCX、TXT 格式，最大 10MB</p>
            </div>
            <FileText className="h-4 w-4 flex-shrink-0 text-gray-300" />
          </>
        )}

        {status === "parsing" && (
          <>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            </div>
            <div className="flex-1"><p className="font-medium text-brand-700">正在提取文本...</p><p className="text-xs text-brand-500">{fileName}</p></div>
          </>
        )}

        {status === "done" && (
          <>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-700">解析完成</p>
              <p className="text-xs text-emerald-500">
                已提取 {extractedChars} 字
                {extractMethod === "pdfjs" && " · PDF 文字提取"}
                {extractMethod === "docx" && " · DOCX 提取"}
                {extractMethod === "txt" && " · TXT 读取"}
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex-1"><p className="font-medium text-red-600">解析失败</p><p className="text-xs text-red-500">{errorMessage}</p></div>
            <button type="button" onClick={(e) => { e.stopPropagation(); setStatus("idle"); setErrorMessage(""); }} className="text-xs text-red-400 underline hover:text-red-600">重试</button>
          </>
        )}
      </div>
    </div>
  );
}

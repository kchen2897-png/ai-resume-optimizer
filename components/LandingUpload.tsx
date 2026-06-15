"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, AlertCircle, FileText, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "uploading" | "parsing" | "done" | "error";

const MAX_SIZE = 10 * 1024 * 1024;

export default function LandingUpload() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    // Validate type
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setErrorMessage("目前仅支持 PDF 格式，请上传 PDF 简历文件");
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      setStatus("error");
      setErrorMessage("文件大小超过 10MB 限制");
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setErrorMessage("");

    try {
      // Show realistic progress based on file size
      const updateProgress = () => {
        const start = Date.now();
        const minDuration = 8000; // min 8s for realistic feel
        const maxDuration = 30000; // max 30s
        const estimatedDuration = Math.min(
          maxDuration,
          Math.max(minDuration, file.size / 1024) // ~1ms per KB
        );

        const tick = () => {
          const elapsed = Date.now() - start;
          const pct = Math.min(95, (elapsed / estimatedDuration) * 100);
          if (pct < 30) setProgress("正在上传文件...");
          else if (pct < 60) setProgress("正在提取 PDF 文字...");
          else if (pct < 90) setProgress("AI 正在解析简历结构...");
          else setProgress("即将完成...");

          if (elapsed < estimatedDuration) {
            setTimeout(tick, 300);
          }
        };
        setTimeout(tick, 100);
      };

      updateProgress();

      // Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!json.success && !json.rawText) {
        throw new Error(json.error || "文件处理失败");
      }

      // Even if AI parsing failed, we still have raw text — try parsing client-side
      if (json.success && json.modules?.length > 0) {
        setProgress("加载中...");
        sessionStorage.setItem(
          "resume-builder-modules",
          JSON.stringify(json.modules)
        );
        setStatus("done");
        setTimeout(() => {
          router.push("/builder");
        }, 500);
      } else if (json.rawText) {
        // Fallback: pass raw text to builder for parsing
        setProgress("加载中...");
        localStorage.setItem("resume-builder-import", json.rawText);
        setStatus("done");
        setTimeout(() => {
          router.push("/builder");
        }, 500);
      } else {
        throw new Error(json.error || "文件处理失败");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "文件处理失败，请重试"
      );
    }
  }, [router]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Zone */}
      <div
        onClick={status === "idle" || status === "error" ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 transition-all duration-200 text-center",
          dragOver && "border-brand-500 bg-brand-50/60 scale-[1.01]",
          status === "idle" &&
            "border-gray-300 hover:border-brand-400 hover:bg-brand-50/30",
          status === "uploading" &&
            "cursor-default border-brand-300 bg-brand-50/40",
          status === "done" &&
            "cursor-default border-emerald-300 bg-emerald-50/40",
          status === "error" && "border-red-300 bg-red-50/40"
        )}
      >
        {status === "idle" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
              <FileUp className="h-8 w-8 text-brand-500" />
            </div>
            <p className="mb-2 text-lg font-semibold text-gray-800">
              上传你的简历 PDF
            </p>
            <p className="mb-1 text-sm text-gray-500">
              拖拽文件到这里，或 <span className="text-brand-600 font-medium">点击选择文件</span>
            </p>
            <p className="text-xs text-gray-400">
              支持 PDF 格式，最大 10MB · AI 自动识别并结构化
            </p>
          </>
        )}

        {status === "uploading" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
            </div>
            <p className="mb-1 text-lg font-semibold text-brand-700">
              正在处理简历
            </p>
            <p className="mb-2 text-sm text-brand-500">{progress}</p>
            <p className="text-xs text-brand-400">{fileName}</p>
            {/* Progress bar */}
            <div className="mx-auto mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-brand-100">
              <div className="h-full animate-pulse rounded-full bg-brand-500 w-2/3" />
            </div>
          </>
        )}

        {status === "done" && (
          <>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <FileText className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-emerald-700">解析完成</p>
            <p className="text-sm text-emerald-500">正在跳转到制作器...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="mb-1 text-lg font-semibold text-red-600">处理失败</p>
            <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStatus("idle");
                setErrorMessage("");
                setProgress("");
              }}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              重新上传
            </button>
          </>
        )}
      </div>
    </div>
  );
}

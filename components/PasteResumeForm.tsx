"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardPaste, Loader2 } from "lucide-react";
import { hydrateModules } from "@/lib/resume-module-normalizer";
import type { ResumeModule } from "@/lib/editor-types";

interface PasteResumeFormProps {
  onParsed?: (modules: ResumeModule[]) => void;
  compact?: boolean;
}

function formatParseError(json: any) {
  return json?.error || "AI 解析失败，请稍后重试，或直接进入工作台手动填写";
}

export default function PasteResumeForm({ onParsed, compact = false }: PasteResumeFormProps) {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function parseText() {
    const text = rawText.trim();
    if (text.length < 30) {
      setError("请粘贴更完整的简历文字内容");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success || !Array.isArray(json.modules)) {
        throw new Error(formatParseError(json));
      }

      const modules = hydrateModules(json.modules);
      if (onParsed) {
        onParsed(modules);
      } else {
        sessionStorage.setItem("resume-builder-modules", JSON.stringify(modules));
        router.push("/builder");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 解析失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <ClipboardPaste className="h-5 w-5" />
        </div>
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">粘贴简历文本</h2>
          <p className="mt-1 text-sm text-gray-500">
            从 PDF 中选中文字复制到这里，AI 会整理成可编辑模块。
          </p>
        </div>
      </div>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={compact ? 5 : 7}
        placeholder="在这里粘贴你的简历文字..."
        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-300 focus:bg-white"
      />

      {error && <p className="mt-2 text-left text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={parseText}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {loading ? "正在解析..." : "AI 整理并进入工作台"}
      </button>

      <p className="mt-3 text-xs text-gray-400">
        如果 PDF 无法选中文字，通常说明它是扫描版，可以直接进入工作台手动填写。
      </p>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Clock, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizerForm from "@/components/optimizer/OptimizerForm";
import ComparisonResult from "@/components/optimizer/ComparisonResult";
import { getHistory, saveToHistory, deleteHistoryEntry } from "@/lib/history";
import type { ComparisonResult as ComparisonResultType } from "@/lib/types";
import type { HistoryEntry } from "@/lib/history";

export default function OptimizerPage() {
  const [result, setResult] = useState<ComparisonResultType | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fieldsRef = useRef({
    targetRole: "",
    resumeText: "",
  });

  useEffect(() => {
    setHistory(getHistory("optimizer"));
  }, []);

  function handleResult(r: ComparisonResultType) {
    setResult(r);
    // Save as OptimizeResult-compatible for history (with score/summary)
    const historyCompatible = {
      score: r.score,
      summary: r.summary,
      matchAnalysis: r.matchAnalysis,
      problems: r.problems,
      suggestions: r.suggestions,
      atsKeywords: r.atsKeywords,
      rewrittenResume: r.comparisons.map((c) => c.optimizedText).join("\n\n"),
      projectExperience: [],
      personalStrengths: r.personalStrengths,
      interviewHighlights: r.interviewHighlights,
      nextSteps: r.nextSteps,
    };
    const updated = saveToHistory(
      fieldsRef.current.targetRole || "未指定岗位",
      fieldsRef.current.resumeText,
      historyCompatible,
      "optimizer"
    );
    setHistory(updated);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50">
                <h2 className="text-lg font-bold text-gray-800">简历优化</h2>
                <p className="mt-1 text-sm text-gray-400">
                  粘贴简历文本，AI 逐段对比优化
                </p>
                <div className="mt-6">
                  <OptimizerForm
                    onResult={handleResult}
                    onFormFieldsChange={(fields) => {
                      fieldsRef.current = fields;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-3">
            {result ? (
              <ComparisonResult data={result} />
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-600">
                  等待优化
                </h3>
                <p className="mt-2 max-w-sm text-sm text-gray-400">
                  在左侧粘贴简历内容，填写目标岗位，点击「开始逐段优化」
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History button */}
      <button
        onClick={() => setShowHistory((v) => !v)}
        className={cn(
          "fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-xl border border-r-0 border-gray-200 bg-white px-2 py-4 shadow-lg transition-all hover:bg-gray-50",
          showHistory && "right-72 sm:right-80"
        )}
        title="优化历史"
      >
        <Clock className="h-5 w-5 text-gray-500" />
        {history.length > 0 && (
          <span className="mt-1 block text-[10px] font-semibold text-brand-600">
            {history.length}
          </span>
        )}
      </button>

      {/* History sidebar */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 z-30 w-72 border-l border-gray-200 bg-white shadow-2xl animate-slide-up sm:w-80">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
            <h3 className="text-sm font-bold text-gray-800">优化历史</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <Clock className="h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm text-gray-400">暂无优化历史</p>
            </div>
          ) : (
            <div
              className="divide-y divide-gray-50 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 57px)" }}
            >
              {history.map((entry) => (
                <div key={entry.id} className="group relative px-4 py-3">
                  <button
                    onClick={() => {
                      setShowHistory(false);
                    }}
                    className="w-full text-left"
                  >
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {entry.targetRole}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {entry.resumeSnippet}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(entry.timestamp).toLocaleString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistory(deleteHistoryEntry(entry.id, "optimizer"));
                    }}
                    className="absolute right-3 top-3 rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showHistory && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}
    </>
  );
}

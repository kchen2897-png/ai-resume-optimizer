"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Sparkles, Target, X } from "lucide-react";
import type { ComparisonResult } from "@/lib/types";
import type { ResumeModule } from "@/lib/editor-types";
import { hydrateModules } from "@/lib/resume-module-normalizer";
import { cn } from "@/lib/utils";

interface Props {
  resumeText: string;
  targetRole: string;
  onTargetRoleChange?: (role: string) => void;
  onApplyModules: (modules: ResumeModule[]) => void;
  onClose: () => void;
}

const EXPERIENCE_LEVELS = [
  { value: "0", label: "应届" },
  { value: "1-3", label: "1-3 年" },
  { value: "3-5", label: "3-5 年" },
  { value: "5-10", label: "5-10 年" },
  { value: "10+", label: "10 年以上" },
];

const JOB_TYPES = [
  { value: "internship", label: "实习" },
  { value: "campus", label: "校招" },
  { value: "social", label: "社招" },
  { value: "careerChange", label: "转行" },
  { value: "promotion", label: "晋升" },
];

const OPTIMIZE_LEVELS = [
  { value: "conservative", label: "轻度" },
  { value: "standard", label: "标准" },
  { value: "aggressive", label: "强力" },
];

export default function AIWorkbenchPanel({
  resumeText,
  targetRole,
  onTargetRoleChange,
  onApplyModules,
  onClose,
}: Props) {
  const [role, setRole] = useState(targetRole);
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("3-5");
  const [jobType, setJobType] = useState("social");
  const [optimizeLevel, setOptimizeLevel] = useState("standard");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [optimizedText, setOptimizedText] = useState("");
  const [optimizedModules, setOptimizedModules] = useState<ResumeModule[] | null>(null);

  const canOptimize = resumeText.trim().length >= 50 && role.trim().length > 0;
  const missingKeywords = useMemo(
    () => result?.atsKeywords?.missingKeywords?.slice(0, 12) ?? [],
    [result]
  );

  async function runOptimization() {
    setError("");
    if (!role.trim()) {
      setError("请先填写目标岗位。");
      return;
    }
    if (resumeText.trim().length < 50) {
      setError("当前简历内容太少，至少需要 50 个字符后再优化。");
      return;
    }

    setLoading(true);
    try {
      onTargetRoleChange?.(role.trim());
      const response = await fetch("/api/optimizer/optimize-and-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          targetRole: role.trim(),
          industry: industry.trim(),
          experienceLevel,
          jobType,
          optimizeLevel,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "AI 优化失败，请稍后重试。");
      }

      setResult(json.data);
      setOptimizedText(json.optimizedText || "");
      setOptimizedModules(Array.isArray(json.modules) ? hydrateModules(json.modules) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 优化失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function applyOptimizedResume() {
    if (!optimizedModules && !optimizedText.trim()) return;

    setApplying(true);
    setError("");
    try {
      if (optimizedModules?.length) {
        onApplyModules(optimizedModules);
        onClose();
        return;
      }

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: optimizedText.trim() }),
      });
      const json = await response.json();
      if (!json.success || !Array.isArray(json.modules)) {
        throw new Error(json.error || "优化结果结构化失败，请复制文本后手动调整。");
      }
      onApplyModules(hydrateModules(json.modules));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "应用优化结果失败。");
    } finally {
      setApplying(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-[420px] max-w-full flex-col border-l border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-gray-900">AI 简历优化</h3>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">目标岗位</label>
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="例如：新媒体运营实习生"
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((value) => !value)}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-600"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
            优化设置
          </button>

          {advancedOpen && (
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">目标行业</label>
                <input
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  placeholder="可选"
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-brand-400"
                />
              </div>
              <Segmented value={experienceLevel} options={EXPERIENCE_LEVELS} onChange={setExperienceLevel} />
              <Segmented value={jobType} options={JOB_TYPES} onChange={setJobType} />
              <Segmented value={optimizeLevel} options={OPTIMIZE_LEVELS} onChange={setOptimizeLevel} />
            </div>
          )}

          <button
            onClick={runOptimization}
            disabled={loading || !canOptimize}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
            {loading ? "正在分析并优化..." : "分析并生成优化版"}
          </button>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

          {result && (
            <div className="space-y-4">
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl font-bold text-brand-600">
                    {result.score}
                  </div>
                  <p className="flex-1 text-sm text-gray-700">{result.summary}</p>
                </div>
              </div>

              {missingKeywords.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">建议补充关键词</p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingKeywords.map((keyword) => (
                      <span key={keyword} className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600">逐段优化</p>
                <div className="space-y-2">
                  {result.comparisons.map((comparison, index) => (
                    <details key={`${comparison.sectionTitle}-${index}`} className="rounded-xl border border-gray-100 bg-white p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                        {comparison.sectionTitle || `段落 ${index + 1}`}
                      </summary>
                      <p className="mt-2 text-xs leading-5 text-gray-500">{comparison.changeRationale}</p>
                      <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900 whitespace-pre-wrap">
                        {comparison.optimizedText}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 p-4">
        <button
          onClick={applyOptimizedResume}
          disabled={applying || (!optimizedModules && !optimizedText.trim())}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          应用优化到简历
        </button>
      </div>
    </aside>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
            value === option.value
              ? "border-brand-300 bg-white text-brand-700"
              : "border-gray-200 bg-transparent text-gray-500 hover:bg-white"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

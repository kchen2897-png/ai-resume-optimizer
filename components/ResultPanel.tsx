"use client";

import { useState } from "react";
import { AlertTriangle, Lightbulb, Target, Briefcase, TrendingUp, Star, Palette, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import type { OptimizeResult } from "@/lib/types";
import ScoreCard from "./ScoreCard";
import KeywordTags from "./KeywordTags";
import { cn } from "@/lib/utils";
import { serializeModulesToHTML } from "@/lib/resume-serializer";

interface ResultPanelProps {
  data: OptimizeResult;
  onEditInEditor?: (text: string) => void;
  onReOptimize?: () => void;
  originalText?: string;
}

function Section({ title, icon: Icon, defaultOpen, children }: { title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
        <Icon className="h-4 w-4 text-brand-500" />
        {title}
        <div className="flex-1" />
        {open ? <ChevronDown className="h-4 w-4 text-gray-300" /> : <ChevronRight className="h-4 w-4 text-gray-300" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function ResultPanel({ data, onEditInEditor, onReOptimize, originalText }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  async function handleCopyHTML() {
    await navigator.clipboard.writeText(data.rewrittenResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* ── Score bar ── */}
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <ScoreCard score={data.score} compact />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">综合评分</p>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{data.summary}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleCopyHTML} className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all", copied ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-600")}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "已复制" : "复制全文"}
          </button>
          {onEditInEditor && (
            <button onClick={() => onEditInEditor(data.rewrittenResume)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-all">
              <Palette className="h-4 w-4" />
              精细调整
            </button>
          )}
          {onReOptimize && (
            <button onClick={onReOptimize} className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-all">
              重新优化
            </button>
          )}
        </div>
      </div>

      {/* ── A4 preview of optimized resume ── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-sm font-semibold text-gray-700">优化后的简历</span>
          <button onClick={() => setShowOriginal(!showOriginal)} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
            {showOriginal ? "查看优化后" : "对比原文"}
          </button>
        </div>
        <div className="bg-gray-100 flex justify-center p-4">
          <div className="w-full bg-white flex-shrink-0" style={{ maxWidth: '800px', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)', borderRadius: 2, padding: '32px 40px' }}>
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-[1.7] text-gray-800" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              {showOriginal ? (originalText || "(无原文)") : data.rewrittenResume}
            </pre>
          </div>
        </div>
      </div>

      {/* ── Collapsible analysis sections ── */}
      <div className="space-y-3">
        {/* Match Analysis */}
        <Section title="匹配度分析" icon={Target} defaultOpen={false}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <p className="text-xs font-medium text-gray-500">岗位匹配</p>
              <p className="text-xs text-gray-600 mt-1">{data.matchAnalysis.targetRoleFit}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <p className="text-xs font-medium text-gray-500">行业匹配</p>
              <p className="text-xs text-gray-600 mt-1">{data.matchAnalysis.industryFit}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <p className="text-xs font-medium text-gray-500">经验匹配</p>
              <p className="text-xs text-gray-600 mt-1">{data.matchAnalysis.experienceFit}</p>
            </div>
          </div>
        </Section>

        {/* Problems */}
        {data.problems.length > 0 && (
          <Section title={`发现 ${data.problems.length} 个问题`} icon={AlertTriangle} defaultOpen={false}>
            <div className="space-y-2">
              {data.problems.map((p, i) => {
                const colors = { high: "border-l-red-500 bg-red-50/50", medium: "border-l-amber-500 bg-amber-50/50", low: "border-l-blue-500 bg-blue-50/50" };
                const badges = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-blue-100 text-blue-700" };
                const labels = { high: "严重", medium: "中等", low: "轻微" };
                const k = p.severity as keyof typeof colors;
                return (
                  <div key={i} className={cn("rounded-r-lg border-l-4 p-3", colors[k])}>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", badges[k])}>{labels[k]}</span>
                      <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ATS Keywords */}
        <KeywordTags mustHave={data.atsKeywords.mustHave} niceToHave={data.atsKeywords.niceToHave} missingKeywords={data.atsKeywords.missingKeywords} />

        {/* Suggestions */}
        {data.suggestions.length > 0 && (
          <Section title={`${data.suggestions.length} 条优化建议`} icon={Lightbulb} defaultOpen={false}>
            <div className="space-y-3">
              {data.suggestions.map((s, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                  <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                  <p className="mt-1 text-xs text-gray-600">{s.description}</p>
                  {s.example && (
                    <div className="mt-2 rounded-md border border-brand-100 bg-brand-50/50 p-2">
                      <p className="text-[11px] font-medium text-brand-600">示例：</p>
                      <p className="mt-0.5 text-xs text-gray-700">{s.example}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Next Steps */}
        {data.nextSteps.length > 0 && (
          <Section title="下一步建议" icon={Star} defaultOpen={false}>
            <div className="space-y-1.5">
              {data.nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-600">{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, AlertTriangle, Lightbulb, Star, ChevronDown, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComparisonResult as ComparisonResultType } from "@/lib/types";
import ScoreCard from "@/components/ScoreCard";
import KeywordTags from "@/components/KeywordTags";
import SectionComparisonCard from "./SectionComparisonCard";

function Section({
  icon: Icon,
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-6 py-4 text-left hover:bg-gray-50/50"
      >
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-sm font-semibold text-gray-700">{title}</span>
        {badge && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{badge}</span>}
        <ChevronDown className={cn("h-4 w-4 text-gray-300 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-6 pb-4">{children}</div>}
    </div>
  );
}

export default function ComparisonResult({ data }: { data: ComparisonResultType }) {
  const router = useRouter();
  const [sendingToBuilder, setSendingToBuilder] = useState(false);

  function handleSendToBuilder() {
    const optimizedText = data.comparisons.map((c) => c.optimizedText).join("\n\n");
    if (!optimizedText.trim()) return;

    setSendingToBuilder(true);
    localStorage.setItem("resume-builder-import", optimizedText.trim());
    router.push("/builder");
  }

  return (
    <div className="space-y-6">
      {/* Score bar + send to builder */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <ScoreCard score={data.score} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{data.summary}</p>
          </div>
          <button
            onClick={handleSendToBuilder}
            disabled={sendingToBuilder}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700 transition-all hover:bg-purple-100 hover:border-purple-300 active:scale-[0.98] disabled:opacity-50"
          >
            {sendingToBuilder ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            发送到制作器精细调整
          </button>
        </div>
      </div>

      {/* Section comparisons */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-bold text-gray-800">逐段对比优化</h3>
          <p className="mt-0.5 text-xs text-gray-400">原文 vs 优化版 · 附带每处改动的理由</p>
        </div>
        <div className="divide-y divide-gray-100">
          {data.comparisons.map((comp, i) => (
            <SectionComparisonCard key={i} comparison={comp} />
          ))}
        </div>
      </div>

      {/* Analysis sections */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Section icon={Target} title="匹配度分析">
          <div className="grid gap-3">
            <div className="rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-xs font-semibold text-blue-600">岗位匹配</p>
              <p className="mt-1 text-sm text-blue-800">{data.matchAnalysis.targetRoleFit}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold text-emerald-600">行业匹配</p>
              <p className="mt-1 text-sm text-emerald-800">{data.matchAnalysis.industryFit}</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-600">经验匹配</p>
              <p className="mt-1 text-sm text-amber-800">{data.matchAnalysis.experienceFit}</p>
            </div>
          </div>
        </Section>

        <Section icon={AlertTriangle} title="问题分析" badge={`${data.problems.length}`}>
          <div className="space-y-2">
            {data.problems.map((p, i) => (
              <div key={i} className={cn("rounded-lg border-l-4 p-3",
                p.severity === "high" ? "border-red-400 bg-red-50" : p.severity === "medium" ? "border-amber-400 bg-amber-50" : "border-blue-400 bg-blue-50")}>
                <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                <p className="mt-0.5 text-xs text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Target} title="ATS 关键词分析">
          <KeywordTags
            mustHave={data.atsKeywords.mustHave}
            niceToHave={data.atsKeywords.niceToHave}
            missingKeywords={data.atsKeywords.missingKeywords}
          />
        </Section>

        <Section icon={Lightbulb} title="优化建议" badge={`${data.suggestions.length}`}>
          <div className="space-y-3">
            {data.suggestions.map((s, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                <p className="mt-0.5 text-xs text-gray-600">{s.description}</p>
                {s.example && <p className="mt-1 text-xs text-gray-400 italic">示例：{s.example}</p>}
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Star} title="下一步建议" badge={`${data.nextSteps.length}`}>
          <ol className="list-inside list-decimal space-y-1">
            {data.nextSteps.map((s, i) => (
              <li key={i} className="text-sm text-gray-700">{s}</li>
            ))}
          </ol>
          {data.personalStrengths.length > 0 && (
            <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold text-emerald-600">个人优势</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.personalStrengths.map((s, i) => (
                  <span key={i} className="rounded-md bg-white px-2 py-0.5 text-xs text-emerald-700">{s}</span>
                ))}
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

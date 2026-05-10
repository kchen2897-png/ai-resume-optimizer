"use client";

import { useState } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionComparison } from "@/lib/types";

export default function SectionComparisonCard({ comparison }: { comparison: SectionComparison }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="px-6 py-5">
      <h4 className="mb-3 text-sm font-semibold text-gray-800">{comparison.sectionTitle}</h4>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Original */}
        <div className="rounded-xl border border-red-100 bg-red-50/30 p-3">
          <p className="mb-1 text-[11px] font-semibold text-red-500 uppercase tracking-wide">原文</p>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{comparison.originalText}</p>
        </div>

        {/* Optimized */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
          <p className="mb-1 text-[11px] font-semibold text-emerald-500 uppercase tracking-wide">优化版</p>
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{comparison.optimizedText}</p>
        </div>
      </div>

      {/* Rationale */}
      {comparison.changeRationale && (
        <div className="mt-3 flex items-start gap-1.5 text-xs text-gray-500">
          <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
          <span>{comparison.changeRationale}</span>
        </div>
      )}

      {/* Detailed changes */}
      {comparison.changes.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            {showDetails ? "收起改动详情" : `查看 ${comparison.changes.length} 处改动详情`}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2">
              {comparison.changes.map((change, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                  <span className={cn(
                    "mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    change.type === "modified" ? "bg-amber-100 text-amber-700" :
                    change.type === "added" ? "bg-emerald-100 text-emerald-700" :
                    "bg-purple-100 text-purple-700"
                  )}>
                    {change.type === "modified" ? "修改" : change.type === "added" ? "新增" : "重组"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-red-500 line-through">{change.original}</span>
                      <ArrowRight className="h-3 w-3 flex-shrink-0 text-gray-300" />
                      <span className="text-emerald-600 font-medium">{change.optimized}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{change.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

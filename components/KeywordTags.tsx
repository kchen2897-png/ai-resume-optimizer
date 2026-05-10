"use client";

import CopyButton from "./CopyButton";

interface KeywordTagsProps {
  mustHave: string[];
  niceToHave: string[];
  missingKeywords: string[];
}

function TagBadge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "must" | "nice" | "missing";
}) {
  const styles = {
    must: "bg-emerald-50 text-emerald-700 border-emerald-200",
    nice: "bg-blue-50 text-blue-700 border-blue-200",
    missing: "bg-red-50 text-red-600 border-red-200 line-through",
  };

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export default function KeywordTags({
  mustHave,
  niceToHave,
  missingKeywords,
}: KeywordTagsProps) {
  const allKeywords = [
    ...mustHave.map((k) => `${k}（必须）`),
    ...niceToHave.map((k) => `${k}（加分）`),
    ...missingKeywords.map((k) => `${k}（缺失）`),
  ].join("、");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">ATS 关键词分析</h3>
        <CopyButton text={allKeywords} label="复制关键词" />
      </div>

      {mustHave.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500">必须出现</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mustHave.map((kw) => (
              <TagBadge key={kw} variant="must">
                {kw}
              </TagBadge>
            ))}
          </div>
        </div>
      )}

      {niceToHave.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500">加分关键词</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {niceToHave.map((kw) => (
              <TagBadge key={kw} variant="nice">
                {kw}
              </TagBadge>
            ))}
          </div>
        </div>
      )}

      {missingKeywords.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500">当前缺失</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missingKeywords.map((kw) => (
              <TagBadge key={kw} variant="missing">
                {kw}
              </TagBadge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

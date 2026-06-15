"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, AlertTriangle, Lightbulb, Star, Loader2, Copy, Check, Plus } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import { copyToClipboard } from "@/lib/utils";

interface SuggestionData {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSections: string[];
  atsKeywords: {
    mustHave: string[];
    missingKeywords: string[];
  };
  summary: string;
}

interface Props {
  resumeText: string;
  targetRole: string;
  onClose: () => void;
}

export default function AISuggestionsPanel({ resumeText, targetRole, onClose }: Props) {
  const { dispatch } = useEditor();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SuggestionData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    analyzeResume();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function analyzeResume() {
    try {
      setLoading(true);
      const res = await fetch("/api/optimizer/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          targetRole,
          industry: "",
          experienceLevel: "3-5",
          jobType: "social",
          optimizeLevel: "standard",
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const result = json.data;
      // Detect missing sections from matchAnalysis
      const missingSections: string[] = [];
      const matchAnalysis = result.matchAnalysis;
      if (matchAnalysis) {
        if (matchAnalysis.missingSkills?.length > 0) missingSections.push("专业技能");
        if (matchAnalysis.missingProjects?.length > 0) missingSections.push("项目经历");
        if (matchAnalysis.missingCertifications?.length > 0) missingSections.push("证书资质");
      }

      setData({
        overallScore: result.score,
        strengths: result.personalStrengths || [],
        weaknesses: result.problems?.map((p: any) => `${p.title}: ${p.description}`) || [],
        missingSections,
        atsKeywords: result.atsKeywords || { mustHave: [], missingKeywords: [] },
        summary: result.summary,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败");
    } finally {
      setLoading(false);
    }
  }

  const sectionTypeMap: Record<string, string> = {
    "专业技能": "skills",
    "项目经历": "projectExperience",
    "证书资质": "certifications",
    "语言能力": "languages",
    "教育背景": "education",
    "工作经历": "workExperience",
    "实习经历": "internshipExperience",
  };

  function handleAddSection(sectionName: string) {
    const moduleType = sectionTypeMap[sectionName];
    if (moduleType) {
      dispatch({ type: "ADD_MODULE", moduleType: moduleType as any });
    }
  }

  async function handleCopyKeyword(keyword: string) {
    await copyToClipboard(keyword);
    setCopied(keyword);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="fixed inset-y-0 right-0 z-30 w-80 border-l border-gray-200 bg-white shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-gray-800">AI 全局建议</h3>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100vh - 57px)" }}>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            <p className="mt-3 text-sm text-gray-400">AI 正在分析简历…</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            <p>{error}</p>
            <button onClick={analyzeResume} className="mt-2 text-xs text-red-500 underline">
              重试
            </button>
          </div>
        )}

        {data && (
          <>
            <div className="rounded-xl bg-brand-50 p-4 text-center">
              <p className="text-3xl font-bold text-brand-600">{data.overallScore}</p>
              <p className="mt-1 text-xs text-brand-500">综合评分</p>
            </div>

            <p className="text-sm text-gray-600">{data.summary}</p>

            {data.strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-700">优势</span>
                </div>
                <ul className="space-y-1">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.weaknesses.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold text-gray-700">需改进</span>
                </div>
                <ul className="space-y-1">
                  {data.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">-</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.missingSections.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Plus className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-semibold text-gray-700">建议添加的模块</span>
                </div>
                <div className="space-y-1">
                  {data.missingSections.map((section, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSection(section)}
                      className="w-full text-left rounded-lg border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      {section}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data.atsKeywords.missingKeywords.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-700">建议添加的关键词</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.atsKeywords.missingKeywords.map((k, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopyKeyword(k)}
                      className="rounded bg-red-50 px-2 py-0.5 text-[10px] text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1"
                      title="点击复制"
                    >
                      {copied === k ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

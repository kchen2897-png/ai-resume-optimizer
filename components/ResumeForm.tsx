"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Trash2, Send, Layout, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OptimizeRequest, OptimizeResult } from "@/lib/types";
import type { ResumeModule } from "@/lib/editor-types";
import { parseResumeToModules } from "@/lib/resume-parser";
import FileUploadZone from "./FileUploadZone";
import LoadingState from "./LoadingState";
import ErrorMessage from "./ErrorMessage";

interface OptimizeFields {
  targetRole: string;
  industry: string;
  experienceLevel: string;
  jobType: string;
  optimizeLevel: string;
  resumeText: string;
}

interface ResumeFormProps {
  onResult: (result: OptimizeResult) => void;
  onModulesParsed?: (modules: ResumeModule[]) => void;
  onSwitchToEditor?: () => void;
  onFormFieldsChange?: (fields: OptimizeFields) => void;
  sampleTrigger?: number;
}

const SAMPLE_RESUME = `张三 | 高级前端工程师 | 5年经验

教育背景
北京大学 · 计算机科学与技术 · 本科 · 2017-2020

工作经历
字节跳动 · 高级前端工程师 · 2022.03-至今
- 负责抖音创作者平台前端架构设计，使用 React 18 + TypeScript + Next.js 重构核心模块
- 主导组件库建设，封装 50+ 业务组件，覆盖率达 95%，开发效率提升 40%
- 优化首页加载性能，LCP 从 3.2s 降至 1.1s，P90 打开速度提升 60%
- 设计并落地前端监控体系，错误率从 2.1% 降至 0.3%

阿里巴巴 · 前端工程师 · 2020.07-2022.02
- 参与淘宝商家后台管理系统开发，使用 React + Ant Design 实现核心功能
- 开发低代码表单引擎，支持可视化配置表单，减少 70% 重复开发工作
- 编写单元测试和 E2E 测试，代码覆盖率达 85%

技能
- 前端：React, Vue, TypeScript, Next.js, Webpack, Vite, Tailwind CSS
- 后端：Node.js, Express, Python, MySQL, Redis
- 工具：Git, Docker, CI/CD, Webpack, Vite

项目
- 开源低代码平台（GitHub 2k+ Stars）：基于 React + Zustand 实现拖拽式页面搭建`;

interface FormErrors {
  resumeText?: string;
  targetRole?: string;
}

const EXPERIENCE_LEVELS = [
  { value: "0", label: "应届生" },
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
  { value: "promotion", label: "晋升跳槽" },
];

const OPTIMIZE_LEVELS = [
  { value: "conservative", label: "保守优化", desc: "微调措辞，保持原有结构" },
  { value: "standard", label: "标准优化", desc: "优化表达，强化亮点" },
  { value: "aggressive", label: "强力优化", desc: "深度重写，最大化匹配度" },
];

export default function ResumeForm({ onResult, onModulesParsed, onSwitchToEditor, onFormFieldsChange, sampleTrigger }: ResumeFormProps) {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("3-5");
  const [jobType, setJobType] = useState("social");
  const [optimizeLevel, setOptimizeLevel] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [highlightTextarea, setHighlightTextarea] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!resumeText.trim()) {
      newErrors.resumeText = "请输入简历内容";
    } else if (resumeText.trim().length < 50) {
      newErrors.resumeText = `简历内容至少 50 个字（当前 ${resumeText.trim().length} 字）`;
    } else if (resumeText.trim().length > 12000) {
      newErrors.resumeText = `简历内容最多 12000 字（当前 ${resumeText.trim().length} 字）`;
    }

    if (!targetRole.trim()) {
      newErrors.targetRole = "请输入目标岗位";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const body: OptimizeRequest = {
        resumeText: resumeText.trim(),
        targetRole: targetRole.trim(),
        industry: industry.trim(),
        experienceLevel,
        jobType,
        optimizeLevel,
      };

      const res = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "请求失败，请重试");
      }

      onResult(json.data);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "未知错误，请重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setResumeText("");
    setTargetRole("");
    setIndustry("");
    setExperienceLevel("3-5");
    setJobType("social");
    setOptimizeLevel("standard");
    setError(null);
    setErrors({});
  }

  const charCount = resumeText.trim().length;

  // Fill sample data when triggered
  useEffect(() => {
    if (sampleTrigger && sampleTrigger > 0) {
      setResumeText(SAMPLE_RESUME.trim());
      setTargetRole("高级前端工程师");
      setIndustry("互联网");
      setExperienceLevel("3-5");
      setJobType("social");
      setOptimizeLevel("standard");
      setError(null);
      setErrors({});
    }
  }, [sampleTrigger]);

  // Report form fields to parent so editor toolbar can use them
  useEffect(() => {
    onFormFieldsChange?.({
      targetRole: targetRole,
      industry,
      experienceLevel,
      jobType,
      optimizeLevel,
      resumeText,
    });
  }, [targetRole, industry, experienceLevel, jobType, optimizeLevel, resumeText, onFormFieldsChange]);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <FileUploadZone
          onTextExtracted={(text) => {
            setResumeText(text);
            if (errors.resumeText) setErrors((prev) => ({ ...prev, resumeText: undefined }));
          }}
          onModulesParsed={onModulesParsed}
          onFileProcessed={() => {
            setHighlightTextarea(true);
            setTimeout(() => setHighlightTextarea(false), 2000);
          }}
        />

        {/* Resume Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            简历内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              if (errors.resumeText) setErrors((prev) => ({ ...prev, resumeText: undefined }));
            }}
            placeholder="请将你的简历内容粘贴到这里..."
            rows={10}
            className={cn(
              "mt-2 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20",
              highlightTextarea && "border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-50/50",
              !highlightTextarea && errors.resumeText
                ? "border-red-300 focus:border-red-400"
                : !highlightTextarea && "border-gray-200 focus:border-brand-400"
            )}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.resumeText ? (
              <p className="text-xs text-red-500">{errors.resumeText}</p>
            ) : (
              <p className="text-xs text-gray-400">至少 50 字，最多 12000 字</p>
            )}
            <p className={cn("text-xs", charCount < 50 ? "text-red-400" : "text-gray-400")}>
              {charCount} 字
            </p>
          </div>
          {charCount > 0 && onSwitchToEditor && (
            <button
              type="button"
              onClick={() => {
                if (onModulesParsed) {
                  const modules = parseResumeToModules(resumeText.trim());
                  onModulesParsed(modules);
                }
                onSwitchToEditor();
              }}
              className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-600 font-medium transition-colors"
            >
              <Layout className="h-3.5 w-3.5" />
              发送到可视化编辑器精细调整
            </button>
          )}
        </div>

        {/* Target Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            目标岗位 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => {
              setTargetRole(e.target.value);
              if (errors.targetRole) setErrors((prev) => ({ ...prev, targetRole: undefined }));
            }}
            placeholder="例如：高级前端工程师、产品经理、数据分析师"
            className={cn(
              "mt-2 w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20",
              errors.targetRole
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-brand-400"
            )}
          />
          {errors.targetRole && (
            <p className="mt-1 text-xs text-red-500">{errors.targetRole}</p>
          )}
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-brand-600"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                showAdvanced && "rotate-180",
              )}
            />
            高级选项
            <span className="text-xs text-gray-400 font-normal">
              （行业、经验、求职类型、优化强度）
            </span>
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-6 animate-fade-in">
            {/* Industry */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">目标行业</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="例如：互联网、金融、医疗、教育（留空表示不限）"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">经验年限</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((lv) => (
                  <button
                    key={lv.value}
                    type="button"
                    onClick={() => setExperienceLevel(lv.value)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      experienceLevel === lv.value
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {lv.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">求职类型</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {JOB_TYPES.map((jt) => (
                  <button
                    key={jt.value}
                    type="button"
                    onClick={() => setJobType(jt.value)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      jobType === jt.value
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {jt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optimize Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">优化强度</label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {OPTIMIZE_LEVELS.map((ol) => (
                  <button
                    key={ol.value}
                    type="button"
                    onClick={() => setOptimizeLevel(ol.value)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      optimizeLevel === ol.value
                        ? "border-brand-500 bg-brand-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        optimizeLevel === ol.value ? "text-brand-700" : "text-gray-700"
                      )}
                    >
                      {ol.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{ol.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all",
              loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-[0.98]"
            )}
          >
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                正在优化中...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                开始优化
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            清空
          </button>
        </div>
      </form>

      {loading && <LoadingState />}

      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div ref={resultRef} />
    </>
  );
}

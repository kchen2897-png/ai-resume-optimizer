"use client";

import { useState, useEffect } from "react";
import { Sparkles, Search, GitCompare, PenTool, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Search, label: "分析简历结构", sub: "识别教育背景、工作经历、技能模块" },
  { icon: GitCompare, label: "匹配关键词", sub: "对照目标岗位提取核心能力词" },
  { icon: Sparkles, label: "生成优化内容", sub: "AI 重写简历，强化亮点与匹配度" },
  { icon: PenTool, label: "排版润色", sub: "优化措辞与格式，确保专业呈现" },
];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        setActiveStep(i);
        setCompleted((prev) => [...prev, i - 1].filter((n) => n >= 0));
      }, i * 2200 + 600);
      timers.push(t);
    });

    // Mark all complete at the end
    const allDone = setTimeout(() => {
      setCompleted([0, 1, 2, 3]);
      setActiveStep(3);
    }, STEPS.length * 2200 + 400);
    timers.push(allDone);

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Main spinner */}
      <div className="relative mb-10">
        <div className="absolute inset-0 animate-ping rounded-full bg-brand-400/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg">
          <Sparkles className="h-7 w-7 animate-pulse text-white" />
        </div>
      </div>

      <p className="text-lg font-semibold text-gray-700">正在优化中...</p>

      {/* Steps */}
      <div className="mt-8 w-full max-w-xs space-y-2">
        {STEPS.map((step, i) => {
          const isDone = completed.includes(i);
          const isActive = activeStep === i;

          return (
            <div
              key={step.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500",
                isActive && "bg-brand-50 border border-brand-200 shadow-sm",
                isDone && "bg-transparent",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                  isDone && "bg-emerald-100",
                  isActive && "bg-brand-200",
                  !isDone && !isActive && "bg-gray-100",
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <step.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-brand-700" : "text-gray-400",
                    )}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    isDone ? "text-gray-400" : isActive ? "text-brand-800" : "text-gray-400",
                  )}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p className="mt-0.5 text-xs text-brand-500 animate-fade-in">{step.sub}</p>
                )}
              </div>
              {isActive && !isDone && (
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500"
                      style={{ animationDelay: `${j * 120}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

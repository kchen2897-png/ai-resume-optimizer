"use client";

import Link from "next/link";
import { Sparkles, Pencil, ArrowRight, ChevronDown } from "lucide-react";
import LandingUpload from "@/components/LandingUpload";

export default function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          AI 简历工具箱
        </h1>
        <p className="text-lg text-gray-500">
          上传简历 PDF，AI 自动解析、优化、排版，导出专业简历
        </p>
      </div>

      {/* Upload Zone */}
      <LandingUpload />

      {/* Divider */}
      <div className="my-12 flex w-full max-w-xl items-center gap-4">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-400">或者手动输入</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Two cards as secondary options */}
      <div className="grid w-full max-w-2xl gap-5 md:grid-cols-2">
        {/* Optimizer card */}
        <Link
          href="/optimizer"
          className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="mb-1.5 text-lg font-semibold text-gray-900">AI 简历优化器</h2>
          <p className="mb-3 text-sm text-gray-500">粘贴简历文本，AI 逐段对比优化</p>
          <ul className="mb-5 space-y-1.5 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">·</span>逐段对比原文与优化版
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">·</span>ATS 关键词匹配分析与评分
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">·</span>精确到每句话的修改建议
            </li>
          </ul>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700">
            进入优化器 <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* Builder card */}
        <Link
          href="/builder"
          className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
            <Pencil className="h-4 w-4" />
          </div>
          <h2 className="mb-1.5 text-lg font-semibold text-gray-900">AI 简历制作器</h2>
          <p className="mb-3 text-sm text-gray-500">可视化编辑，AI 辅助排版与润色</p>
          <ul className="mb-5 space-y-1.5 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-purple-500">·</span>拖拽模块自由搭建简历
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-purple-500">·</span>AI 一键润色每条描述
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-purple-500">·</span>A4 实时预览，导出 PDF/HTML
            </li>
          </ul>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 transition-colors group-hover:text-purple-700">
            进入制作器 <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      <footer className="mt-14 text-center text-sm text-gray-400">
        <p>
          Powered by{" "}
          <span className="font-medium" style={{ color: "#4D6BFE" }}>
            DeepSeek
          </span>
          {" · "}
          PDF 文字提取由{" "}
          <span className="font-medium text-gray-500">PyMuPDF</span> 驱动
        </p>
        <p className="mt-1">你的简历数据不会被存储</p>
      </footer>
    </main>
  );
}

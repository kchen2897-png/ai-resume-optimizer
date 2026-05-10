import Link from "next/link";
import { Sparkles, Pencil, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          AI 简历工具箱
        </h1>
        <p className="text-lg text-gray-500">
          专业的 AI 简历优化与制作平台
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
        {/* Optimizer card */}
        <Link
          href="/optimizer"
          className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">AI 简历优化器</h2>
          <p className="mb-4 text-sm text-gray-500">粘贴简历文本，AI 逐段对比优化</p>
          <ul className="mb-6 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">·</span>
              逐行对比原文与优化版
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">·</span>
              ATS 关键词匹配分析
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">·</span>
              精确到句的修改建议
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">·</span>
              综合评分与面试亮点
            </li>
          </ul>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700">
            进入优化器 <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        {/* Builder card */}
        <Link
          href="/builder"
          className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
            <Pencil className="h-5 w-5" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">AI 简历制作器</h2>
          <p className="mb-4 text-sm text-gray-500">从零开始，AI 辅助制作专业简历</p>
          <ul className="mb-6 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-purple-500">·</span>
              拖拽模块自由搭建简历
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-purple-500">·</span>
              AI 一键润色每条描述
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-purple-500">·</span>
              A4 实时预览效果
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-purple-500">·</span>
              导出 HTML / 纯文本
            </li>
          </ul>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 transition-colors group-hover:text-purple-700">
            进入制作器 <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <footer className="mt-16 text-center text-sm text-gray-400">
        <p>
          Powered by{" "}
          <span className="font-medium" style={{ color: "#4D6BFE" }}>DeepSeek</span>
        </p>
        <p className="mt-1">你的简历数据不会被存储</p>
      </footer>
    </main>
  );
}

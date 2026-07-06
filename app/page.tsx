"use client";

import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import LandingUpload from "@/components/LandingUpload";

export default function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          AI 简历工作台
        </h1>
        <p className="text-lg text-gray-500">
          上传简历后直接编辑、优化、排版并导出专业 PDF
        </p>
      </div>

      <LandingUpload />

      <div className="my-12 flex w-full max-w-xl items-center gap-4">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-400">或者</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <Link
        href="/builder"
        className="group flex w-full max-w-xl items-center gap-4 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
          <Pencil className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h2 className="text-lg font-semibold text-gray-900">进入简历工作台</h2>
          <p className="mt-1 text-sm text-gray-500">
            从空白简历开始，或在编辑器中使用 AI 优化、局部润色、排版适配和 PDF 导出
          </p>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-purple-500 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <footer className="mt-14 text-center text-sm text-gray-400">
        <p>
          Powered by{" "}
          <span className="font-medium" style={{ color: "#4D6BFE" }}>
            DeepSeek
          </span>{" "}
          · PDF 提取与服务端导出已适配 Vercel
        </p>
        <p className="mt-1">你的简历数据不会被存储</p>
      </footer>
    </main>
  );
}

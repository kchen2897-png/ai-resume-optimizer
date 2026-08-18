"use client";

import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import LandingUpload from "@/components/LandingUpload";
import PasteResumeForm from "@/components/PasteResumeForm";

export default function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          AI 简历工作台
        </h1>
        <p className="text-lg text-gray-500">
          直接编辑、AI 优化、排版并导出专业 PDF
        </p>
      </div>

      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <Link
            href="/builder"
            className="group flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition-colors group-hover:bg-gray-800">
              <Pencil className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="text-lg font-semibold text-gray-900">进入简历工作台</h2>
              <p className="mt-1 text-sm text-gray-500">
                从空白简历开始，分模块编辑、AI 润色、调换顺序和导出 PDF
              </p>
            </div>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <PasteResumeForm compact />
        </div>

        <LandingUpload />
      </div>

      <footer className="mt-14 text-center text-sm text-gray-400">
        <p>
          Powered by{" "}
          <span className="font-medium" style={{ color: "#4D6BFE" }}>
            DeepSeek
          </span>{" "}
          · PDF 导入为增强功能，工作台可独立使用
        </p>
        <p className="mt-1">你的简历数据不会被存储</p>
      </footer>
    </main>
  );
}

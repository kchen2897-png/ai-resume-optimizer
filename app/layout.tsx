import type { Metadata } from "next";
import NavHeader from "@/components/NavHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 简历工具箱 - 智能优化与制作",
  description:
    "上传简历 PDF，AI 自动解析、优化、排版，导出专业简历。支持 PyMuPDF 精准文字提取。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <NavHeader />
        {children}
      </body>
    </html>
  );
}

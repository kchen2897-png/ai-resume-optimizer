import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 简历工具箱 - 智能优化与制作",
  description:
    "专业的 AI 简历优化与制作平台。逐段对比优化你的简历，或用可视化编辑器从零搭建专业简历。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {children}
      </body>
    </html>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OptimizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
          <span className="text-sm font-semibold text-gray-800">AI 简历优化器</span>
        </div>
      </nav>
      {children}
    </div>
  );
}

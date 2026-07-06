"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页", icon: Home },
  { href: "/builder", label: "简历工作台", icon: Pencil },
];

export default function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-gray-800 transition-colors hover:text-brand-600"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500 text-xs text-white">
            AI
          </span>
          简历工具箱
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

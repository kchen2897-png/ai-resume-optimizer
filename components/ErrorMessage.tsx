"use client";

import { AlertCircle, X, Key, ExternalLink } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  const isApiKeyError =
    message.includes("API") || message.includes("key") || message.includes("auth") ||
    message.includes("DEEPSEEK_API_KEY") || message.includes("配置") || message.includes("不可用");

  if (isApiKeyError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Key className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">未配置 API Key</p>
          <p className="mt-1 text-sm text-amber-700">{message}</p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3">
            <p className="text-xs font-semibold text-gray-700">如何配置：</p>
            <ol className="mt-1.5 list-inside list-decimal space-y-0.5 text-xs text-gray-600">
              <li>在项目根目录创建 <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] font-mono">.env.local</code> 文件</li>
              <li>
                添加{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] font-mono">
                  DEEPSEEK_API_KEY=your-api-key-here
                </code>
              </li>
              <li>
                获取 Key：{" "}
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 font-medium text-brand-600 hover:text-brand-700 underline"
                >
                  platform.deepseek.com <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>重启 <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] font-mono">npm run dev</code></li>
            </ol>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-lg p-1 text-amber-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">优化失败</p>
        <p className="mt-1 text-sm text-red-600">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

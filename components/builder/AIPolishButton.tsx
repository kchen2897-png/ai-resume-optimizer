"use client";

import { useState } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";

interface Props {
  rawText: string;
  fieldType: 'bullet' | 'description' | 'content' | 'title';
  context?: string;
  targetRole?: string;
  onApply: (polishedText: string) => void;
  className?: string;
}

export default function AIPolishButton({ rawText, fieldType, context, targetRole, onApply, className }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'preview' | 'applied'>('idle');
  const [polishedText, setPolishedText] = useState("");
  const [improvements, setImprovements] = useState<string[]>([]);
  const [error, setError] = useState("");

  async function handlePolish() {
    if (!rawText.trim()) return;
    setStatus('loading');
    setError("");

    try {
      const res = await fetch("/api/builder/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: rawText.trim(), fieldType, context, targetRole }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPolishedText(json.data.polishedText);
      setImprovements(json.data.improvements || []);
      setStatus('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : "润色失败");
      setStatus('idle');
    }
  }

  function handleAccept() {
    onApply(polishedText);
    setStatus('applied');
    setTimeout(() => setStatus('idle'), 1500);
  }

  function handleReject() {
    setStatus('idle');
    setPolishedText("");
    setImprovements([]);
  }

  if (status === 'applied') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <Check className="h-3 w-3" />
        已应用
      </span>
    );
  }

  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        AI 润色中...
      </span>
    );
  }

  if (status === 'preview') {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{polishedText}</p>
        {improvements.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {improvements.map((imp, i) => (
              <span key={i} className="rounded bg-white px-1.5 py-0.5 text-[10px] text-emerald-600">{imp}</span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={handleAccept} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-600">
            <Check className="h-3 w-3" />接受
          </button>
          <button onClick={handleReject} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <X className="h-3 w-3" />撤销
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePolish}
      className={className || "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"}
      title="AI 润色"
    >
      <Sparkles className="h-3 w-3" />
      润色
    </button>
  );
}

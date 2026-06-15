'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Copy, FileText, Code2, Check, File, Loader2 } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { serializeModulesToText, serializeModulesToHTML } from '@/lib/resume-serializer';
import { copyToClipboard } from '@/lib/utils';

export default function ExportMenu() {
  const { state } = useEditor();
  const { modules } = state.document;
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', outside);
      return () => document.removeEventListener('mousedown', outside);
    }
  }, [open]);

  async function copyText() {
    await copyToClipboard(serializeModulesToText(modules));
    setDone('text');
    setTimeout(() => setDone(null), 2000);
  }

  async function copyHTML() {
    await copyToClipboard(serializeModulesToHTML(modules));
    setDone('html');
    setTimeout(() => setDone(null), 2000);
  }

  async function downloadPDF() {
    setPdfLoading(true);
    setPdfError(null);
    setOpen(false);

    try {
      const res = await fetch('/api/builder/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: '未知错误' }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone('download-pdf');
      setTimeout(() => setDone(null), 2000);
    } catch (err) {
      console.error('PDF export failed:', err);
      setPdfError(err instanceof Error ? err.message : 'PDF 导出失败，请稍后重试');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={pdfLoading}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
      >
        {pdfLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {pdfLoading ? '生成中...' : '导出'}
      </button>

      {pdfError && (
        <p className="mt-1.5 text-xs text-red-500">{pdfError}</p>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-lg z-50 py-1 animate-fade-in">
          <button
            onClick={copyText}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
          >
            {done === 'text' ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <FileText className="h-4 w-4 text-gray-400" />
            )}
            <div>
              <p className="font-medium">复制为纯文本</p>
              <p className="text-xs text-gray-400">粘贴到任意文本框</p>
            </div>
          </button>

          <button
            onClick={copyHTML}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
          >
            {done === 'html' ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Code2 className="h-4 w-4 text-gray-400" />
            )}
            <div>
              <p className="font-medium">复制为 HTML</p>
              <p className="text-xs text-gray-400">保留格式的富文本</p>
            </div>
          </button>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={downloadPDF}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
          >
            {done === 'download-pdf' ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <File className="h-4 w-4 text-red-400" />
            )}
            <div>
              <p className="font-medium">导出为 PDF</p>
              <p className="text-xs text-gray-400">服务端渲染，一张 A4 纸</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

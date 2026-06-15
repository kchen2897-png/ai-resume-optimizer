"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorProvider, useEditor } from "@/contexts/EditorContext";
import VisualEditor from "@/components/editor/VisualEditor";
import FileUploadZone from "@/components/FileUploadZone";
import LoadingState from "@/components/LoadingState";
import { DEFAULT_BLOCK_STYLES } from "@/lib/editor-types";
import type { ResumeModule } from "@/lib/editor-types";
import { Plus, Upload } from "lucide-react";

// Local ID generator matching editor-types.ts pattern
let _nid = 0;
function nanoid(): string {
  return `${Date.now().toString(36)}${(_nid++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function hydrateModules(raw: any[]): ResumeModule[] {
  return raw.map((m, i) => {
    const items = m.items?.map((item: any) => ({
      ...item,
      id: item.id || nanoid(),
      bulletPoints: (item.bulletPoints || []).map((b: any) =>
        typeof b === 'string' ? b : (b.text || '')
      ),
    })) ?? [];
    const styles = { ...DEFAULT_BLOCK_STYLES };
    // Compute title font size: 3px larger than body, or keep existing
    styles.titleFontSize = styles.fontSize + 3;
    if (m.type === 'header') {
      styles.fontSize = 18;
      styles.titleFontSize = 18; // header name IS the title
      styles.paddingTop = 2;
      styles.paddingBottom = 6;
      styles.itemSpacing = 0;
    }
    return {
      ...m,
      id: m.id || nanoid(),
      order: i,
      styles,
      isCollapsed: false,
      items: items.length > 0 ? items : undefined,
    } as ResumeModule;
  });
}

function BuilderContent() {
  const [targetRole, setTargetRole] = useState("");
  const { state, dispatch } = useEditor();
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const modules = state.document.modules;
  const isEmpty = modules.length === 0 && !importing;

  // Entry point 1: Pre-parsed modules from landing upload (sessionStorage)
  // Entry point 2: Raw text from optimizer (localStorage, backward compat)
  useEffect(() => {
    // Priority 1: Pre-parsed modules (from landing upload or combined API)
    const storedModules = sessionStorage.getItem("resume-builder-modules");
    if (storedModules) {
      sessionStorage.removeItem("resume-builder-modules");
      try {
        const parsed = JSON.parse(storedModules);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const modules = hydrateModules(parsed);
          dispatch({ type: "LOAD_MODULES", modules });
          return;
        }
      } catch {
        // Fall through to raw text path
      }
    }

    // Priority 2: Raw text from optimizer (old flow, backward compat)
    const rawText = localStorage.getItem("resume-builder-import");
    if (!rawText) return;

    localStorage.removeItem("resume-builder-import");
    setImporting(true);

    fetch("/api/parse-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.modules?.length > 0) {
          const modules = hydrateModules(json.modules);
          dispatch({ type: "LOAD_MODULES", modules });
        }
      })
      .catch(() => {})
      .finally(() => setImporting(false));
  }, [dispatch]);

  const handleUploadComplete = useCallback((modules: ResumeModule[]) => {
    dispatch({ type: "LOAD_MODULES", modules });
    setUploading(false);
    setUploadError(null);
  }, [dispatch]);

  const handleStartFromScratch = useCallback(() => {
    // Add a header module to get started
    dispatch({ type: "ADD_MODULE", moduleType: "header" });
  }, [dispatch]);

  if (importing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingState />
          <p className="mt-4 text-sm text-gray-400">正在解析优化后的简历结构…</p>
        </div>
      </div>
    );
  }

  // Empty state: show upload zone + start from scratch
  if (isEmpty) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <div className="mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
              <Upload className="h-8 w-8 text-brand-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              导入你的简历
            </h2>
            <p className="text-sm text-gray-500">
              上传 PDF 简历，AI 自动解析结构化，开始编辑
            </p>
          </div>

          {/* Server-side upload: sends to /api/upload-resume */}
          {uploading ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-8">
              <LoadingState />
              <p className="mt-3 text-sm text-brand-600">AI 正在解析简历...</p>
            </div>
          ) : (
            <FileUploadZone
              onTextExtracted={async (text) => {
                setUploading(true);
                setUploadError(null);
                try {
                  // Raw text — send through parse-resume API
                  const res = await fetch("/api/parse-resume", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rawText: text }),
                  });
                  const json = await res.json();
                  if (json.success && json.modules?.length > 0) {
                    const modules = hydrateModules(json.modules);
                    dispatch({ type: "LOAD_MODULES", modules });
                  } else {
                    setUploadError(json.error || "解析失败");
                  }
                } catch {
                  setUploadError("AI 解析失败，请重试");
                } finally {
                  setUploading(false);
                }
              }}
              onModulesParsed={handleUploadComplete}
            />
          )}

          {uploadError && (
            <p className="mt-3 text-sm text-red-500">{uploadError}</p>
          )}

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-sm text-gray-400">或者</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Start from scratch */}
          <button
            onClick={handleStartFromScratch}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            从零开始搭建简历
          </button>

          <p className="mt-3 text-xs text-gray-400">
            手动添加模块，AI 辅助排版与润色
          </p>
        </div>
      </div>
    );
  }

  return (
    <VisualEditor
      targetRole={targetRole}
      onTargetRoleChange={setTargetRole}
    />
  );
}

export default function BuilderPage() {
  return (
    <EditorProvider>
      <BuilderContent />
    </EditorProvider>
  );
}

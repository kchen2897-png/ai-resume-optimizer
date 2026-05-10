"use client";

import { useState, useEffect } from "react";
import { EditorProvider, useEditor } from "@/contexts/EditorContext";
import VisualEditor from "@/components/editor/VisualEditor";
import LoadingState from "@/components/LoadingState";
import { nanoid } from "nanoid";
import { DEFAULT_BLOCK_STYLES } from "@/lib/editor-types";
import type { ResumeModule } from "@/lib/editor-types";

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
    if (m.type === 'header') {
      styles.fontSize = 22;
      styles.paddingTop = 4;
      styles.paddingBottom = 12;
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
  const { dispatch } = useEditor();
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const text = localStorage.getItem("resume-builder-import");
    if (!text) return;

    localStorage.removeItem("resume-builder-import");
    setImporting(true);

    fetch("/api/parse-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: text }),
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

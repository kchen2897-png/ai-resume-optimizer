'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import EditorToolbar from './EditorToolbar';
import EditorStyleToolbar from './EditorStyleToolbar';
import EditorCanvas from './EditorCanvas';
import ResumePreview from './ResumePreview';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { serializeModulesToText } from '@/lib/resume-serializer';
import type { BlockStyles } from '@/lib/editor-types';

interface Props {
  targetRole?: string;
  onTargetRoleChange?: (role: string) => void;
}

export default function VisualEditor({ targetRole = '', onTargetRoleChange }: Props) {
  const { state, dispatch } = useEditor();
  const { modules } = state.document;
  const [loading, setLoading] = useState(false);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch({ type: 'SELECT_MODULE', id: null });
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const handleAutoLayout = useCallback(async () => {
    const text = serializeModulesToText(modules);
    if (!text.trim() || modules.length === 0) return;

    setLayoutLoading(true);
    try {
      const res = await fetch('/api/builder/auto-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text.trim(), moduleCount: modules.length }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const layout = json.data;

      // Apply styles to all modules
      modules.forEach((mod) => {
        const styles: Partial<BlockStyles> = {
          lineHeight: layout.lineHeight,
        };

        if (mod.type === 'header') {
          // Header name uses headerFontSize (22-26px range)
          styles.fontSize = layout.headerFontSize;
          styles.paddingTop = Math.round(layout.sectionGap * 0.3);
          styles.paddingBottom = Math.round(layout.sectionGap * 0.7);
        } else {
          // Body text uses baseFontSize (10-16px range); title is baseFontSize+3 in preview
          styles.fontSize = layout.baseFontSize;
          styles.paddingTop = Math.round(layout.sectionGap / 2);
          styles.paddingBottom = Math.round(layout.sectionGap / 2);
        }

        dispatch({ type: 'UPDATE_MODULE_STYLES', id: mod.id, styles });
      });
    } catch (err) {
      console.error('Auto-layout failed:', err);
    } finally {
      setLayoutLoading(false);
    }
  }, [modules, dispatch]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="px-2 py-3">
        <EditorToolbar
          targetRole={targetRole}
          onTargetRoleChange={onTargetRoleChange}
          loading={loading}
          layoutLoading={layoutLoading}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onGlobalSuggest={(text) => { setSuggestionText(text); setShowSuggestions(true); }}
          onAutoLayout={handleAutoLayout}
        />
      </div>
      <EditorStyleToolbar />
      {loading && <div className="px-2"><LoadingState /></div>}
      {error && <div className="px-2"><ErrorMessage message={error} onDismiss={() => setError(null)} /></div>}
      <div className="flex flex-1 overflow-hidden">
        {showPreview ? (
          <div className="w-[440px] flex-shrink-0 border-r border-gray-200 overflow-y-auto">
            <div className="px-2 py-2 border-b border-gray-100 bg-gray-50/50"><p className="text-xs font-medium text-gray-500 px-2">编辑模块</p></div>
            <EditorCanvas targetRole={targetRole} />
          </div>
        ) : (
          <div className="flex-1"><EditorCanvas targetRole={targetRole} /></div>
        )}
        {showPreview && (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs font-medium text-gray-500">A4 简历预览</span>
              <span className="text-xs text-gray-300">实时同步</span>
            </div>
            <ResumePreview />
          </div>
        )}
      </div>

      {showSuggestions && suggestionText && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowSuggestions(false)} />
          <AISuggestionsPanel resumeText={suggestionText} targetRole={targetRole} onClose={() => setShowSuggestions(false)} />
        </div>
      )}
    </div>
  );
}

// Inline import to avoid circular deps
import AISuggestionsPanel from '@/components/builder/AISuggestionsPanel';

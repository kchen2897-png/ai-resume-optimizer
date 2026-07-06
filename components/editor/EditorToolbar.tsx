'use client';

import { Undo2, Redo2, Eye, EyeOff, Sparkles, Layout, AlignJustify } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditor } from '@/contexts/EditorContext';
import { serializeModulesToText } from '@/lib/resume-serializer';
import AddBlockMenu from './AddBlockMenu';
import ExportMenu from './ExportMenu';
import LineSpacingControl from './LineSpacingControl';
import SpacingPanel from './SpacingPanel';

interface Props {
  targetRole: string;
  onTargetRoleChange?: (role: string) => void;
  loading: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
  onGlobalSuggest: (text: string) => void;
  onAutoLayout?: () => void;
  layoutLoading?: boolean;
}

export default function EditorToolbar({ targetRole, onTargetRoleChange, loading, showPreview, onTogglePreview, onGlobalSuggest, onAutoLayout, layoutLoading }: Props) {
  const { state, undo, redo, canUndo, canRedo } = useEditor();
  const { mode, modules } = state.document;

  function handleGlobalSuggest() {
    const text = serializeModulesToText(modules);
    if (text.trim()) onGlobalSuggest(text.trim());
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <span className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        mode === 'pre-optimize'
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      )}>
        {mode === 'pre-optimize' ? '编辑模式' : '已优化'}
      </span>
      {state.document.modules.length > 0 && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-400" title="草稿自动保存中，刷新不丢失">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          已自动保存
        </span>
      )}
      <div className="w-px h-6 bg-gray-200" />
      <AddBlockMenu />
      <button onClick={undo} disabled={!canUndo} className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed" title="撤销">
        <Undo2 className="h-4 w-4" />
      </button>
      <button onClick={redo} disabled={!canRedo} className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed" title="重做">
        <Redo2 className="h-4 w-4" />
      </button>

      {/* Target role input */}
      {onTargetRoleChange && (
        <>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">目标岗位</span>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => onTargetRoleChange(e.target.value)}
              placeholder="输入目标岗位..."
              className="w-36 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400/20"
            />
          </div>
        </>
      )}

      <div className="flex-1" />

      <LineSpacingControl />
      <SpacingPanel />

      {onAutoLayout && (
        <button
          onClick={onAutoLayout}
          disabled={layoutLoading || modules.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Layout className="h-4 w-4" />
          {layoutLoading ? '排版调整中...' : 'AI 排版适配'}
        </button>
      )}

      <button
        onClick={handleGlobalSuggest}
        disabled={loading || modules.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-4 w-4" />
        AI 优化
      </button>

      <button onClick={onTogglePreview} className={cn(
        'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
        showPreview ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
      )}>
        {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        {showPreview ? '隐藏预览' : '显示预览'}
      </button>
      <ExportMenu />
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, Check, ChevronDown } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';

const PRESETS = [
  { label: '紧凑', value: 12, desc: '适合内容多、需要挤在一页' },
  { label: '适中', value: 22, desc: '默认推荐间距' },
  { label: '宽松', value: 36, desc: '阅读舒适，模块区隔清晰' },
  { label: '舒适', value: 52, desc: '大气排版，充分留白' },
];

/**
 * Module spacing control.
 *
 * The actual visible gap between two modules in preview/PDF is:
 *   current.paddingBottom + next.paddingTop
 *
 * We split the target gap equally into paddingTop/paddingBottom on every module,
 * so the total visual gap = half + half = target value.
 */
export default function ModuleSpacingControl() {
  const { state, dispatch } = useEditor();
  const { modules } = state.document;
  const [open, setOpen] = useState(false);
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

  // Read current gap from any module: paddingTop + paddingBottom = total gap
  const firstMod = modules.length > 0 ? modules[0] : null;
  const currentGap = firstMod
    ? (firstMod.styles.paddingTop || 0) + (firstMod.styles.paddingBottom || 0)
    : 18;

  function handleSelect(value: number) {
    setOpen(false);
    const half = Math.round(value / 2);
    const remainder = value - half;
    modules.forEach((mod) => {
      dispatch({
        type: 'UPDATE_MODULE_STYLES',
        id: mod.id,
        styles: { paddingTop: half, paddingBottom: remainder },
      });
    });
  }

  const activePreset = PRESETS.find((p) => Math.abs(p.value - currentGap) <= 2);
  const displayLabel = activePreset?.label || `${currentGap}px`;

  if (modules.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        title="模块间距"
      >
        <GripVertical className="h-4 w-4" />
        <span className="hidden sm:inline">
          模块间距 <span className="text-brand-600">{displayLabel}</span>
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-gray-100 bg-white shadow-lg z-50 py-1 animate-fade-in">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500">模块间距</p>
            <p className="text-xs text-gray-400 mt-0.5">调整简历各模块之间的空白距离</p>
          </div>
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => handleSelect(p.value)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 text-left transition-colors',
                activePreset?.value === p.value && 'bg-brand-50'
              )}
            >
              <div>
                <span className={cn(
                  'font-medium',
                  activePreset?.value === p.value ? 'text-brand-700' : 'text-gray-700'
                )}>
                  {p.label}
                </span>
                <span className="ml-2 text-xs text-gray-400">{p.value}px</span>
                <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
              </div>
              {activePreset?.value === p.value && (
                <Check className="h-4 w-4 text-brand-600 flex-shrink-0" />
              )}
            </button>
          ))}
          {/* Custom input */}
          <div className="border-t border-gray-100 px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">自定义</span>
            <input
              type="number"
              min={0}
              max={120}
              step={2}
              defaultValue={activePreset ? '' : currentGap}
              placeholder="22"
              className="w-16 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-brand-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                  if (!isNaN(val) && val >= 0 && val <= 120) {
                    handleSelect(val);
                  }
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 120) {
                  handleSelect(val);
                }
              }}
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
        </div>
      )}
    </div>
  );
}

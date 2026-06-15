'use client';

import { useState, useRef, useEffect } from 'react';
import { AlignJustify, Check, ChevronDown } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';

const PRESETS = [
  { label: '紧凑', value: 1.2, desc: '适合信息密集的简历' },
  { label: '适中', value: 1.5, desc: '较紧凑但可读性好' },
  { label: '标准', value: 1.6, desc: '默认推荐间距' },
  { label: '宽松', value: 1.8, desc: '阅读舒适，占空间较多' },
  { label: '舒适', value: 2.0, desc: '一页两页的大间距' },
];

export default function LineSpacingControl() {
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

  // Get current line height from first non-header module (or default 1.6)
  const currentLineHeight = modules.length > 0
    ? (modules[0].styles.lineHeight || 1.6)
    : 1.6;

  function handleSelect(value: number) {
    setOpen(false);
    // Update ALL modules' lineHeight
    modules.forEach((mod) => {
      dispatch({ type: 'UPDATE_MODULE_STYLES', id: mod.id, styles: { lineHeight: value } });
    });
  }

  // Find matching preset (within 0.05 tolerance)
  const activePreset = PRESETS.find((p) => Math.abs(p.value - currentLineHeight) < 0.06);
  const displayLabel = activePreset?.label || `${currentLineHeight}`;

  if (modules.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        title="全局行间距"
      >
        <AlignJustify className="h-4 w-4" />
        <span className="hidden sm:inline">
          行间距 <span className="text-brand-600">{displayLabel}</span>
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-gray-100 bg-white shadow-lg z-50 py-1 animate-fade-in">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500">全局行间距</p>
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
                <span className="ml-2 text-xs text-gray-400">{p.value}</span>
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
              max={3.0}
              step={0.1}
              defaultValue={activePreset ? '' : currentLineHeight}
              placeholder="1.6"
              className="w-16 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-brand-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseFloat((e.target as HTMLInputElement).value);
                  if (!isNaN(val) && val >= 0 && val <= 3.0) {
                    handleSelect(val);
                  }
                }
              }}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 3.0) {
                  handleSelect(val);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, ChevronDown, Minus, Plus } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';

/**
 * Unified spacing control panel.
 * Two settings:
 * - 模块间距: gap between modules (controls paddingTop/paddingBottom)
 * - 条目间距: gap between items within a module (controls itemSpacing)
 */
export default function SpacingPanel() {
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

  if (modules.length === 0) return null;

  // Read current values from any module
  const firstMod = modules[0];
  const moduleGap = (firstMod.styles.paddingTop || 0) + (firstMod.styles.paddingBottom || 0);
  const itemSpacing = firstMod.styles.itemSpacing ?? 8;

  function setModuleGap(value: number) {
    const half = Math.round(value / 2);
    const remainder = value - half;
    modules.forEach((mod) => {
      dispatch({ type: 'UPDATE_MODULE_STYLES', id: mod.id, styles: { paddingTop: half, paddingBottom: remainder } });
    });
  }

  function setItemSpacing(value: number) {
    modules.forEach((mod) => {
      dispatch({ type: 'UPDATE_MODULE_STYLES', id: mod.id, styles: { itemSpacing: value } });
    });
  }

  function adjustModuleGap(delta: number) {
    setModuleGap(Math.max(0, Math.min(120, moduleGap + delta)));
  }

  function adjustItemSpacing(delta: number) {
    setItemSpacing(Math.max(0, Math.min(120, itemSpacing + delta)));
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        title="间距设置"
      >
        <GripVertical className="h-4 w-4" />
        <span className="hidden sm:inline">间距</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-xl z-50 p-4 animate-fade-in space-y-5">
          {/* ── Module Spacing ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-700">模块间距</p>
                <p className="text-xs text-gray-400">教育、经历等模块之间的距离</p>
              </div>
              <span className="text-lg font-bold text-brand-600 tabular-nums">{moduleGap}px</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustModuleGap(-4)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="range"
                min={0}
                max={80}
                value={moduleGap}
                onChange={(e) => setModuleGap(parseInt(e.target.value, 10))}
                className="flex-1 h-1.5 accent-brand-500 cursor-pointer"
                style={{ accentColor: '#5c7cfa' }}
              />
              <button
                onClick={() => adjustModuleGap(4)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Preset quick buttons */}
            <div className="flex gap-1.5 mt-2">
              {[
                { label: '紧', value: 8 },
                { label: '适中', value: 16 },
                { label: '松', value: 28 },
                { label: '宽', value: 44 },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setModuleGap(p.value)}
                  className={cn(
                    'flex-1 rounded-md border py-1 text-xs font-medium transition-colors',
                    Math.abs(moduleGap - p.value) <= 2
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  {p.label}
                  <span className="block text-[10px] opacity-60">{p.value}px</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Item Spacing ── */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-700">条目间距</p>
                <p className="text-xs text-gray-400">同一模块内各条经历之间的距离</p>
              </div>
              <span className="text-lg font-bold text-brand-600 tabular-nums">{itemSpacing}px</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustItemSpacing(-4)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="range"
                min={0}
                max={80}
                value={itemSpacing}
                onChange={(e) => setItemSpacing(parseInt(e.target.value, 10))}
                className="flex-1 h-1.5 cursor-pointer"
                style={{ accentColor: '#5c7cfa' }}
              />
              <button
                onClick={() => adjustItemSpacing(4)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[
                { label: '紧', value: 4 },
                { label: '适中', value: 10 },
                { label: '松', value: 18 },
                { label: '宽', value: 30 },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setItemSpacing(p.value)}
                  className={cn(
                    'flex-1 rounded-md border py-1 text-xs font-medium transition-colors',
                    Math.abs(itemSpacing - p.value) <= 2
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  {p.label}
                  <span className="block text-[10px] opacity-60">{p.value}px</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual hint */}
          <div className="border-t border-gray-100 pt-3">
            <div className="rounded-lg bg-gray-50 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="font-medium">📐 预览示意</span>
                <span className="text-gray-300">A4纸</span>
              </div>
              <div className="rounded bg-white border border-gray-200 px-2 py-1.5">
                <div className="h-0.5 bg-gray-300 rounded" />
                {/* Module gap visual */}
                <div style={{ height: moduleGap > 24 ? 12 : (moduleGap > 12 ? 6 : 2) }} className="transition-all" />
                <div className="rounded bg-brand-100 px-2 py-1 text-[10px] text-brand-600 font-medium">教育经历</div>
                {/* Item spacing visual */}
                <div style={{ height: itemSpacing > 24 ? 12 : (itemSpacing > 12 ? 6 : 2) }} className="transition-all" />
                <div className="rounded bg-amber-50 px-2 py-0.5 text-[9px] text-amber-600">└ 条目 1</div>
                <div style={{ height: itemSpacing > 24 ? 12 : (itemSpacing > 12 ? 6 : 2) }} className="transition-all" />
                <div className="rounded bg-amber-50 px-2 py-0.5 text-[9px] text-amber-600">└ 条目 2</div>
                {/* Module gap */}
                <div style={{ height: moduleGap > 24 ? 12 : (moduleGap > 12 ? 6 : 2) }} className="transition-all" />
                <div className="rounded bg-brand-100 px-2 py-1 text-[10px] text-brand-600 font-medium">实习经历</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

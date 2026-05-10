'use client';

import { X, Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, COLOR_SWATCHES } from '@/lib/editor-types';
import type { BlockStyles } from '@/lib/editor-types';
import { cn } from '@/lib/utils';

export default function EditorStyleToolbar() {
  const { state, dispatch } = useEditor();
  const { modules, selectedModuleId } = state.document;

  const mod = modules.find((m) => m.id === selectedModuleId);
  if (!mod) return null;

  const { styles } = mod;

  function update(partial: Partial<BlockStyles>) {
    dispatch({ type: 'UPDATE_MODULE_STYLES', id: mod!.id, styles: partial });
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 overflow-x-auto">
      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap mr-2">{mod.title}</span>
      <div className="w-px h-6 bg-gray-200" />
      <select value={styles.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })} className="h-8 rounded-lg border border-gray-200 px-2 text-xs bg-white cursor-pointer outline-none focus:border-brand-400">
        {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
      <select value={styles.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })} className="h-8 w-16 rounded-lg border border-gray-200 px-1.5 text-xs bg-white cursor-pointer outline-none focus:border-brand-400">
        {FONT_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="w-px h-6 bg-gray-200" />
      <button onClick={() => update({ fontWeight: styles.fontWeight === 'bold' ? 'normal' : 'bold' })} className={cn('h-8 w-8 flex items-center justify-center rounded-lg', styles.fontWeight === 'bold' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100')}><Bold className="h-4 w-4" /></button>
      <button onClick={() => update({ fontStyle: styles.fontStyle === 'italic' ? 'normal' : 'italic' })} className={cn('h-8 w-8 flex items-center justify-center rounded-lg', styles.fontStyle === 'italic' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100')}><Italic className="h-4 w-4" /></button>
      <button onClick={() => update({ textDecoration: styles.textDecoration === 'underline' ? 'none' : 'underline' })} className={cn('h-8 w-8 flex items-center justify-center rounded-lg', styles.textDecoration === 'underline' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100')}><Underline className="h-4 w-4" /></button>
      <div className="w-px h-6 bg-gray-200" />
      <button onClick={() => update({ textAlign: 'left' })} className={cn('h-8 w-8 flex items-center justify-center rounded-lg', styles.textAlign === 'left' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100')}><AlignLeft className="h-4 w-4" /></button>
      <button onClick={() => update({ textAlign: 'center' })} className={cn('h-8 w-8 flex items-center justify-center rounded-lg', styles.textAlign === 'center' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100')}><AlignCenter className="h-4 w-4" /></button>
      <button onClick={() => update({ textAlign: 'right' })} className={cn('h-8 w-8 flex items-center justify-center rounded-lg', styles.textAlign === 'right' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100')}><AlignRight className="h-4 w-4" /></button>
      <div className="w-px h-6 bg-gray-200" />
      {COLOR_SWATCHES.map((color) => (
        <button key={color} onClick={() => update({ color })} className={cn('h-6 w-6 rounded-full border-2 transition-all flex-shrink-0', styles.color === color ? 'border-brand-500 scale-110 ring-2 ring-brand-200' : 'border-gray-200 hover:scale-105')} style={{ backgroundColor: color }} />
      ))}
      <div className="flex-1" />
      <button onClick={() => dispatch({ type: 'REMOVE_MODULE', id: mod.id })} className="h-8 px-3 flex items-center gap-1 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />删除</button>
      <button onClick={() => dispatch({ type: 'SELECT_MODULE', id: null })} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

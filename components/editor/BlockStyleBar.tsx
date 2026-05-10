'use client';

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { BlockStyles } from '@/lib/editor-types';
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, COLOR_SWATCHES } from '@/lib/editor-types';
import { cn } from '@/lib/utils';

interface Props {
  styles: BlockStyles;
  onChange: (styles: Partial<BlockStyles>) => void;
}

export default function BlockStyleBar({ styles, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm">
      {/* Font family */}
      <select
        value={styles.fontFamily}
        onChange={(e) => onChange({ fontFamily: e.target.value })}
        className="h-7 rounded px-1.5 text-xs border border-gray-200 bg-white text-gray-700 cursor-pointer outline-none focus:border-brand-400"
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* Font size */}
      <select
        value={styles.fontSize}
        onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
        className="h-7 w-14 rounded px-1 text-xs border border-gray-200 bg-white text-gray-700 cursor-pointer outline-none focus:border-brand-400"
      >
        {FONT_SIZE_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}px</option>
        ))}
      </select>

      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Bold */}
      <button
        onClick={() => onChange({ fontWeight: styles.fontWeight === 'bold' ? 'normal' : 'bold' })}
        className={cn(
          'h-7 w-7 flex items-center justify-center rounded text-xs transition-colors',
          styles.fontWeight === 'bold' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100',
        )}
        title="粗体"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>

      {/* Italic */}
      <button
        onClick={() => onChange({ fontStyle: styles.fontStyle === 'italic' ? 'normal' : 'italic' })}
        className={cn(
          'h-7 w-7 flex items-center justify-center rounded text-xs transition-colors',
          styles.fontStyle === 'italic' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100',
        )}
        title="斜体"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>

      {/* Underline */}
      <button
        onClick={() => onChange({ textDecoration: styles.textDecoration === 'underline' ? 'none' : 'underline' })}
        className={cn(
          'h-7 w-7 flex items-center justify-center rounded text-xs transition-colors',
          styles.textDecoration === 'underline' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100',
        )}
        title="下划线"
      >
        <Underline className="h-3.5 w-3.5" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Alignment */}
      <button
        onClick={() => onChange({ textAlign: 'left' })}
        className={cn(
          'h-7 w-7 flex items-center justify-center rounded transition-colors',
          styles.textAlign === 'left' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100',
        )}
        title="左对齐"
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onChange({ textAlign: 'center' })}
        className={cn(
          'h-7 w-7 flex items-center justify-center rounded transition-colors',
          styles.textAlign === 'center' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100',
        )}
        title="居中"
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onChange({ textAlign: 'right' })}
        className={cn(
          'h-7 w-7 flex items-center justify-center rounded transition-colors',
          styles.textAlign === 'right' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100',
        )}
        title="右对齐"
      >
        <AlignRight className="h-3.5 w-3.5" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Color swatches */}
      {COLOR_SWATCHES.map((color) => (
        <button
          key={color}
          onClick={() => onChange({ color })}
          className={cn(
            'h-5 w-5 rounded-full border-2 transition-all',
            styles.color === color ? 'border-brand-500 scale-110' : 'border-transparent hover:scale-105',
          )}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}

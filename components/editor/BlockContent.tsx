'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { BlockStyles } from '@/lib/editor-types';

interface Props {
  content: string;
  onChange: (content: string) => void;
  styles: BlockStyles;
  placeholder?: string;
}

export default function BlockContent({ content, onChange, styles, placeholder }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [content, autoResize]);

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => {
        onChange(e.target.value);
        // Auto-resize is handled by the effect, but we trigger it immediately for responsiveness
        requestAnimationFrame(autoResize);
      }}
      placeholder={placeholder}
      rows={1}
      className="w-full resize-none bg-transparent outline-none placeholder:text-gray-300"
      style={{
        fontFamily: `${styles.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        fontSize: `${styles.fontSize}px`,
        fontWeight: styles.fontWeight,
        fontStyle: styles.fontStyle,
        textDecoration: styles.textDecoration,
        color: styles.color,
        textAlign: styles.textAlign,
        lineHeight: styles.lineHeight,
      }}
    />
  );
}

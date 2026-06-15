'use client';

import { useRef, useEffect } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { FileText } from 'lucide-react';
import { parseHeader as parseHeaderPreview } from '@/lib/header-parser';
import ExperienceHeader from './ExperienceHeader';
import { isGridModule } from '@/lib/editor-types';

const GRID = '2.2fr 1.2fr 1fr 1.4fr';

// ── BulletList ────────────────────────────────────────────────
function BulletList({ points, fontSize = 13, lineHeight = 1.55, gap = 6 }: { points: string[]; fontSize?: number; lineHeight?: number; gap?: number }) {
  const clean = points
    .map((p) => (p || '').replace(/^[-•·]\s*/, '').trim())
    .filter(Boolean);
  if (!clean.length) return null;
  return (
    <>
      {clean.map((point, i) => (
        <div key={i} style={{ gridColumn: '1 / -1', display: 'flex', gap, fontSize, lineHeight, color: '#0f172a', paddingLeft: 2 }}>
          <span style={{ marginTop: '0.55em', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0 }} />
          <span>{point}</span>
        </div>
      ))}
    </>
  );
}

function fmtDate(item: any): string {
  if (item.startDate && item.endDate) return `${item.startDate} - ${item.endDate}`;
  return '';
}

function EducationPreview({ item, fontSize = 13, lineHeight = 1.55, gap = 6 }: { item: any; fontSize?: number; lineHeight?: number; gap?: number }) {
  return (
    <>
      <ExperienceHeader
        left={item.school}
        middle={item.major}
        right={item.degree}
        date={fmtDate(item)}
      />
      {item.gpa && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap, fontSize, lineHeight, color: '#0f172a', paddingLeft: 2 }}>
          <span style={{ marginTop: '0.55em', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0 }} />
          <span>GPA：{item.gpa}</span>
        </div>
      )}
      {item.courses && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap, fontSize, lineHeight, color: '#0f172a', paddingLeft: 2 }}>
          <span style={{ marginTop: '0.55em', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0 }} />
          <span>核心课程：{item.courses}</span>
        </div>
      )}
      {item.awards && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap, fontSize, lineHeight, color: '#0f172a', paddingLeft: 2 }}>
          <span style={{ marginTop: '0.55em', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0 }} />
          <span>获奖：{item.awards}</span>
        </div>
      )}
      <BulletList points={item.bulletPoints || []} fontSize={fontSize} lineHeight={lineHeight} gap={gap} />
    </>
  );
}

type ExpItem = { organization: string; department: string; role: string; startDate: string; endDate: string; bulletPoints: string[] };

function ExperiencePreview({ item, fontSize = 13, lineHeight = 1.55, gap = 6 }: { item: any; fontSize?: number; lineHeight?: number; gap?: number }) {
  return (
    <>
      <ExperienceHeader
        left={item.organization}
        middle={item.department}
        right={item.role}
        date={fmtDate(item)}
      />
      <BulletList points={item.bulletPoints || []} fontSize={fontSize} lineHeight={lineHeight} gap={gap} />
    </>
  );
}

function ProjectPreview({ item, fontSize = 13, lineHeight = 1.55, gap = 6 }: { item: any; fontSize?: number; lineHeight?: number; gap?: number }) {
  return (
    <>
      <ExperienceHeader
        left={item.name}
        middle=""
        right={item.role}
        date={fmtDate(item)}
      />
      <BulletList points={item.bulletPoints || []} fontSize={fontSize} lineHeight={lineHeight} gap={gap} />
    </>
  );
}

export default function ResumePreview() {
  const { state } = useEditor();
  const { modules } = state.document;
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const sorted = modules.slice().sort((a, b) => a.order - b.order);
  const visible = sorted.filter((m) => !m.isCollapsed);

  // Re-center vertically when modules change
  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;
    inner.style.marginTop = '0';
    requestAnimationFrame(() => {
      const contentH = inner.getBoundingClientRect().height;
      const targetH = container.getBoundingClientRect().height;
      if (contentH < targetH) {
        inner.style.marginTop = ((targetH - contentH) / 2) + 'px';
      } else {
        inner.style.marginTop = '0';
      }
    });
  }, [modules]);

  // ── EMPTY ──
  if (!visible.length) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#e5e7eb', minHeight: 600 }}>
        <div className="text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">暂无简历内容</p>
          <p className="text-xs text-gray-300">请先导入简历或添加模块</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex justify-center overflow-y-auto"
      style={{ background: '#e5e7eb', padding: '32px 16px' }}
    >
      <div
        ref={innerRef}
        style={{
          width: 794,                     // A4 width at ~96dpi (210mm)
          minHeight: 1123,                // A4 height (297mm)
          background: '#fff',
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          padding: 60,                    // ~15mm
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          boxSizing: 'border-box',
        }}
      >
        {visible.map((mod, mi) => {
          const s = mod.styles;
          const font = `${s.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
          const isLast = mi === visible.length - 1;
          const gridType = isGridModule(mod.type);
          // Dynamic spacing: use itemSpacing for all gaps, default 8
          const isp = s.itemSpacing ?? 8;

          return (
            <div key={mod.id}>
              {/* Header */}
              {mod.type === 'header' && (() => {
                const parsed = parseHeaderPreview(mod.content);
                const photo = (mod as any).photo as string | undefined;
                const hasPhoto = !!photo;

                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isp + 6 }}>
                    <div style={{ flex: 1 }}>
                      {parsed.name ? (
                        <h1 style={{ fontFamily: font, fontSize: s.fontSize, fontWeight: 700, color: s.color, lineHeight: 1.3, marginBottom: parsed.contacts.length ? 2 : 0 }}>
                          {parsed.name}
                        </h1>
                      ) : !hasPhoto ? (
                        <h1 style={{ fontFamily: font, fontSize: s.fontSize, fontWeight: 700, color: s.color, lineHeight: 1.3, whiteSpace: 'pre-wrap' }}>
                          {mod.content}
                        </h1>
                      ) : null}
                      {parsed.contacts.length > 0 && (
                        <div style={{ fontFamily: font, fontSize: Math.round(s.fontSize * 0.5), color: '#64748b', lineHeight: 1.5 }}>
                          {parsed.contacts.map((c, i) => (
                            <div key={i}>{c}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    {hasPhoto && (
                      <div style={{ flexShrink: 0, marginLeft: 20 }}>
                        <img
                          src={photo}
                          alt="证件照"
                          style={{ width: 76, height: 102, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Other sections */}
              {mod.type !== 'header' && (
                <>
                  <h2 style={{ fontFamily: font, fontSize: s.titleFontSize ?? s.fontSize + 3, fontWeight: 700, color: s.color, marginBottom: Math.max(0, Math.round(isp * 0.5)), lineHeight: s.lineHeight }}>
                    {mod.title}
                  </h2>
                  <div style={{ height: 1, backgroundColor: '#d1d5db', marginBottom: Math.max(2, isp) }} />

                  {/* Grid modules */}
                  {gridType && (
                    <div style={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'start', gap: `${isp}px 16px`, fontFamily: font, fontSize: s.fontSize, color: s.color }}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(mod as any).items?.map((item: any, ei: number) => {
                        const items: any[] = (mod as any).items;
                        const notLast = ei < items.length - 1;
                        return (
                          <div key={item.id} style={{ display: 'contents' }}>
                            {mod.type === 'education' && <EducationPreview item={item} fontSize={s.fontSize} lineHeight={s.lineHeight} gap={Math.max(2, isp)} />}
                            {(mod.type === 'workExperience' || mod.type === 'internshipExperience' || mod.type === 'campusExperience') && <ExperiencePreview item={item} fontSize={s.fontSize} lineHeight={s.lineHeight} gap={Math.max(2, isp)} />}
                            {mod.type === 'projectExperience' && <ProjectPreview item={item} fontSize={s.fontSize} lineHeight={s.lineHeight} gap={Math.max(2, isp)} />}
                            {notLast && <div style={{ gridColumn: '1 / -1', height: isp }} />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Skills / certifications / languages */}
                  {(mod.type === 'skills' || mod.type === 'certifications' || mod.type === 'languages') && (
                    <div style={{ fontSize: s.fontSize, lineHeight: s.lineHeight, color: '#0f172a', display: 'flex', flexWrap: 'wrap', gap: `${isp}px 16px` }}>
                      {(mod as any).items?.map((sk: any) => (
                        <div key={sk.id} style={{ display: 'flex', gap: Math.max(2, isp), alignItems: 'baseline' }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0, marginTop: '0.55em' }} />
                          <span>{sk.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom */}
                  {mod.type === 'custom' && (
                    <div style={{ fontFamily: font, fontSize: s.fontSize, lineHeight: s.lineHeight, color: s.color, whiteSpace: 'pre-wrap' }}>
                      {(mod as any).content}
                    </div>
                  )}
                </>
              )}

              {/* Module gap: controlled by paddingTop + paddingBottom */}
              {!isLast && (
                <div style={{ height: (s.paddingBottom || 0) + (visible[mi + 1].styles.paddingTop || 0) || 0 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

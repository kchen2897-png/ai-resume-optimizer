'use client';

import { useRef, useEffect } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { FileText } from 'lucide-react';
import ExperienceHeader from './ExperienceHeader';
import { isGridModule } from '@/lib/editor-types';

const GRID = '2.2fr 1.2fr 1fr 1.4fr';

// ── BulletList ────────────────────────────────────────────────
function BulletList({ points, fontSize = 13, lineHeight = 1.55 }: { points: string[]; fontSize?: number; lineHeight?: number }) {
  const clean = points
    .map((p) => (p || '').replace(/^[-•·]\s*/, '').trim())
    .filter(Boolean);
  if (!clean.length) return null;
  return (
    <>
      {clean.map((point, i) => (
        <div key={i} style={{ gridColumn: '1 / -1', display: 'flex', gap: 6, fontSize, lineHeight, color: '#0f172a', paddingLeft: 2 }}>
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

function EducationPreview({ item, fontSize = 13, lineHeight = 1.55 }: { item: any; fontSize?: number; lineHeight?: number }) {
  return (
    <>
      <ExperienceHeader
        left={item.school}
        middle={item.major}
        right={item.degree}
        date={fmtDate(item)}
      />
      {item.gpa && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 6, fontSize, lineHeight, color: '#0f172a', paddingLeft: 2 }}>
          <span style={{ marginTop: '0.55em', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0 }} />
          <span>GPA：{item.gpa}</span>
        </div>
      )}
      {item.courses && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 6, fontSize, lineHeight, color: '#0f172a', paddingLeft: 2 }}>
          <span style={{ marginTop: '0.55em', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0 }} />
          <span>核心课程：{item.courses}</span>
        </div>
      )}
      {item.awards && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 6, fontSize, lineHeight, color: '#0f172a', paddingLeft: 2 }}>
          <span style={{ marginTop: '0.55em', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0 }} />
          <span>获奖：{item.awards}</span>
        </div>
      )}
      <BulletList points={item.bulletPoints || []} fontSize={fontSize} lineHeight={lineHeight} />
    </>
  );
}

function ExperiencePreview({ item, fontSize = 13, lineHeight = 1.55 }: { item: any; fontSize?: number; lineHeight?: number }) {
  return (
    <>
      <ExperienceHeader
        left={item.organization}
        middle={item.department}
        right={item.role}
        date={fmtDate(item)}
      />
      <BulletList points={item.bulletPoints || []} fontSize={fontSize} lineHeight={lineHeight} />
    </>
  );
}

function ProjectPreview({ item, fontSize = 13, lineHeight = 1.55 }: { item: any; fontSize?: number; lineHeight?: number }) {
  return (
    <>
      <ExperienceHeader
        left={item.name}
        middle={item.role}
        right=""
        date={fmtDate(item)}
      />
      <BulletList points={item.bulletPoints || []} fontSize={fontSize} lineHeight={lineHeight} />
    </>
  );
}

function parseHeaderPreview(content: string): { name: string; contacts: string[] } {
  if (!content.trim()) return { name: '', contacts: [] };

  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  let name = '';
  const rawContacts: string[] = [];

  for (const line of lines) {
    const hasLabel = /(电话|手机|邮箱|城市|地点|Email|Tel|Phone|Base|毕业院校|学历|民族|政治|出生)/.test(line);

    if (!name && !hasLabel && line.length <= 20) {
      name = line;
    } else if (hasLabel || line.includes('@') || line.match(/^1\d{10}$/) || line.match(/\+?\d[\d\s-]{6,}/)) {
      rawContacts.push(line);
    } else if (!name) {
      name = line;
    } else {
      rawContacts.push(line);
    }
  }

  // Dedup: if name appears at the start of a contact line (e.g. "张三 | 电话：..."), strip it
  const contacts = name
    ? rawContacts.map((c) => {
        const prefix = name + ' ';
        if (c.startsWith(prefix + '|') || c === name) return c.slice(prefix.length).replace(/^\s*\|\s*/, '');
        if (c.startsWith(name + '|') || c.startsWith(name + ' |')) {
          const rest = c.slice(name.length).replace(/^\s*\|\s*/, '');
          return rest || c;
        }
        return c;
      })
    : rawContacts;

  return { name, contacts };
}

// ═══════════════════════════════════════════════════════════════
export default function ResumePreview({ pagePadding }: { pagePadding?: number }) {
  const { state } = useEditor();
  const { modules } = state.document;
  const pad = pagePadding ?? '15mm';
  const innerRef = useRef<HTMLDivElement>(null);

  const sorted = modules.slice().sort((a, b) => a.order - b.order);
  const visible = sorted.filter((m) => !m.isCollapsed);

  // Center content vertically when it doesn't fill the A4 page
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    inner.style.marginTop = '0';
    const contentH = inner.offsetHeight;
    // A4 = 297mm, padding = 15mm × 2 = 30mm, content area = 267mm ≈ 1009px at 96dpi
    const targetH = Math.round(267 * 96 / 25.4);
    if (contentH < targetH) {
      inner.style.marginTop = ((targetH - contentH) / 2) + 'px';
    }
  }, [modules]);

  if (visible.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50/50">
        <div className="text-center px-4">
          <FileText className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="mt-2 text-xs text-gray-400">暂无内容可预览</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-100 flex justify-center py-8">
      <div
        className="bg-white flex-shrink-0"
        style={{
          width: '210mm',
          height: '297mm',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
          padding: pad,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div ref={innerRef}>
        {visible.map((mod, mi) => {
          const s = mod.styles;
          const font = `${s.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
          const isLast = mi === visible.length - 1;
          const gridType = isGridModule(mod.type);

          return (
            <div key={mod.id}>
              {/* Header */}
              {mod.type === 'header' && (() => {
                const parsed = parseHeaderPreview(mod.content);
                const photo = (mod as any).photo as string | undefined;
                const hasPhoto = !!photo;

                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    {/* Left: Name + contacts */}
                    <div style={{ flex: 1 }}>
                      {parsed.name ? (
                        <h1 style={{ fontFamily: font, fontSize: s.fontSize, fontWeight: 700, color: s.color, lineHeight: s.lineHeight, marginBottom: parsed.contacts.length ? 6 : 0 }}>
                          {parsed.name}
                        </h1>
                      ) : !hasPhoto ? (
                        <h1 style={{ fontFamily: font, fontSize: s.fontSize, fontWeight: 700, color: s.color, lineHeight: s.lineHeight, whiteSpace: 'pre-wrap' }}>
                          {mod.content}
                        </h1>
                      ) : null}
                      {parsed.contacts.length > 0 && (
                        <div style={{ fontFamily: font, fontSize: Math.round(s.fontSize * 0.55), color: '#64748b', lineHeight: 1.7 }}>
                          {parsed.contacts.map((c, i) => (
                            <div key={i}>{c}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Photo */}
                    {hasPhoto && (
                      <div style={{ flexShrink: 0, marginLeft: 24 }}>
                        <img
                          src={photo}
                          alt="证件照"
                          style={{ width: 95, height: 127, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Other sections */}
              {mod.type !== 'header' && (
                <>
                  <h2 style={{ fontFamily: font, fontSize: s.fontSize + 3, fontWeight: 700, color: s.color, marginBottom: 8, lineHeight: s.lineHeight }}>
                    {mod.title}
                  </h2>
                  <div style={{ height: 1, backgroundColor: '#d1d5db', marginBottom: 10 }} />

                  {/* Grid modules */}
                  {gridType && (
                    <div style={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'start', gap: '8px 16px', fontFamily: font, fontSize: s.fontSize, color: s.color, marginBottom: 6 }}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(mod as any).items?.map((item: any, ei: number) => {
                        const items: any[] = (mod as any).items;
                        const notLast = ei < items.length - 1;
                        return (
                          <div key={item.id} style={{ display: 'contents' }}>
                            {mod.type === 'education' && <EducationPreview item={item} fontSize={s.fontSize} lineHeight={s.lineHeight} />}
                            {(mod.type === 'workExperience' || mod.type === 'internshipExperience' || mod.type === 'campusExperience') && <ExperiencePreview item={item} fontSize={s.fontSize} lineHeight={s.lineHeight} />}
                            {mod.type === 'projectExperience' && <ProjectPreview item={item} fontSize={s.fontSize} lineHeight={s.lineHeight} />}
                            {notLast && <div style={{ gridColumn: '1 / -1', height: 10 }} />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Skills / certifications / languages */}
                  {(mod.type === 'skills' || mod.type === 'certifications' || mod.type === 'languages') && (
                    <div style={{ fontSize: s.fontSize, lineHeight: s.lineHeight, color: '#0f172a', display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                      {(mod as any).items?.map((s: any) => (
                        <div key={s.id} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0f172a', flexShrink: 0, marginTop: '0.55em' }} />
                          <span>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom */}
                  {mod.type === 'custom' && (
                    <div style={{ fontFamily: font, fontSize: s.fontSize, lineHeight: s.lineHeight, color: s.color, whiteSpace: 'pre-wrap', marginBottom: 8 }}>
                      {(mod as any).content}
                    </div>
                  )}
                </>
              )}

              {!isLast && <div style={{ marginTop: s.paddingBottom + s.paddingTop || 18 }} />}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

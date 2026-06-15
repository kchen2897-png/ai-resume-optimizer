import type { ResumeModule } from './editor-types';
import { isGridModule } from './editor-types';
import { parseHeader, esc, escAttr } from './header-parser';

/* ── Constants ── */
const A4_W_MM = 210;
const A4_H_MM = 297;
const PAD_MM = 15; // must match preview padding

/* ── Date format ── */
function fmtDate(item: Record<string, unknown>): string {
  const s = (item.startDate as string) || '';
  const e = (item.endDate as string) || '';
  if (s && e) return `${s} – ${e}`;
  if (s) return s;
  return '';
}

/* ── Grid experience row ── */
function gridRow(
  col1: string,
  col2: string,
  col3: string,
  date: string,
  fontSize: number,
  lineHeight: number,
): string {
  const s = `font-size:${fontSize}px;line-height:${lineHeight};`;
  return `<div class="g1" style="${s}">${esc(col1)}</div><div class="g2" style="${s}">${esc(col2)}</div><div class="g3" style="${s}">${esc(col3)}</div><div class="g4" style="${s}">${esc(date)}</div>`;
}

/* ── Extra row (GPA / courses / awards / bullets) ── */
function gridExtra(text: string, fontSize: number, lineHeight: number): string {
  return `<div class="ge" style="font-size:${fontSize}px;line-height:${lineHeight};">${bulletCircle(fontSize)}<span>${esc(text)}</span></div>`;
}

function bulletCircle(fontSize: number): string {
  return `<span class="bc" style="width:${Math.round(fontSize * 0.35)}px;height:${Math.round(fontSize * 0.35)}px;"></span>`;
}

/* ── Module → HTML fragment ── */
function renderModule(mod: ResumeModule): string {
  const s = mod.styles;
  const fs = s.fontSize || 13; // base font size (body)
  const lh = s.lineHeight || 1.55;
  const color = s.color || '#0f172a';
  const font = `"${s.fontFamily}", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", sans-serif`;

  /* ── HEADER ── */
  if (mod.type === 'header') {
    const parsed = parseHeader(mod.content || '');
    const photo = (mod as unknown as { photo?: string }).photo || null;

    let html = '<div class="header-row">';
    html += '<div class="header-left">';
    if (parsed.name) {
      html += `<h1 class="h-name" style="font-family:${font};font-size:${fs}px;color:${color};line-height:${lh};">${esc(parsed.name)}</h1>`;
    }
    if (parsed.contacts.length) {
      html += `<div class="h-contact" style="font-size:${Math.round(fs * 0.5)}px;">`;
      for (const c of parsed.contacts) {
        html += `<div>${esc(c)}</div>`;
      }
      html += '</div>';
    }
    if (!parsed.name && !parsed.contacts.length) {
      html += `<h1 class="h-name" style="font-family:${font};font-size:${fs}px;color:${color};white-space:pre-wrap;">${esc(mod.content)}</h1>`;
    }
    html += '</div>';
    if (photo) {
      html += `<div class="header-photo"><img src="${escAttr(photo)}" alt="photo" class="photo-img"></div>`;
    }
    html += '</div>';
    return html;
  }

  /* ── SECTION TITLE ── */
  const isp = s.itemSpacing ?? 8;
  const titleMb = Math.max(0, Math.round(isp * 0.5));
  const hrMb = Math.max(2, isp);
  let html = '';
  const titleFs = s.titleFontSize ?? fs + 3;
  html += `<h2 class="s-title" style="font-family:${font};font-size:${titleFs}px;font-weight:700;color:${color};margin-bottom:${titleMb}px;">${esc(mod.title || '')}</h2>`;
  html += `<div class="s-hr" style="margin-bottom:${hrMb}px;"></div>`;

  /* ── GRID MODULES ── */
  if (isGridModule(mod.type)) {
    const items: Record<string, unknown>[] = (mod as unknown as { items: Record<string, unknown>[] }).items || [];
    const isp = s.itemSpacing ?? 8;
    html += `<div class="grid" style="font-size:${fs}px;line-height:${lh};row-gap:${isp}px;">`;

    for (let ei = 0; ei < items.length; ei++) {
      const it = items[ei];
      let c1 = '', c2 = '', c3 = '', date = '';

      switch (mod.type) {
        case 'education':
          c1 = (it.school as string) || '';
          c2 = (it.major as string) || '';
          c3 = (it.degree as string) || '';
          date = fmtDate(it);
          break;
        case 'projectExperience':
          c1 = (it.name as string) || '';
          c2 = (it.role as string) || '';
          c3 = '';
          date = fmtDate(it);
          break;
        default: // work / internship / campus
          c1 = (it.organization as string) || '';
          c2 = (it.department as string) || '';
          c3 = (it.role as string) || '';
          date = fmtDate(it);
          break;
      }

      html += gridRow(c1, c2, c3, date, fs, lh);

      // Education extras
      if (mod.type === 'education') {
        if (it.gpa) html += gridExtra(`GPA：${it.gpa}`, fs, lh);
        if (it.courses) html += gridExtra(`核心课程：${it.courses}`, fs, lh);
        if (it.awards) html += gridExtra(`获奖：${it.awards}`, fs, lh);
      }

      // Bullets
      for (const b of (it.bulletPoints as string[]) || []) {
        const clean = (b || '').replace(/^[-•·]\s*/, '').trim();
        if (clean) html += gridExtra(clean, fs, lh);
      }

      if (ei < items.length - 1) {
        html += `<div style="grid-column:1/-1;height:${isp}px;"></div>`;
      }
    }
    html += '</div>';
  }

  /* ── SKILLS / CERTS / LANGUAGES ── */
  if (mod.type === 'skills' || mod.type === 'certifications' || mod.type === 'languages') {
    const names = ((mod as unknown as { items: { name: string }[] }).items || [])
      .map(i => i.name)
      .filter(Boolean);
    if (names.length) {
      html += `<div class="skill-list" style="font-size:${fs}px;line-height:${lh};color:#0f172a;">`;
      for (const n of names) {
        html += `<span class="skill-tag">${bulletCircle(fs)}<span>${esc(n)}</span></span>`;
      }
      html += '</div>';
    }
  }

  /* ── CUSTOM ── */
  if (mod.type === 'custom') {
    html += `<div class="custom" style="font-family:${font};font-size:${fs}px;line-height:${lh};color:${color};white-space:pre-wrap;">${esc((mod as unknown as { content: string }).content || '')}</div>`;
  }

  return html;
}

/* ── Build full A4 HTML document ── */
export function buildA4Html(modules: ResumeModule[]): string {
  const sorted = modules.slice().sort((a, b) => a.order - b.order);
  const visible = sorted.filter(m => !m.isCollapsed);

  const bodyParts: string[] = [];

  for (let mi = 0; mi < visible.length; mi++) {
    const mod = visible[mi];
    bodyParts.push(renderModule(mod));

    // Spacer between sections using module's own padding
    if (mi < visible.length - 1) {
      const gap = (mod.styles.paddingBottom || 0) + (visible[mi + 1].styles.paddingTop || 0);
      bodyParts.push(`<div style="height:${gap}px;"></div>`);
    }
  }

  const body = bodyParts.join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  body{
    font-family:"Inter","Noto Sans SC",-apple-system,BlinkMacSystemFont,"Microsoft YaHei","Segoe UI",sans-serif;
    color:#1f2937;
    background:#fff;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
  }

  .page{
    width:${A4_W_MM}mm;
    height:${A4_H_MM}mm;
    background:#fff;
    padding:${PAD_MM}mm;
    box-sizing:border-box;
    overflow:hidden;
  }

  @page {
    size: ${A4_W_MM}mm ${A4_H_MM}mm;
    margin: 0;
  }

  /* ── Header ── */
  .header-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
  .header-left{flex:1}
  .h-name{font-weight:700;line-height:1.3;margin-bottom:2px}
  .h-contact{color:#64748b;line-height:1.5}
  .header-photo{flex-shrink:0;margin-left:20px}
  .photo-img{width:76px;height:102px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb}

  /* ── Section titles ── */
  .s-title{line-height:1.3}
  .s-hr{height:1px;background:#d1d5db}

  /* ── Grid table ── */
  .grid{
    display:grid;
    grid-template-columns:2.2fr 1.2fr 1fr 1.4fr;
    align-items:start;
  }
  .g1{font-weight:600;min-width:0;overflow-wrap:break-word;line-height:1.4}
  .g2{text-align:center;min-width:0;overflow-wrap:break-word;line-height:1.4}
  .g3{text-align:center;min-width:0;overflow-wrap:break-word;line-height:1.4}
  .g4{text-align:right;white-space:nowrap;line-height:1.4}
  .ge{
    grid-column:1/-1;
    display:flex;
    gap:6px;
    align-items:baseline;
    color:#0f172a;
    padding-left:2px;
    line-height:1.55;
  }
  .bc{
    border-radius:50%;
    background:#0f172a;
    flex-shrink:0;
    margin-top:0.55em;
  }

  /* ── Skills ── */
  .skill-list{display:flex;flex-wrap:wrap;gap:4px 16px}
  .skill-tag{display:flex;gap:6px;align-items:baseline;white-space:nowrap}

  /* ── Custom ── */
  .custom{text-align:justify}
</style>
</head>
<body>
<div class="page" id="a4-page">
${body}
</div>
</body>
</html>`;
}

/* ── Helpers ── */


import type { ResumeModule } from './editor-types';
import { isGridModule } from './editor-types';

const GRID = 'grid-template-columns: 2.2fr 1.2fr 1fr 1.4fr;';

function fmtDate(item: any): string {
  if (item.startDate && item.endDate) return `${item.startDate} - ${item.endDate}`;
  return '';
}

export function serializeModulesToText(modules: ResumeModule[]): string {
  const parts: string[] = [];
  for (const m of modules) {
    if (m.type === 'header') { parts.push(m.content); continue; }
    parts.push(m.title);
    switch (m.type) {
      case 'education':
        for (const it of m.items) {
          parts.push([it.school, it.major, it.degree, fmtDate(it)].filter(Boolean).join('  '));
          if (it.gpa) parts.push(`GPA: ${it.gpa}`);
          if (it.courses) parts.push(`课程: ${it.courses}`);
          if (it.awards) parts.push(`获奖: ${it.awards}`);
          for (const b of it.bulletPoints) if (b.trim()) parts.push(`• ${b.trim().replace(/^[-•·]\s*/, '')}`);
        }
        break;
      case 'workExperience': case 'internshipExperience': case 'campusExperience':
        for (const it of m.items) {
          parts.push([it.organization, it.department, it.role, fmtDate(it)].filter(Boolean).join('  '));
          for (const b of it.bulletPoints) if (b.trim()) parts.push(`• ${b.trim().replace(/^[-•·]\s*/, '')}`);
        }
        break;
      case 'projectExperience':
        for (const it of m.items) {
          parts.push([it.name, it.role, fmtDate(it)].filter(Boolean).join('  '));
          for (const b of it.bulletPoints) if (b.trim()) parts.push(`• ${b.trim().replace(/^[-•·]\s*/, '')}`);
        }
        break;
      case 'skills': case 'certifications': case 'languages':
        parts.push(m.items.map((it) => it.name).filter(Boolean).join('、'));
        break;
      case 'custom': parts.push(m.content); break;
    }
  }
  return parts.join('\n\n');
}

export function serializeModulesToHTML(modules: ResumeModule[]): string {
  const sorted = modules.slice().sort((a, b) => a.order - b.order);
  const visible = sorted.filter((m) => !m.isCollapsed);

  const body = visible.map((m, mi) => {
    const isLast = mi === visible.length - 1;
    const s = m.styles;
    const font = `${s.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    let html = '';

    if (m.type === 'header') {
      html = `<div style="text-align:center;margin-bottom:24px;"><h1 style="font-family:${font};font-size:22px;font-weight:700;color:${s.color};line-height:1.3;white-space:pre-wrap;">${esc(m.content)}</h1></div>`;
    } else {
      html += `<h2 style="font-family:${font};font-size:16px;font-weight:700;color:${s.color};margin-bottom:8px;">${m.title}</h2>`;
      html += `<div style="height:1px;background:#d1d5db;margin-bottom:10px;"></div>`;

      if (isGridModule(m.type)) {
        html += `<div style="display:grid;${GRID}align-items:start;gap:0.5rem 1rem;font-family:${font};color:${s.color};margin-bottom:6px;">`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: any[] = (m as any).items || [];
        for (let ei = 0; ei < items.length; ei++) {
          const it = items[ei];
          const col1 = m.type === 'education' ? it.school : m.type === 'projectExperience' ? it.name : it.organization;
          const col2 = m.type === 'education' ? it.major : m.type === 'projectExperience' ? (it.role || '') : (it.department || '');
          const col3 = m.type === 'education' ? it.degree : m.type === 'projectExperience' ? '' : (it.role || '');
          const date = fmtDate(it);
          const hdr = 'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:600;line-height:1.4;';

          html += `<div style="${hdr}">${esc(col1 || '')}</div>`;
          html += `<div style="${hdr}text-align:center;">${esc(col2)}</div>`;
          html += `<div style="${hdr}text-align:center;">${esc(col3)}</div>`;
          html += `<div style="${hdr}text-align:right;">${esc(date)}</div>`;

          // Education extras
          if (m.type === 'education' && it.gpa) {
            html += `<div style="grid-column:1/-1;display:flex;gap:6px;font-size:13px;line-height:1.55;"><span style="margin-top:0.55em;width:4px;height:4px;border-radius:50%;background:#0f172a;flex-shrink:0;"></span><span>GPA：${esc(it.gpa)}</span></div>`;
          }
          if (m.type === 'education' && it.courses) {
            html += `<div style="grid-column:1/-1;display:flex;gap:6px;font-size:13px;line-height:1.55;"><span style="margin-top:0.55em;width:4px;height:4px;border-radius:50%;background:#0f172a;flex-shrink:0;"></span><span>核心课程：${esc(it.courses)}</span></div>`;
          }
          if (m.type === 'education' && it.awards) {
            html += `<div style="grid-column:1/-1;display:flex;gap:6px;font-size:13px;line-height:1.55;"><span style="margin-top:0.55em;width:4px;height:4px;border-radius:50%;background:#0f172a;flex-shrink:0;"></span><span>获奖：${esc(it.awards)}</span></div>`;
          }

          // Bullets
          for (const b of (it.bulletPoints || [])) {
            const clean = (b || '').replace(/^[-•·]\s*/, '').trim();
            if (!clean) continue;
            html += `<div style="grid-column:1/-1;display:flex;gap:6px;font-size:13px;line-height:1.55;color:#0f172a;padding-left:2px;"><span style="margin-top:0.55em;width:4px;height:4px;border-radius:50%;background:#0f172a;flex-shrink:0;"></span><span>${esc(clean)}</span></div>`;
          }

          if (ei < items.length - 1) html += `<div style="grid-column:1/-1;height:10px;"></div>`;
        }
        html += `</div>`;
      } else if (m.type === 'skills' || m.type === 'certifications' || m.type === 'languages') {
        html += `<div style="font-size:13px;line-height:1.55;color:#0f172a;display:flex;flex-wrap:wrap;gap:4px 16px;">`;
        for (const it of m.items) {
          if (!it.name) continue;
          html += `<div style="display:flex;gap:6px;align-items:baseline;"><span style="width:4px;height:4px;border-radius:50%;background:#0f172a;flex-shrink:0;margin-top:0.55em;"></span><span>${esc(it.name)}</span></div>`;
        }
        html += `</div>`;
      } else if (m.type === 'custom') {
        html += `<div style="font-family:${font};font-size:13px;line-height:1.55;color:${s.color};white-space:pre-wrap;">${esc(m.content)}</div>`;
      }
    }
    if (!isLast) html += `<div style="margin-top:18px;"></div>`;
    return html;
  }).join('\n');

  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>简历</title></head><body style="max-width:800px;margin:0 auto;padding:48px 56px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1f2937;background:#fff;">${body}</body></html>`;
}

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

export function serializeModulesToWordHTML(modules: ResumeModule[]): string {
  const sorted = modules.slice().sort((a, b) => a.order - b.order);
  const visible = sorted.filter((m) => !m.isCollapsed);

  const body = visible.map((m, mi) => {
    const s = m.styles;
    const font = `${s.fontFamily}, '微软雅黑', sans-serif`;
    let html = '';

    if (m.type === 'header') {
      html = `<div style="text-align:center;margin-bottom:24px;"><h1 style="font-family:${font};font-size:${s.fontSize || 22}px;font-weight:700;color:${s.color};line-height:${s.lineHeight || 1.3};">${m.content.replace(/\n/g, '<br>')}</h1></div>`;
    } else {
      html += `<h2 style="font-family:${font};font-size:16px;font-weight:700;color:${s.color};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #d1d5db;">${m.title}</h2>`;

      if (isGridModule(m.type)) {
        html += '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:6px;">';
        const items: any[] = (m as any).items || [];
        for (let ei = 0; ei < items.length; ei++) {
          const it = items[ei];
          const col1 = m.type === 'education' ? it.school : m.type === 'projectExperience' ? it.name : it.organization;
          const col2 = m.type === 'education' ? it.major : m.type === 'projectExperience' ? (it.role || '') : (it.department || '');
          const col3 = m.type === 'education' ? it.degree : m.type === 'projectExperience' ? '' : (it.role || '');
          const date = fmtDate(it);
          html += `<tr><td style="font-weight:600;padding:2px 8px 2px 0;">${col1 || ''}</td><td style="padding:2px 8px;">${col2}</td><td style="padding:2px 8px;">${col3}</td><td style="text-align:right;padding:2px 0;">${date}</td></tr>`;

          if (m.type === 'education' && it.gpa) html += `<tr><td colspan="4" style="padding:2px 0;font-size:12px;">· GPA：${it.gpa}</td></tr>`;
          if (m.type === 'education' && it.courses) html += `<tr><td colspan="4" style="padding:2px 0;font-size:12px;">· 核心课程：${it.courses}</td></tr>`;
          if (m.type === 'education' && it.awards) html += `<tr><td colspan="4" style="padding:2px 0;font-size:12px;">· 获奖：${it.awards}</td></tr>`;

          for (const b of (it.bulletPoints || [])) {
            const clean = (b || '').replace(/^[-•·]\s*/, '').trim();
            if (!clean) continue;
            html += `<tr><td colspan="4" style="padding:2px 0;font-size:12px;">· ${clean}</td></tr>`;
          }
          if (ei < items.length - 1) html += '<tr><td colspan="4" style="height:8px;"></td></tr>';
        }
        html += '</table>';
      } else if (m.type === 'skills' || m.type === 'certifications' || m.type === 'languages') {
        html += '<p style="font-size:13px;line-height:1.6;">';
        html += m.items.map((it, i) => `· ${it.name}`).join('&nbsp;&nbsp;');
        html += '</p>';
      } else if (m.type === 'custom') {
        html += `<p style="font-size:13px;line-height:1.6;white-space:pre-wrap;">${m.content.replace(/\n/g, '<br>')}</p>`;
      }
    }
    if (mi < visible.length - 1) html += '<div style="height:12px;"></div>';
    return html;
  }).join('\n');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
@page { size: 210mm 297mm; margin: 20mm 25mm; }
body { font-family: '微软雅黑','Microsoft YaHei',sans-serif; color: #1f2937; line-height: 1.5; }
</style>
</head>
<body>${body}</body></html>`;
}

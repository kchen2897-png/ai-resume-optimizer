'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Copy, FileText, Code2, Check, File } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { serializeModulesToText, serializeModulesToHTML } from '@/lib/resume-serializer';
import type { ResumeModule } from '@/lib/editor-types';
import { copyToClipboard } from '@/lib/utils';

/* ── A4 constants ── */
const A4_W_MM = 210;
const A4_H_MM = 297;
const A4_PAD_MM = 15; // mm — identical for screen & print
// At 96 dpi: 210mm≈794px, 297mm≈1123px, 15mm≈57px
const A4_W_PX = Math.round(A4_W_MM * 96 / 25.4);
const A4_H_PX = Math.round(A4_H_MM * 96 / 25.4);
const A4_PAD_PX = Math.round(A4_PAD_MM * 96 / 25.4);

function buildExportHTML(modules: ResumeModule[]): string {
  const sorted = modules.slice().sort((a, b) => a.order - b.order);
  const visible = sorted.filter((m) => !m.isCollapsed);

  const body = visible.map((mod, mi) => {
    const s = mod.styles;
    const font = `${s.fontFamily}, 'Microsoft YaHei', -apple-system, sans-serif`;

    if (mod.type === 'header') {
      const lines = mod.content.split('\n').filter(Boolean);
      const name = lines[0] || '';
      const contacts = lines.slice(1);
      let h = `<div class="header">`;
      h += `<div class="header-left">`;
      if (name) h += `<h1 class="export-name" style="font-family:${font};font-size:${s.fontSize}px;color:${s.color};">${esc(name)}</h1>`;
      if (contacts.length) h += `<div class="contacts" style="font-size:${Math.round(s.fontSize * 0.55)}px;">${contacts.map(c => `<div>${esc(c)}</div>`).join('')}</div>`;
      h += `</div>`;
      if ((mod as any).photo) h += `<div class="photo"><img src="${escA((mod as any).photo)}" alt="照片"></div>`;
      h += `</div>`;
      h += `<div class="header-spacer"></div>`;
      return h;
    }

    let h = '';
    h += `<h2 style="font-family:${font};font-size:${s.fontSize + 3}px;font-weight:700;color:${s.color};line-height:${s.lineHeight};margin-bottom:8px;">${esc(mod.title)}</h2>`;
    h += `<div class="hr"></div>`;

    if (mod.type === 'education' || mod.type === 'workExperience' || mod.type === 'internshipExperience' || mod.type === 'campusExperience' || mod.type === 'projectExperience') {
      const items: any[] = (mod as any).items || [];
      if (items.length) {
        h += `<div class="grid-table" style="font-size:${s.fontSize}px;line-height:${s.lineHeight};">`;
        for (let ei = 0; ei < items.length; ei++) {
          const it = items[ei];
          const c1 = mod.type === 'education' ? it.school : mod.type === 'projectExperience' ? it.name : it.organization;
          const c2 = mod.type === 'education' ? it.major : mod.type === 'projectExperience' ? (it.role || '') : (it.department || '');
          const c3 = mod.type === 'education' ? it.degree : mod.type === 'projectExperience' ? '' : (it.role || '');
          const date = [it.startDate, it.endDate].filter(Boolean).join(' – ');
          h += `<div class="g1">${esc(c1 || '')}</div>`;
          h += `<div class="g2">${esc(c2)}</div>`;
          h += `<div class="g3">${esc(c3)}</div>`;
          h += `<div class="g4">${esc(date)}</div>`;
          if (mod.type === 'education' && it.gpa) h += `<div class="g-extra"><span>GPA：${esc(it.gpa)}</span></div>`;
          if (mod.type === 'education' && it.courses) h += `<div class="g-extra"><span>核心课程：${esc(it.courses)}</span></div>`;
          if (mod.type === 'education' && it.awards) h += `<div class="g-extra"><span>获奖：${esc(it.awards)}</span></div>`;
          for (const b of (it.bulletPoints || [])) {
            const c = (b || '').replace(/^[-•·]\s*/, '').trim();
            if (c) h += `<div class="g-extra"><span>${esc(c)}</span></div>`;
          }
          if (ei < items.length - 1) h += `<div class="g-gap"></div>`;
        }
        h += `</div>`;
      }
    } else if (mod.type === 'skills' || mod.type === 'certifications' || mod.type === 'languages') {
      const names = ((mod as any).items || []).map((it: any) => it.name).filter(Boolean);
      if (names.length) h += `<div class="skill-list" style="font-size:${s.fontSize}px;line-height:${s.lineHeight};">${names.map((n: string) => `<span class="skill-tag">· ${esc(n)}</span>`).join('')}</div>`;
    } else if (mod.type === 'custom') {
      h += `<div class="custom" style="font-size:${s.fontSize}px;line-height:${s.lineHeight};">${esc((mod as any).content || '')}</div>`;
    }

    if (mi < visible.length - 1) h += `<div style="height:${s.paddingBottom + s.paddingTop || 18}px;"></div>`;
    return h;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>简历</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Microsoft YaHei','微软雅黑',-apple-system,sans-serif;color:#1f2937;background:#e5e7eb}
  .page{width:${A4_W_MM}mm;height:${A4_H_MM}mm;background:#fff;padding:${A4_PAD_MM}mm;margin:24px auto;overflow:hidden;box-sizing:border-box}
  /* header */
  .header{display:flex;justify-content:space-between;align-items:flex-start}
  .header-left{flex:1}
  .export-name{font-size:28px;font-weight:700;line-height:1.3;margin-bottom:8px}
  .contacts{font-size:12px;color:#64748b;line-height:1.8}
  .header-spacer{height:24px}
  .photo{flex-shrink:0;margin-left:24px}
  .photo img{width:95px;height:127px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb}
  /* sections */
  h2{font-weight:700}
  .hr{height:1px;background:#d1d5db;margin-bottom:10px}
  /* grid table — matches preview layout */
  .grid-table{display:grid;grid-template-columns:2.2fr 1.2fr 1fr 1.4fr;align-items:start;gap:8px 16px;margin-bottom:6px}
  .g1{font-weight:600;min-width:0;overflow-wrap:break-word;line-height:1.4}
  .g2{text-align:center;min-width:0;overflow-wrap:break-word;line-height:1.4}
  .g3{text-align:center;min-width:0;overflow-wrap:break-word;line-height:1.4}
  .g4{text-align:right;white-space:nowrap;line-height:1.4}
  .g-extra{grid-column:1/-1;display:flex;gap:6px;align-items:baseline;color:#0f172a;padding-left:2px}
  .g-extra::before{content:'';width:4px;height:4px;border-radius:50%;background:#0f172a;flex-shrink:0;margin-top:0.55em}
  .g-gap{grid-column:1/-1;height:10px}
  /* skills */
  .skill-list{font-size:13px;line-height:1.7;display:flex;flex-wrap:wrap;gap:4px 16px}
  .skill-tag{white-space:nowrap}
  /* custom */
  .custom{font-size:13px;line-height:1.6;white-space:pre-wrap}
  /* print — same padding as screen, in mm */
  @media print{
    @page{size:A4;margin:0}
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{width:210mm;height:297mm;overflow:hidden;margin:0;padding:0;background:#fff}
    .page{width:210mm;min-height:0;height:297mm;padding:15mm;margin:0;overflow:hidden;box-sizing:border-box}
  }
</style>
</head>
<body><div class="page" id="a4-page"><div id="a4-inner">${body}</div></div></body>
</html>`;
}

function esc(t: string): string { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }
function escA(t: string): string { return t.replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

/* ── ExportMenu ── */

export default function ExportMenu() {
  const { state } = useEditor();
  const { modules } = state.document;
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    function outside(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false); }
    if (open) { document.addEventListener('mousedown', outside); return () => document.removeEventListener('mousedown', outside); }
  }, [open]);

  async function copyText() { await copyToClipboard(serializeModulesToText(modules)); setDone('text'); setTimeout(() => setDone(null), 2000); }
  async function copyHTML() { await copyToClipboard(serializeModulesToHTML(modules)); setDone('html'); setTimeout(() => setDone(null), 2000); }

  function downloadPDF() {
    const html = buildExportHTML(modules);

    // Create hidden iframe to measure
    const oldIframe = iframeRef.current;
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:' + A4_W_PX + 'px;height:1px;visibility:hidden;pointer-events:none;z-index:-1';
    iframeRef.current = iframe;

    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow!.document;
    doc.open();
    doc.write(html);
    doc.close();

    function onReady() {
      const page = doc.getElementById('a4-page');
      const inner = doc.getElementById('a4-inner');
      if (!page || !inner) return;

      const contentH = inner.offsetHeight;

      // Available content height: A4 height minus padding (both sides)
      const targetH = A4_H_PX - A4_PAD_PX * 2;

      if (contentH > targetH) {
	        // Content overflows — scale down to fit
        const zoom = targetH / contentH;
        const style = doc.createElement('style');
        style.textContent = '@media print { #a4-inner { zoom: ' + zoom + '; } }';
        doc.head.appendChild(style);
      } else if (contentH < targetH) {
        // Content fits with room to spare — center vertically for equal top/bottom margins
        inner.style.marginTop = ((targetH - contentH) / 2) + 'px';
      }

      // Clean up and print
      setTimeout(() => {
        iframe.contentWindow!.focus();
        iframe.contentWindow!.print();
        // Remove iframe after print dialog closes
        setTimeout(() => { if (iframeRef.current === iframe) { iframe.remove(); iframeRef.current = null; } }, 1000);
      }, 300);
    }

    // Wait for render
    iframe.onload = () => setTimeout(onReady, 200);
    setTimeout(() => { try { if (doc.readyState === 'complete') onReady(); } catch{} }, 600);

    setDone('download-pdf');
    setTimeout(() => setDone(null), 2000);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300">
        <Download className="h-4 w-4" />导出
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-lg z-50 py-1 animate-fade-in">
          <button onClick={copyText} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
            {done === 'text' ? <Check className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4 text-gray-400" />}
            <div><p className="font-medium">复制为纯文本</p><p className="text-xs text-gray-400">粘贴到任意文本框</p></div>
          </button>
          <button onClick={copyHTML} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
            {done === 'html' ? <Check className="h-4 w-4 text-green-500" /> : <Code2 className="h-4 w-4 text-gray-400" />}
            <div><p className="font-medium">复制为 HTML</p><p className="text-xs text-gray-400">保留格式的富文本</p></div>
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button onClick={downloadPDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
            {done === 'download-pdf' ? <Check className="h-4 w-4 text-green-500" /> : <File className="h-4 w-4 text-red-400" />}
            <div><p className="font-medium">导出为 PDF</p><p className="text-xs text-gray-400">一张 A4 纸，自动适配排版</p></div>
          </button>
        </div>
      )}
    </div>
  );
}

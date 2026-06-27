import { NextRequest, NextResponse } from 'next/server';
import { buildA4Html } from '@/lib/resume-pdf-html';
import type { ResumeModule } from '@/lib/editor-types';

export const maxDuration = 60; // Vercel Pro / Fluid Compute

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const modules: ResumeModule[] = body.modules;

    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return NextResponse.json({ error: '缺少简历模块数据' }, { status: 400 });
    }

    const html = buildA4Html(modules);

    const pdfBuffer = await renderPdf(html);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('PDF export error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'PDF 生成失败' },
      { status: 500 },
    );
  }
}

/* ── Browser / PDF rendering ── */

let browserPromise: Promise<import('puppeteer-core').Browser> | null = null;

async function getBrowser(): Promise<import('puppeteer-core').Browser> {
  // Warm browser reuse (within same Lambda invocation)
  if (browserPromise) {
    const b = await browserPromise;
    if (b.isConnected()) return b;
  }

  browserPromise = launchBrowser();
  return browserPromise;
}

async function launchBrowser(): Promise<import('puppeteer-core').Browser> {
  const puppeteer = await import('puppeteer-core');

  // ── Production: Vercel / serverless ──
  const remotePath = process.env.CHROMIUM_REMOTE_EXEC_PATH;
  if (remotePath) {
    const chromium = await import('@sparticuz/chromium-min');
    // @sparticuz/chromium-min >= 130 accepts a URL directly to
    // executablePath for on-demand download; pass it as-is.
    return puppeteer.default.launch({
      args: [...chromium.default.args, '--no-sandbox', '--disable-gpu'],
      defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 2 },
      executablePath: await chromium.default.executablePath(remotePath),
      headless: true,
    });
  }

  // ── Local dev: system Chrome ──
  const localPath =
    process.env.CHROMIUM_LOCAL_EXEC_PATH ||
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  try {
    return await puppeteer.default.launch({
      executablePath: localPath,
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
      defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 2 },
    });
  } catch {
    // Fallback: let puppeteer find it
    return puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
      defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 2 },
      channel: 'chrome',
    });
  }
}

async function renderPdf(html: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 30000,
    });

    // Small delay for fonts / layout to stabilise
    await new Promise(r => setTimeout(r, 500));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
      preferCSSPageSize: true,
    });

    return new Uint8Array(pdf);
  } finally {
    await page.close();
  }
}

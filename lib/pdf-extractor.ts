import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface ExtractionResult {
  text: string;
  method: 'pdfjs';
}

export interface ExtractionProgress {
  page?: number;
  totalPages?: number;
}

async function extractWithPdfjs(
  file: File,
  onProgress?: (p: ExtractionProgress) => void
): Promise<{ text: string; pageCount: number }> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.({ page: i, totalPages: pdf.numPages });
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str ?? '').join(' '));
  }
  return { text: pages.join('\n\n'), pageCount: pdf.numPages };
}

export async function extractPDFText(
  file: File,
  onProgress?: (p: ExtractionProgress) => void
): Promise<ExtractionResult> {
  try {
    const { text } = await extractWithPdfjs(file, onProgress);
    if (!text.trim()) {
      return { text: '', method: 'pdfjs' };
    }
    return { text, method: 'pdfjs' };
  } catch (err) {
    console.error('PDF extraction failed:', err);
    throw new Error(
      'PDF 文字提取失败。如果文件为扫描件，请直接复制文字内容粘贴到输入框中。'
    );
  }
}

export function cleanExtractedText(rawText: string): string {
  return rawText
    .replace(/[�]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{3,}/g, '  ')
    .trim();
}

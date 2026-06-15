import { NextRequest, NextResponse } from 'next/server';
import { parseResumeWithAI } from '@/lib/ai-parser';

export async function POST(request: NextRequest) {
  try {
    const { rawText } = await request.json();
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return NextResponse.json({ success: false, error: '请提供简历文本' }, { status: 400 });
    }

    const result = await parseResumeWithAI(rawText.trim());

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, modules: result.modules });
  } catch (err: any) {
    console.error('Parse resume error:', err);
    return NextResponse.json({ success: false, error: err.message || '解析失败' }, { status: 500 });
  }
}

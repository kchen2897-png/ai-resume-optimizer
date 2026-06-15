import { NextRequest, NextResponse } from 'next/server';
import type { PolishRequest } from '@/lib/types';
import { callDeepSeekPolish } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PolishRequest;

    if (!body.rawText || typeof body.rawText !== 'string' || !body.rawText.trim()) {
      return NextResponse.json({ success: false, error: '请提供需要润色的文本' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: '未配置 API Key' }, { status: 500 });
    }

    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    const result = await callDeepSeekPolish(body, apiKey, model);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Polish error:', err);
    return NextResponse.json({ success: false, error: err.message || '润色失败' }, { status: 500 });
  }
}

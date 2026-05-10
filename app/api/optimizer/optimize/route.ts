import { NextRequest, NextResponse } from 'next/server';
import type { OptimizeRequest } from '@/lib/types';
import { callDeepSeekOptimize } from '@/lib/anthropic';
import { validateRequest } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as OptimizeRequest;

    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: '未配置 API Key' }, { status: 500 });
    }

    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    const result = await callDeepSeekOptimize(body, apiKey, model);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Optimizer error:', err);

    const message = err.message || '优化失败，请重试';
    if (message.includes('API key') || message.includes('401') || message.includes('403')) {
      return NextResponse.json({ success: false, error: 'API Key 配置错误，请检查环境变量' }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import type { OptimizeRequest } from '@/lib/types';
import { callDeepSeekOptimize } from '@/lib/deepseek';
import { parseResumeWithAI } from '@/lib/ai-parser';
import { validateRequest } from '@/lib/validators';

export const maxDuration = 60; // Two sequential AI calls need time

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

    // Step 1: Optimize (comparison-based)
    const comparisonResult = await callDeepSeekOptimize(body, apiKey, model);

    // Step 2: Build optimized full text from all section comparisons
    const optimizedText = comparisonResult.comparisons
      .map((c) => c.optimizedText)
      .join('\n\n');

    if (!optimizedText.trim()) {
      // No optimized text to parse — return comparison only
      return NextResponse.json({
        success: true,
        data: comparisonResult,
        modules: null,
      });
    }

    // Step 3: Parse the optimized text into structured modules
    const parseResult = await parseResumeWithAI(optimizedText);

    return NextResponse.json({
      success: true,
      data: comparisonResult,
      modules: parseResult.success ? parseResult.modules : null,
      optimizedText: optimizedText,
    });
  } catch (err: any) {
    console.error('Optimize-and-parse error:', err);

    const message = err.message || '优化失败，请重试';
    if (message.includes('API key') || message.includes('401') || message.includes('403')) {
      return NextResponse.json({ success: false, error: 'API Key 配置错误，请检查环境变量' }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

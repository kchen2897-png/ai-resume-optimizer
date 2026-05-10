import { NextRequest, NextResponse } from 'next/server';
import { buildParseSystemPrompt, buildParseUserPrompt } from '@/lib/prompts/parser';

export async function POST(request: NextRequest) {
  try {
    const { rawText } = await request.json();
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return NextResponse.json({ success: false, error: '请提供简历文本' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: '未配置 API Key' }, { status: 500 });
    }

    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: buildParseSystemPrompt() },
          { role: 'user', content: buildParseUserPrompt(rawText.trim()) },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek API error:', err);
      return NextResponse.json({ success: false, error: 'AI 解析服务暂时不可用' }, { status: 502 });
    }

    const data = await response.json();
    const rawOutput = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!rawOutput) {
      return NextResponse.json({ success: false, error: 'AI 返回空内容' }, { status: 500 });
    }

    // Extract JSON from response
    let parsed: any;
    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch {
          return NextResponse.json({ success: false, error: 'AI 返回格式解析失败' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ success: false, error: 'AI 返回格式解析失败' }, { status: 500 });
      }
    }

    const modules = parsed.modules || parsed.data?.modules || [];
    if (!Array.isArray(modules) || modules.length === 0) {
      return NextResponse.json({ success: false, error: 'AI 未能识别简历结构' }, { status: 500 });
    }

    return NextResponse.json({ success: true, modules });
  } catch (err: any) {
    console.error('Parse resume error:', err);
    return NextResponse.json({ success: false, error: err.message || '解析失败' }, { status: 500 });
  }
}

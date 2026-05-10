import { NextRequest, NextResponse } from 'next/server';

interface LayoutAdjustment {
  baseFontSize: number;
  titleFontSize: number;
  headerFontSize: number;
  lineHeight: number;
  sectionGap: number;
  paddingTop: number;
  paddingBottom: number;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText, moduleCount } = await request.json();
    if (!resumeText) {
      return NextResponse.json({ success: false, error: '缺少简历文本' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: '未配置 API Key' }, { status: 500 });
    }

    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    const charCount = resumeText.length;
    const lineEstimate = Math.ceil(charCount / 35); // rough lines per A4 width at 13px

    const systemPrompt = `你是一位专业的简历排版顾问。根据简历文本的长度和模块数量，你需要推荐最佳的字号、行高和间距，使内容美观地适配在一张 A4 纸 (297mm 高) 上。

参考基准 (A4适用区约670px高, Inter/微软雅黑字体):
- 短简历 (<600字, <5模块, 适合大字号): base 15px, title 22px, header 24px, lineHeight 1.6, gap 18px
- 中短简历 (600-1200字, 5-7模块): base 14px, title 20px, header 24px, lineHeight 1.55, gap 16px
- 中等简历 (1200-2000字, 7-10模块): base 13px, title 18px, header 22px, lineHeight 1.5, gap 14px
- 偏长简历 (2000-3000字, 10-14模块): base 12px, title 16px, header 20px, lineHeight 1.45, gap 12px
- 超长简历 (>3000字, >14模块): base 11px, title 15px, header 18px, lineHeight 1.35, gap 10px

注意：考虑到模块标题、列表项、网格布局会消耗额外垂直空间，字号应比纯文本估算略大。

返回严格 JSON，不要 Markdown。`;

    const userPrompt = `请为以下中文简历推荐排版参数：

简历字数：${charCount} 字（约 ${lineEstimate} 行）
模块数量：${moduleCount} 个

简历内容：
${resumeText.slice(0, 3000)}

返回格式：
{
  "baseFontSize": 数字(10-16),
  "titleFontSize": 数字(18-26),
  "headerFontSize": 数字(18-26),
  "lineHeight": 数字(1.2-1.8),
  "sectionGap": 数字(8-20),
  "paddingTop": 数字(8-20),
  "paddingBottom": 数字(8-20),
  "reasoning": "简短的排版建议（50字以内）"
}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 512,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'AI 服务暂时不可用' }, { status: 502 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!raw) {
      return NextResponse.json({ success: false, error: 'AI 返回为空' }, { status: 500 });
    }

    let parsed: LayoutAdjustment;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {
          return NextResponse.json({ success: false, error: 'AI 返回解析失败' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ success: false, error: 'AI 返回解析失败' }, { status: 500 });
      }
    }

    // Clamp values to safe ranges
    const result: LayoutAdjustment = {
      baseFontSize: Math.max(10, Math.min(16, parsed.baseFontSize || 13)),
      titleFontSize: Math.max(18, Math.min(26, parsed.titleFontSize || 22)),
      headerFontSize: Math.max(18, Math.min(26, parsed.headerFontSize || 22)),
      lineHeight: Math.max(1.2, Math.min(1.8, parsed.lineHeight || 1.5)),
      sectionGap: Math.max(8, Math.min(20, parsed.sectionGap || 14)),
      paddingTop: Math.max(8, Math.min(20, parsed.paddingTop || 10)),
      paddingBottom: Math.max(8, Math.min(20, parsed.paddingBottom || 10)),
      reasoning: parsed.reasoning || '',
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Auto-layout error:', err);
    return NextResponse.json({ success: false, error: err.message || '排版调整失败' }, { status: 500 });
  }
}

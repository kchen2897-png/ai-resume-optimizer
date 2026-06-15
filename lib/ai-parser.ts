/**
 * Shared AI resume parsing logic.
 * Used by both /api/parse-resume and /api/upload-resume routes.
 */

import { buildParseSystemPrompt, buildParseUserPrompt } from "@/lib/prompts/parser";

export interface ParseResult {
  success: boolean;
  modules?: any[];
  error?: string;
}

/**
 * Call DeepSeek API to parse raw resume text into structured modules.
 */
export async function parseResumeWithAI(rawText: string): Promise<ParseResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { success: false, error: "未配置 API Key" };
  }

  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 4096,
        messages: [
          { role: "system", content: buildParseSystemPrompt() },
          { role: "user", content: buildParseUserPrompt(rawText.trim()) },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("DeepSeek parse error:", err);
      return { success: false, error: "AI 解析服务暂时不可用" };
    }

    const data = await response.json();
    const rawOutput = data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!rawOutput) {
      return { success: false, error: "AI 返回空内容" };
    }

    // Extract JSON from response
    let parsed: any;
    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return { success: false, error: "AI 返回格式解析失败" };
        }
      } else {
        return { success: false, error: "AI 返回格式解析失败" };
      }
    }

    const modules = parsed.modules || parsed.data?.modules || [];
    if (!Array.isArray(modules) || modules.length === 0) {
      return { success: false, error: "AI 未能识别简历结构" };
    }

    return { success: true, modules };
  } catch (err: any) {
    console.error("Parse resume error:", err);
    return { success: false, error: err.message || "解析失败" };
  }
}

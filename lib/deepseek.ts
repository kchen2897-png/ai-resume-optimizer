import OpenAI from "openai";
import type { OptimizeRequest, ComparisonResult, PolishRequest, PolishResult } from "./types";
import { buildOptimizerSystemPrompt, buildOptimizerUserPrompt } from "./prompts/optimizer";
import { buildPolishSystemPrompt, buildPolishUserPrompt } from "./prompts/builder";

// Comparison-based optimization
export async function callDeepSeekOptimize(
  params: OptimizeRequest,
  apiKey: string,
  model: string
): Promise<ComparisonResult> {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

  const response = await client.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 8192,
    messages: [
      { role: "system", content: buildOptimizerSystemPrompt() },
      { role: "user", content: buildOptimizerUserPrompt(params) },
    ],
  });

  const rawText = response.choices[0]?.message?.content?.trim() ?? "";

  if (!rawText) {
    throw new Error("AI 返回内容为空，请重试");
  }

  let parsed: ComparisonResult;
  try {
    parsed = JSON.parse(rawText) as ComparisonResult;
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]) as ComparisonResult;
      } catch {
        throw new Error("AI 返回内容解析失败，请重试");
      }
    } else {
      throw new Error("AI 返回内容解析失败，请重试");
    }
  }

  validateComparisonResult(parsed);
  return parsed;
}

// Per-field text polishing
export async function callDeepSeekPolish(
  params: PolishRequest,
  apiKey: string,
  model: string
): Promise<PolishResult> {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

  const response = await client.chat.completions.create({
    model,
    temperature: 0.5,
    max_tokens: 1024,
    messages: [
      { role: "system", content: buildPolishSystemPrompt() },
      { role: "user", content: buildPolishUserPrompt(params) },
    ],
  });

  const rawText = response.choices[0]?.message?.content?.trim() ?? "";

  if (!rawText) {
    throw new Error("AI 返回内容为空，请重试");
  }

  let parsed: PolishResult;
  try {
    parsed = JSON.parse(rawText) as PolishResult;
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]) as PolishResult;
      } catch {
        throw new Error("AI 返回内容解析失败，请重试");
      }
    } else {
      throw new Error("AI 返回内容解析失败，请重试");
    }
  }

  if (!parsed.polishedText) {
    throw new Error("AI 未返回润色文本");
  }

  return parsed;
}

function validateComparisonResult(data: unknown): asserts data is ComparisonResult {
  const d = data as Record<string, unknown>;
  if (typeof d.score !== "number") throw new Error("AI 返回数据缺少 score 字段");
  if (typeof d.summary !== "string") throw new Error("AI 返回数据缺少 summary 字段");
  if (!d.matchAnalysis || typeof d.matchAnalysis !== "object") throw new Error("AI 返回数据缺少 matchAnalysis 字段");
  if (!Array.isArray(d.comparisons)) throw new Error("AI 返回数据缺少 comparisons 字段");
}

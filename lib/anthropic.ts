import OpenAI from "openai";
import type { OptimizeResult, OptimizeRequest, ComparisonResult, PolishRequest, PolishResult } from "./types";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { buildOptimizerSystemPrompt, buildOptimizerUserPrompt } from "./prompts/optimizer";
import { buildPolishSystemPrompt, buildPolishUserPrompt } from "./prompts/builder";

export async function callClaudeAPI(
  params: OptimizeRequest,
  apiKey: string,
  model: string
): Promise<OptimizeResult> {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

  const response = await client.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 4096,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(params) },
    ],
  });

  const rawText = response.choices[0]?.message?.content?.trim() ?? "";

  if (!rawText) {
    throw new Error("AI 返回内容为空或格式不正确，请重试");
  }

  let parsed: OptimizeResult;
  try {
    parsed = JSON.parse(rawText) as OptimizeResult;
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]) as OptimizeResult;
      } catch {
        throw new Error("AI 返回内容解析失败，请重试");
      }
    } else {
      throw new Error("AI 返回内容解析失败，请重试");
    }
  }

  validateOptimizeResult(parsed);

  return parsed;
}

// Module A: Comparison-based optimization
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

// Module B: Per-field text polishing
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

function validateOptimizeResult(data: unknown): asserts data is OptimizeResult {
  const d = data as Record<string, unknown>;

  if (typeof d.score !== "number") {
    throw new Error("AI 返回数据缺少 score 字段");
  }
  if (typeof d.summary !== "string") {
    throw new Error("AI 返回数据缺少 summary 字段");
  }
  if (!d.matchAnalysis || typeof d.matchAnalysis !== "object") {
    throw new Error("AI 返回数据缺少 matchAnalysis 字段");
  }
  if (!Array.isArray(d.problems)) {
    throw new Error("AI 返回数据缺少 problems 字段");
  }
  if (!Array.isArray(d.suggestions)) {
    throw new Error("AI 返回数据缺少 suggestions 字段");
  }
  if (!d.atsKeywords || typeof d.atsKeywords !== "object") {
    throw new Error("AI 返回数据缺少 atsKeywords 字段");
  }
  if (typeof d.rewrittenResume !== "string") {
    throw new Error("AI 返回数据缺少 rewrittenResume 字段");
  }
}

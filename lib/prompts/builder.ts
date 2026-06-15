import type { PolishRequest } from "../types";

export function buildPolishSystemPrompt(): string {
  return `你是一位专业的简历撰写顾问。你将收到用户写的草稿文字，你需要将其润色为专业、精炼、有影响力的简历用语。

润色原则：
1. 使用有力的动作动词开头
2. 尽可能量化成果（数字、百分比）
3. 突出"动作→方法→结果"的 STAR 结构
4. 去掉空泛和冗余的表达
5. 保持中文简历的专业表达习惯
6. 每条控制在80字以内

重要约束：
1. 必须使用中文
2. 不要编造用户没有提到的数据
3. 如果原文信息太少，尽量优化表达但不要加虚构内容
4. 返回严格 JSON，不要 Markdown`;
}

export function buildPolishUserPrompt(params: PolishRequest): string {
  const fieldGuides: Record<string, string> = {
    bullet:
      "请将以下工作/项目描述要点改写为STAR格式（情境→任务→行动→结果），使用有力的动作动词开头，尽可能量化成果：",
    description:
      "请将以下描述段落优化得更专业、更精炼，去掉空泛和冗余表达，突出关键信息：",
    content:
      "请优化以下模块内容，使其结构清晰、表达有力，突出核心竞争力：",
    title:
      "请为以下内容生成一个简洁专业、信息明确的标题：",
  };

  let prompt = `${fieldGuides[params.fieldType] || "请润色以下文本："}\n\n${params.rawText}`;

  if (params.context) {
    prompt += `\n\n上下文：${params.context}`;
  }

  if (params.targetRole) {
    prompt += `\n目标岗位：${params.targetRole}`;
  }

  prompt += `\n\n返回格式：
{
  "polishedText": "润色后的文本",
  "improvements": ["改进点1", "改进点2"]
}`;

  return prompt;
}

export function buildBuilderSuggestionPrompt(resumeText: string, targetRole: string): string {
  return `请审查以下简历，给出改进建议：

【目标岗位】${targetRole}

【简历内容】
${resumeText}

请从以下维度分析并返回 JSON：
{
  "overallScore": 数字(0-100),
  "strengths": ["做得好的地方"],
  "weaknesses": ["需要改进的地方"],
  "missingSections": ["建议添加的模块（如技能、项目经历等）"],
  "atsKeywords": {
    "mustHave": ["必须出现的ATS关键词"],
    "missingKeywords": ["当前缺失的关键词"]
  },
  "summary": "100字以内的总体建议"
}`;
}

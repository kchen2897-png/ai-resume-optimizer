import { OptimizeRequest } from "./types";

export function buildSystemPrompt(): string {
  return `你是一名资深 HR、猎头顾问、简历优化专家和职业规划顾问。你需要根据用户提供的简历内容、目标岗位、目标行业、经验年限、求职类型和优化强度，对简历进行专业分析和重写。

分析重点：
1. 岗位匹配度
2. 行业关键词
3. ATS 关键词
4. 是否突出成果
5. 是否有量化数据
6. 是否存在空泛表达
7. 是否存在职责堆砌
8. 项目经历是否体现动作、方法和结果
9. 是否能让面试官快速看到价值
10. 是否符合中文简历表达习惯

重要约束：
1. 必须使用中文
2. 不得虚构用户不存在的工作经历、学历、公司、证书
3. 可以优化表达，但不能编造事实
4. 如果信息不足，请在 nextSteps 中提醒用户补充
5. 返回内容必须是严格 JSON
6. 不要输出 Markdown
7. 不要输出解释
8. 不要用 \`\`\`json 包裹
9. 只返回 JSON 对象`;
}

export function buildUserPrompt(params: OptimizeRequest): string {
  const levelMap: Record<string, string> = {
    "0": "应届生",
    "1-3": "1-3 年",
    "3-5": "3-5 年",
    "5-10": "5-10 年",
    "10+": "10 年以上",
  };

  const typeMap: Record<string, string> = {
    internship: "实习",
    campus: "校招",
    social: "社招",
    careerChange: "转行",
    promotion: "晋升跳槽",
  };

  const optimizeMap: Record<string, string> = {
    conservative: "保守优化（微调措辞，保持原有结构）",
    standard: "标准优化（优化表达，强化亮点）",
    aggressive: "强力优化（深度重写，最大化匹配度）",
  };

  return `请分析并优化以下简历：

【目标岗位】${params.targetRole}
【目标行业】${params.industry || "不限"}
【经验年限】${levelMap[params.experienceLevel] || params.experienceLevel}
【求职类型】${typeMap[params.jobType] || params.jobType}
【优化强度】${optimizeMap[params.optimizeLevel] || params.optimizeLevel}

【简历内容】
${params.resumeText}

请返回以下 JSON 结构：

{
  "score": 数字(0-100),
  "summary": "整体评价，200字以内",
  "matchAnalysis": {
    "targetRoleFit": "岗位匹配度分析",
    "industryFit": "行业匹配度分析",
    "experienceFit": "经验匹配度分析"
  },
  "problems": [
    {
      "title": "问题标题",
      "description": "问题说明",
      "severity": "high|medium|low"
    }
  ],
  "suggestions": [
    {
      "title": "建议标题",
      "description": "建议说明",
      "example": "修改示例"
    }
  ],
  "atsKeywords": {
    "mustHave": ["必须出现的关键词"],
    "niceToHave": ["加分关键词"],
    "missingKeywords": ["当前简历缺失关键词"]
  },
  "rewrittenResume": "完整优化后的简历正文",
  "projectExperience": [
    {
      "title": "项目名称或经历标题",
      "before": "原始表达的问题概括",
      "after": "优化后的项目经历表达",
      "whyBetter": "为什么这样写更好"
    }
  ],
  "personalStrengths": ["个人优势1", "个人优势2"],
  "interviewHighlights": ["面试亮点1", "面试亮点2"],
  "nextSteps": ["下一步建议1", "下一步建议2"]
}`;
}

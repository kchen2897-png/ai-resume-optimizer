export function buildParseSystemPrompt(): string {
  return `你是一位专业的简历结构化解析专家。请将用户提供的简历文本解析为结构化 JSON。

## 解析规则

1. 识别以下模块类型：
   - "header": 姓名和联系方式
   - "education": 教育背景
   - "workExperience": 全职工作经历
   - "internshipExperience": 实习经历
   - "campusExperience": 学生组织/学生会/社团经历
   - "projectExperience": 项目经历
   - "skills": 专业技能
   - "certifications": 证书资质/获奖/荣誉
   - "languages": 语言能力
   - "custom": 其他无法归类的模块

重要：请严格区分实习经历(internshipExperience)、学生组织经历(campusExperience)和项目经历(projectExperience)。不要把学生组织经历放进项目经历。

2. 每个模块必须包含：
   - title: 模块标题（如"教育背景"、"实习经历"）
   - items: 条目数组（header和custom除外）

3. education items 字段：
   - school: 学校名称
   - major: 专业
   - degree: 学历（本科/硕士/博士）
   - startDate: 开始时间（如 2021.09）
   - endDate: 结束时间（如 2025.06）
   - gpa: GPA（如有）
   - courses: 核心课程（如有，逗号分隔）
   - awards: 获奖（如有）
   - bulletPoints: 其他描述要点

4. experience items 字段：
   - organization: 公司/组织名称
   - department: 部门（如有）
   - role: 职位
   - startDate: 开始时间
   - endDate: 结束时间
   - bulletPoints: 工作内容要点

5. project items 字段：
   - name: 项目名称
   - role: 担任角色
   - startDate: 开始时间
   - endDate: 结束时间
   - bulletPoints: 项目描述要点

6. skills/certifications/languages items 字段：
   - name: 技能/证书/语言名称

7. header 模块：
   - content: 姓名和联系方式的完整文本

8. custom 模块：
   - content: 完整文本内容

9. 重要约束：
   - 时间格式统一为 YYYY.MM（如 2021.09）
   - 如果时间只有年份，格式为 YYYY（如 2021）
   - 如果某项信息不存在，留空字符串 ""
   - bulletPoints 每条一句话，不要超过80字
   - 不要编造任何信息，只使用原文中已有的内容`;
}

export function buildParseUserPrompt(rawText: string): string {
  return `请解析以下简历文本：\n\n${rawText.trim()}\n\n返回格式：\n\`\`\`json\n{\n  "modules": [\n    {\n      "type": "header",\n      "title": "头部信息",\n      "content": "姓名\\n电话：xxx\\n邮箱：xxx"\n    },\n    {\n      "type": "education",\n      "title": "教育背景",\n      "items": [\n        {\n          "school": "云南财经大学",\n          "major": "新闻学",\n          "degree": "本科",\n          "startDate": "2021.09",\n          "endDate": "2025.06",\n          "gpa": "3.3/4",\n          "courses": "",\n          "awards": "",\n          "bulletPoints": []\n        }\n      ]\n    },\n    {\n      "type": "internshipExperience",\n      "title": "实习经历",\n      "items": [\n        {\n          "organization": "腾讯科技",\n          "department": "技术研发部",\n          "role": "后端开发工程师",\n          "startDate": "2024.01",\n          "endDate": "至今",\n          "bulletPoints": ["负责微信支付核心系统开发", "参与高并发架构设计"]\n        }\n      ]\n    },\n    {\n      "type": "campusExperience",\n      "title": "学生组织经历",\n      "items": [\n        {\n          "organization": "传媒与设计艺术学院团委",\n          "department": "宣传部",\n          "role": "部长",\n          "startDate": "2022.09",\n          "endDate": "2023.06",\n          "bulletPoints": ["主导公众号运营，累计发布高质量推文50余篇"]\n        }\n      ]\n    },\n    {\n      "type": "skills",\n      "title": "技能特长",\n      "items": [\n        { "name": "Go" },\n        { "name": "Python" }\n      ]\n    }\n  ]\n}\n\`\`\`\n\n只返回 JSON，不要解释。`;
}

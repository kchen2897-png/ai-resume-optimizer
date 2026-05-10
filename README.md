# AI 简历优化器

使用 Claude AI 智能分析和优化你的简历，提升岗位匹配度，获得更多面试机会。

## 功能列表

- 智能简历分析：Claude AI 从多维度评估简历质量
- 综合评分：0-100 分简历综合评分
- 匹配度分析：岗位匹配度、行业匹配度、经验匹配度
- 问题诊断：按严重程度（严重/中等/轻微）列出简历问题
- 优化建议：提供具体可操作的修改建议和示例
- ATS 关键词：列出必须出现、加分和缺失的关键词
- 简历重写：输出完整优化后的简历正文
- 项目经历优化：对比展示优化前后的项目描述
- 面试亮点：提炼面试中可以强调的亮点
- 下一步建议：后续改进方向
- 一键复制：支持复制优化后简历、关键词、项目经历
- 多种优化强度：保守/标准/强力优化

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`)
- **图标**: Lucide React
- **工具**: clsx

## 本地运行步骤

### 1. 克隆项目

```bash
cd ai-resume-optimizer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API Key：

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 如何配置 ANTHROPIC_API_KEY

1. 访问 [Anthropic Console](https://console.anthropic.com/) 注册账号
2. 在 API Keys 页面创建新的 API Key
3. 将 API Key 复制到 `.env.local` 中的 `ANTHROPIC_API_KEY` 字段

## 如何部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-resume-optimizer)

### 手动部署

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 中导入该仓库
3. 在 Vercel 项目设置中添加环境变量：
   - `ANTHROPIC_API_KEY`: 你的 Anthropic API Key
   - `ANTHROPIC_MODEL`: `claude-3-5-haiku-latest`（可选）
4. 部署

## 隐私说明

本项目默认不存储用户简历数据。所有 AI 分析请求直接转发至 Anthropic API，不经过任何第三方服务器存储。

## 后续商业化扩展方向

- 用户登录：支持账号体系，保存用户优化历史
- 历史记录：查看过往优化记录和简历版本
- PDF 导出：将优化后的简历导出为 PDF
- Word 导出：将优化后的简历导出为 Word 文档
- 岗位 JD 匹配：上传 JD 进行精准匹配优化
- 付费套餐：免费版（基础优化）、Pro 版（深度优化 + 多次使用）
- 简历模板：提供多种简历排版模板
- 多语言：支持英文简历优化
- 面试题库：根据优化结果推荐面试准备题目

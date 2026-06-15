# AI 简历工具箱

上传简历 PDF，AI 自动解析、优化、排版，导出专业简历。

## 功能

- 📤 **PDF 上传解析** — 服务端 PyMuPDF 精准提取文字，AI 自动结构化
- 📝 **AI 简历优化器** — 逐段对比原文与优化版，ATS 关键词分析，综合评分
- 🎨 **AI 简历制作器** — 可视化拖拽编辑，A4 实时预览，AI 逐字段润色
- 📄 **PDF 导出** — 服务端 Puppeteer 渲染，与预览完全一致
- 💾 **自动保存** — 编辑内容自动持久化，刷新不丢失

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| AI | DeepSeek API (`deepseek-chat`) |
| PDF 提取 | PyMuPDF (fitz) |
| PDF 导出 | Puppeteer + @sparticuz/chromium-min |
| 拖拽 | @dnd-kit |

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 安装 PyMuPDF（PDF 文字提取）

```bash
pip install PyMuPDF
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```
DEEPSEEK_API_KEY=sk-xxxxxxxx
DEEPSEEK_MODEL=deepseek-chat
```

### 4. 启动

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
├── app/
│   ├── page.tsx                          # 首页（PDF 上传入口）
│   ├── layout.tsx                        # 全局布局 + 导航
│   ├── optimizer/
│   │   └── page.tsx                      # AI 简历优化器
│   ├── builder/
│   │   └── page.tsx                      # AI 简历制作器
│   └── api/
│       ├── upload-resume/                # PDF 上传 + 解析
│       ├── parse-resume/                 # 文本 → 结构化模块
│       ├── optimizer/
│       │   ├── optimize/                 # AI 逐段优化
│       │   └── optimize-and-parse/       # 优化 + 解析合并
│       └── builder/
│           ├── polish/                   # AI 单字段润色
│           ├── auto-layout/              # AI 排版适配
│           └── export-pdf/               # Puppeteer PDF 导出
├── components/
│   ├── LandingUpload.tsx                 # 首页 PDF 上传区
│   ├── NavHeader.tsx                     # 全局导航栏
│   ├── editor/                           # 制作器组件
│   │   ├── VisualEditor.tsx              # 主控布局
│   │   ├── ResumePreview.tsx             # A4 实时预览
│   │   ├── EditorToolbar.tsx             # 工具栏
│   │   ├── BlockStyleBar.tsx             # 样式工具栏
│   │   ├── SpacingPanel.tsx              # 间距控制面板
│   │   ├── LineSpacingControl.tsx        # 行间距控制
│   │   └── ExportMenu.tsx                # 导出菜单
│   ├── optimizer/                        # 优化器组件
│   └── builder/                          # 制作器辅助组件
├── contexts/
│   └── EditorContext.tsx                 # 编辑器状态管理（undo/redo/auto-save）
├── lib/
│   ├── editor-types.ts                   # 编辑器类型定义
│   ├── deepseek.ts                       # DeepSeek API 调用
│   ├── ai-parser.ts                      # AI 简历解析
│   ├── server-pdf-extractor.ts           # PyMuPDF 服务端提取
│   ├── extract_pdf.py                    # Python 提取脚本
│   ├── header-parser.ts                  # 头部信息解析
│   ├── resume-pdf-html.ts               # PDF HTML 模板
│   ├── resume-serializer.ts             # 模块序列化
│   └── prompts/                          # AI 提示词
└── public/
```

## 部署到 Vercel

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 添加环境变量：
   - `DEEPSEEK_API_KEY` — DeepSeek API Key
   - `DEEPSEEK_MODEL` — `deepseek-chat`
   - `CHROMIUM_REMOTE_EXEC_PATH` — `https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar.br`
4. 升级到 Vercel Pro（Hobby 10s 超时不够 PDF 生成）
5. 部署

## License

MIT

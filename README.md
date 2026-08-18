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

### 5. 上传链路自检

启动本地服务后，另开一个终端运行：

```bash
npm run check:upload
```

脚本会生成一份测试 PDF 并请求 `/api/upload-resume`。只要 PDF 上传和文字提取正常，即使没有配置 AI Key，也会通过并返回 `rawText`。

检查线上环境：

```bash
npm run check:upload -- --url=https://你的域名/api/upload-resume
```

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

## 部署到 Railway

1. 在 Railway 服务中配置：
   - `DEEPSEEK_API_KEY` — DeepSeek API Key
   - `DEEPSEEK_MODEL` — `deepseek-chat`
2. 从干净、已同步的 `master` 分支运行：

```bash
railway up --service powerful-mercy --environment production
```

3. Railway 会读取 `railway.json`，构建后通过 `/api/health` 才会切换线上流量。
4. Chromium 已作为锁定依赖随应用部署，不再需要 `CHROMIUM_REMOTE_EXEC_PATH`。
5. 部署完成后执行：

```bash
npm run check:deploy -- --url=https://你的域名
npm run check:upload -- --url=https://你的域名/api/upload-resume
```

## 稳定性约定

- 使用 Node.js `>=22 <25`，避免 PDF 解析依赖在不支持的运行时上异常。
- 直接依赖使用精确版本，部署时优先使用 `npm ci`，不要让依赖在重建时自动漂移。
- `/api/upload-resume` 和 PDF 导出接口都配置了 60 秒执行时间。
- `/api/health` 会检查服务、DeepSeek 配置和 PDF 运行环境；健康检查失败时 Railway 不会把故障版本切到线上。
- GitHub Actions 会在 `master` 更新时执行完整生产构建，尽早发现类型和依赖问题。
- 上传失败响应包含 `code`、`stage`、`requestId`。用户看到错误编号时，可以用该编号查服务端日志。
- 每次部署后同时运行 `check:deploy` 和 `check:upload`，验证页面、健康接口、PDF 导出、上传和文字提取。

## License

MIT

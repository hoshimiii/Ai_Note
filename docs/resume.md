# AI 看板笔记系统 — 简历描述

## 项目概览

**AI 看板笔记系统（AiKanban）**  
个人全栈前端项目 · React + TypeScript · 2025

一款融合 Kanban 项目管理与结构化笔记、AI 辅助的本地优先 Web 应用，支持工作区 → Mission → Board → Task → SubTask 五级任务层级，以及与 Markdown 笔记的双向绑定。

---

## 技术栈

| 类别     | 技术                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 框架     | React 19、TypeScript 5.9、Vite 7                                                      |
| 状态管理 | Zustand 5（`persist` 中间件，localStorage 持久化 + 版本迁移）                         |
| 路由     | React Router 7                                                                        |
| 拖拽     | @dnd-kit/core + @dnd-kit/sortable（多层级可排序拖拽）                                 |
| UI 组件  | shadcn/ui（Radix UI 原语）、Tailwind CSS 4、Lucide 图标                               |
| 动画     | Framer Motion（ChatBot 浮窗出入场）                                                   |
| Markdown | react-markdown + remark-math + rehype-katex（数学公式渲染）                           |
| 代码编辑 | @uiw/react-codemirror（代码块编辑器）                                                 |
| AI 接入  | Vercel AI SDK（`ai` + `@ai-sdk/openai`）、SiliconFlow / DeepSeek-V3 API，SSE 流式输出 |
| 数据存储 | 纯前端 localStorage（Zustand persist）                                                |

---

## 核心功能实现

### 1. 五级任务层级 + 数据模型设计

- 设计 `WorkSpace → Mission → Board → Task → SubTask` 五级嵌套数据结构，全部存储于 Zustand store 并持久化至 localStorage
- 实现 store 版本迁移机制（`migrate` 函数），保证旧数据在结构升级时平滑兼容

### 2. 多层级拖拽排序

- 引入 `@dnd-kit/sortable`，实现三个维度的拖拽排序：
  - **Mission 侧边栏**：垂直列表排序
  - **Board 面板**：水平网格排序
  - **Task 卡片**：同 Board 内位置插入 + 跨 Board 移动（含目标 index）
- 使用 `PointerSensor`（5px 激活阈值）防止误触，`isDragging` 透明度反馈提升体验
- 实现悬停 Mission 500ms 自动切换预览的交互（`useRef` + `setTimeout`）

### 3. SubTask 子任务系统

- 每个 Task 支持多个 SubTask，含展开/折叠、完成 checkbox、行内双击编辑
- SubTask 可关联指定 Note 的指定 Block，点击后自动导航并滚动高亮目标 Block（`scrollIntoView` + `classList` 闪烁动画）

### 4. 结构化 Markdown 笔记 + Block 编辑

- Note 以 Block 列表为基本单元，支持 `markdown` / `code` 两种类型
- Markdown Block 实现点击定位光标（`caretRangeFromPoint` 计算字符偏移）、防抖 500ms 自动保存
- 支持从富文本粘贴内容并自动转换为 Markdown（自定义 `htmlToMarkdown` 解析器，覆盖标题/列表/引用/代码块/行内格式等节点）
- 支持 LaTeX 数学公式渲染（KaTeX）

### 5. Task ↔ Note 双向绑定

- Task 可关联 Note，Note 可反向关联 Task，切换时自动更新双端 `relatedTaskId` / `linkedNoteIds`
- `Ctrl + 点击` Task 快速跳转到关联 Note

### 6. AI 聊天助手

- 浮窗 ChatBot 支持三种布局模式：右下角浮窗 / 右侧边栏 / 底部横幅，Framer Motion 动画切换
- 调用 SiliconFlow（DeepSeek-V3）API，手动实现 SSE 流式读取（`ReadableStream` + `TextDecoder`），逐字实时渲染回复
- 使用 Zustand persist 持久化历史对话，支持滑动上下文窗口（`contextlength` 参数）

---

## 规划中功能（Agent 笔记管理）

> 以下为下一阶段迭代方向，展示 AI 深度集成能力

### AI Agent 驱动的笔记管理

- **结构化摘要生成**：Agent 读取当前 Note 的 Block 列表，自动生成摘要并作为新 Block 插入笔记尾部
- **Task 智能拆解**：用户描述一个大目标，Agent 自动生成 SubTask 列表并写入 Task 的 subTasks 字段，无需手动创建
- **笔记语义搜索**：对所有 Note 的 Block 内容建立本地向量索引（transformers.js / 本地 embedding），支持自然语言检索笔记片段
- **上下文感知问答**：ChatBot 可读取当前打开的 Note 内容作为 context，回答基于笔记内容的问题（RAG 简化版）
- **跨 Note 关联推荐**：Agent 分析多个 Note 的内容相似度，自动建议 SubTask 与 Note Block 之间的关联关系，减少手动 Link 操作
- **工具调用（Function Calling）**：将 Zustand store 的核心操作（createTask、addSubTask、linkSubTask、createNote 等）封装为 AI 工具函数，使 Agent 可直接操作看板数据

---

## 项目亮点

- **本地优先**：零后端依赖，数据全部存储于浏览器 localStorage，隐私安全
- **类型安全**：全量 TypeScript，Zustand store 类型严格推导，无 `any` 泄漏
- **交互细节**：拖拽手柄、hover 渐显操作栏、Block 点击定位光标、SubTask 连接高亮滚动等多处交互精细打磨
- **可扩展架构**：五级数据模型与 AI 工具调用接口预留，便于后续接入 LLM Agent 进行自动化任务管理

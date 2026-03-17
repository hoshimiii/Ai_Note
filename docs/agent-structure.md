# AI Agent 目录结构与封装方案

基于 Vercel AI SDK，在现有项目基础上规划 Agent 的目录与职责划分。

---

## 当前项目结构（src 相关）

```
src/
├── components/
│   ├── ChatBot/          # 现有：ChatPanel、ChatBotWindow
│   ├── Board/
│   ├── Note/
│   ├── items/
│   └── utils/            # apiutils.ts、RandomGenerator.ts
├── store/
│   ├── kanban/           # 看板 + 笔记数据
│   ├── Chatbot/          # 现有：消息、输入、getresponse
│   └── notes/
├── pages/
├── router/
├── hooks/
└── lib/
```

---

## 推荐 Agent 目录结构

```
src/
├── agent/                        # 新建：Agent 核心层
│   ├── index.ts                  # 统一导出
│   ├── config.ts                 # 模型、API、system prompt
│   ├── tools/                    # 工具定义与执行
│   │   ├── index.ts              # 导出所有 tools
│   │   ├── kanban-tools.ts       # createTask、addSubTask、linkSubTask 等
│   │   └── note-tools.ts         # createNote、createBlock、updateBlock 等
│   └── run.ts                    # streamText 调用封装（含 tools、maxSteps）
│
├── store/
│   ├── kanban/
│   └── agent/                    # 新建：替代或扩展 Chatbot
│       └── index.ts              # useChat 状态、消息、isLoading
│
├── components/
│   └── ChatBot/
│       ├── ChatPanel.tsx         # 接入 useChat + toolCallStreaming
│       └── ChatBotWindow.tsx
│
└── lib/                          # 可选：API 代理
    └── api/
        └── chat.ts               # POST /api/chat 封装（若加后端）
```

---

## 各层职责与封装

### 1. `src/agent/` — Agent 核心层

| 文件 | 职责 | 内容示例 |
|------|------|----------|
| `config.ts` | 模型配置、system prompt | `model`、`baseURL`、`systemPrompt` 字符串 |
| `tools/index.ts` | 汇总 tools 对象 | `export const agentTools = { createTask, addSubTask, ... }` |
| `tools/kanban-tools.ts` | 看板相关 tools | `createTask`、`addSubTask`、`linkSubTask`、`createBoard` 等，参数用 Zod schema |
| `tools/note-tools.ts` | 笔记相关 tools | `createNote`、`createBlock`、`searchNotes` 等 |
| `run.ts` | 调用 AI SDK | `streamText({ model, messages, tools: agentTools, maxSteps })`，返回 `result` |
| `index.ts` | 统一导出 | `export { agentTools, runAgent, systemPrompt } from './run'` |

**依赖关系**：`tools/*` 依赖 `@/store/kanban` 的 `useWorkSpace.getState()`，不依赖 React 组件。

---

### 2. `src/agent/tools/` — 工具定义规范

每个 tool 遵循 AI SDK 格式：

```ts
// tools/kanban-tools.ts
import { tool } from 'ai';
import { z } from 'zod';
import { useWorkSpace } from '@/store/kanban';

export const createTask = tool({
  description: '在指定 Board 下创建新 Task',
  parameters: z.object({
    boardId: z.string(),
    title: z.string(),
  }),
  execute: async ({ boardId, title }) => {
    const { boards, updataBoard } = useWorkSpace.getState();
    const board = boards[boardId];
    if (!board) return { success: false, error: 'Board 不存在' };
    const newTask = { TaskId: generateRandomId(), title, linkedNoteIds: '', subTasks: [] };
    updataBoard(boardId, [...board.Tasks, newTask]);
    return { success: true, taskId: newTask.TaskId };
  },
});
```

**分层建议**：
- `kanban-tools.ts`：Board、Task、SubTask、Mission 相关
- `note-tools.ts`：Note、Block 相关
- 若后续有搜索/RAG，可新增 `search-tools.ts`

---

### 3. `src/store/agent/` — Agent 状态层

| 文件 | 职责 | 与现有 Chatbot 的关系 |
|------|------|------------------------|
| `index.ts` | 管理 Agent 对话状态 | 可逐步替代 `store/Chatbot`，或与 Chatbot 并存（先并存再迁移） |

**推荐**：新建 `store/agent`，用 AI SDK 的 `useChat` 管理消息；`ChatPanel` 改为使用 `useChat`，原有 `useChatbot` 可保留作兼容或逐步下线。

---

### 4. `src/components/ChatBot/` — UI 层

| 文件 | 修改点 |
|------|--------|
| `ChatPanel.tsx` | 使用 `useChat`，传入 `api`（或 `streamText` 的封装）、`experimental_toolCallStreaming`，渲染 tool 调用状态 |
| `ChatBotWindow.tsx` | 基本不变，仍负责浮窗/侧边栏/底部模式 |

---

### 5. 可选：`src/lib/api/` — 后端代理层

若后续加 Node/Next API 代理：

```
src/lib/api/
└── chat.ts    # fetch('/api/chat', { body: messages }) 封装
```

前端 `run.ts` 中 `streamText` 的 `api` 指向 `/api/chat`，API Key 放在服务端环境变量。

---

## 依赖流向图

```
ChatPanel (UI)
    ↓ useChat
store/agent (状态)
    ↓ 调用
agent/run.ts (streamText)
    ↓ tools
agent/tools/* (execute)
    ↓ getState()
store/kanban (数据)
```

---

## 实施顺序建议

1. 创建 `src/agent/tools/`，实现 2～3 个基础 tools（如 `createTask`、`addSubTask`）
2. 创建 `src/agent/config.ts`、`run.ts`，用 `streamText` 接入 tools
3. 创建 `src/store/agent/index.ts`，用 `useChat` 替代现有 `getresponse` 流程
4. 修改 `ChatPanel` 接入 `useChat`，支持 tool 调用展示
5. 按需补充更多 tools，并考虑后端代理

---

## 与现有代码的衔接

| 现有 | 迁移/衔接方式 |
|------|----------------|
| `store/Chatbot` | 新建 `store/agent` 后，ChatPanel 改用 `useChat`；Chatbot 可保留作配置（API URL、token）或逐步废弃 |
| `components/utils/apiutils.ts` | `sendMessage` 可保留给非 Agent 场景，Agent 走 `agent/run.ts` |
| `store/kanban` | 不变，tools 的 `execute` 内通过 `useWorkSpace.getState()` 调用 |

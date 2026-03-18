# 架构重构：分层解耦

**改动时间**: 2026-03-17

## 重构前的问题

1. `store/Chatbot/index.ts` 职责过重：同时包含 UI 状态、HTTP 请求、SSE 流式解析、上下文裁剪逻辑
2. `components/utils/apiutils.ts` 中 `model` 参数被忽略（硬编码 `DeepSeek-V3`）
3. `agent/Agent_LLM.ts` 直接依赖 `store/Chatbot` 的类型，Agent 无法脱离 React 独立运行

---

## 重构后的分层结构

```
src/
├── api/
│   └── llm.ts              # 纯网络层：fetchLLMStream，只负责 fetch
│
├── services/
│   └── LLMService.ts       # 业务逻辑层：streamCompletion / completion / sliceContext
│
├── store/
│   └── Chatbot/index.ts    # 状态层：只管 messages/input/isLoading，调用 services
│
└── agent/
    ├── Agent_LLM.ts        # LLMClient 适配器，桥接 services 与 ReActAgent
    └── ReActAgent/
        └── main.ts         # ReActAgent 实现，依赖 LLMClient 接口，无 React 依赖
```

---

## 各层职责

| 层 | 职责 | 禁止 |
|---|---|---|
| `api/` | fetch、HTTP 头、body 序列化 | React、store、业务逻辑 |
| `services/` | SSE 解析、上下文裁剪、completion | React hook、store、DOM |
| `store/` | 状态读写，调用 services | 直接 fetch、复杂业务逻辑 |
| `agent/` | Agent 推理循环、Tool 调用 | 依赖 store 类型、React hook |
| `components/` | 渲染、用户交互 | 直接调 api、绕过 store |

---

## 文件变更

### 新增

#### `src/api/llm.ts`
- 导出 `LLMConfig`、`ApiMessage` 类型
- `fetchLLMStream(messages, config)` → 返回 `Response`（raw）

#### `src/services/LLMService.ts`
- `streamCompletion(messages, config)` → `AsyncGenerator<string>`，SSE 解析逻辑从 store 迁移到此
- `completion(messages, config)` → `Promise<string>`，收集完整响应
- `sliceContext(messages, contextLength)` → `ApiMessage[]`，上下文裁剪

### 重构

#### `src/store/Chatbot/index.ts`
- 移除 `getresponse`、`getcontext`、`getBoturl`、`chatbotApi`、`baseurl`、`usertoken` 等暴露的 API 细节
- 新增 `config: LLMConfig` 统一管理连接配置
- 新增 `sendMessage(input)` → 调用 `streamCompletion`，实时更新 messages
- `handleSubmit` 直接调用 `sendMessage`，不再需要组件传参
- `getContext(contextLength)` 替代原 `getcontext`

#### `src/agent/Agent_LLM.ts`
- 由 class 改为工厂函数 `createAgentLLM(config)` → `LLMClient`
- 不再依赖任何 store 或 React，只依赖 `services/LLMService`

#### `src/components/ChatBot/ChatPanel.tsx`
- 移除 `getresponse`、`getcontext`、`usertoken`、`baseurl` 的调用
- `handleSubmit` 即可完成提交 + 请求全流程

### 废弃

- `src/components/utils/apiutils.ts` 的 `sendMessage` → 由 `src/api/llm.ts` 的 `fetchLLMStream` 替代（修复了 model 硬编码问题）

---

## ReActAgent 使用示例

```ts
import { createAgentLLM } from "@/agent/Agent_LLM";
import { ReActAgent } from "@/agent/ReActAgent/main";

const llm = createAgentLLM({
    baseurl: "https://api.siliconflow.cn/v1/chat/completions",
    model: "deepseek-ai/DeepSeek-V3.2",
    usertoken: "sk-xxx",
});

const agent = new ReActAgent(llm, toolExecutor);
const answer = await agent.run("帮我计算 (123 + 456) * 789 / 12");
```

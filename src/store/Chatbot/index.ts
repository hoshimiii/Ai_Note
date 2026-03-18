import { generateRandomId } from "@/components/utils/RandomGenerator";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sliceContext, type LLMConfig, type ApiMessage } from "@/services/LLMService";
import { createAgentLLM } from "@/agent/Agent_LLM";
import ReActAgent from "@/agent/ReActAgent/main";
import { createKanbanToolExecutor } from "@/agent/tools/kanbantools";

export type Message = {
    messageId: string;
    messageContent: string;
    role: "user" | "assistant" | "chatbot";
    messageCreatedAt: string;
    messageTimestamp: number;
};

export interface ChatbotState {
    chatbotId: string;
    chatbotName: string;
    chatbotDescription: string;
    config: LLMConfig;
    messages: Message[];
    input: string;
    isLoading: boolean;

    setConfig: (config: Partial<LLMConfig>) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (
        e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
        input: string
    ) => void;
    sendMessage: (input: string) => Promise<void>;
    getContext: (contextLength: number) => ApiMessage[];
    clearMessages: () => void;
}

export const useChatbot = create<ChatbotState>()(
    persist(
        (set, get) => ({
            chatbotId: generateRandomId(),
            chatbotName: "Chatbot",
            chatbotDescription: "test",
            config: {
                baseurl: "https://api.siliconflow.cn/v1/chat/completions",
                model: "deepseek-ai/DeepSeek-V3.2",
                usertoken: "sk-vnasjeozmivbxcsjqvijtutshvncclxzwdhrcycolkladrzo",
            },
            messages: [],
            input: "",
            isLoading: false,

            setConfig: (partial) =>
                set((state) => ({ config: { ...state.config, ...partial } })),

            handleInputChange: (e) => set({ input: e.target.value }),

            handleSubmit: (e, input) => {
                e.preventDefault();
                if (!input.trim()) return;
                set({ input: "" });
                get().sendMessage(input);
            },

            sendMessage: async (input: string) => {
                if (!input.trim()) return;
                const userMsg: Message = {
                    messageId: generateRandomId(),
                    messageContent: input,
                    role: "user",
                    messageCreatedAt: new Date().toISOString(),
                    messageTimestamp: Date.now(),
                };
                set((state) => ({ messages: [...state.messages, userMsg], isLoading: true }));

                const botMsgId = generateRandomId();
                const botMsg: Message = {
                    messageId: botMsgId,
                    messageContent: "",
                    role: "chatbot",
                    messageCreatedAt: new Date().toISOString(),
                    messageTimestamp: Date.now(),
                };
                set((state) => ({ messages: [...state.messages, botMsg] }));

                const historyLines = get()
                    .messages
                    .slice(-10)
                    .map((m) => `${m.role}: ${m.messageContent}`);

                const llm = createAgentLLM(get().config);
                const toolExecutor = createKanbanToolExecutor();
                const agent = new ReActAgent(llm, toolExecutor);

                try {
                    const answer = (await agent.run(input, historyLines)) ?? "";
                    set((state) => ({
                        messages: state.messages.map((m) =>
                            m.messageId === botMsgId
                                ? { ...m, messageContent: answer }
                                : m
                        ),
                    }));
                } finally {
                    set({ isLoading: false });
                }
            },

            getContext: (contextLength: number) => sliceContext(get().messages, contextLength),

            clearMessages: () => set({ messages: [] }),
        }),
        { name: "chatbot-storage" }
    )
);

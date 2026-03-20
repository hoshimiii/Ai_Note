import { generateRandomId } from "@/components/utils/RandomGenerator";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sliceContext, type LLMConfig, type ApiMessage } from "@/services/LLMService";
import { runLangChainAgent } from "@/agent/langchain/runner";

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
    resetChatbot: () => void;
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
                usertoken: "",
                temperature: 0.7,
                userRules: "",
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
                const now = new Date().toISOString();
                const userMsg: Message = {
                    messageId: generateRandomId(),
                    messageContent: input,
                    role: "user",
                    messageCreatedAt: now,
                    messageTimestamp: Date.now(),
                };
                set((state) => ({ messages: [...state.messages, userMsg], isLoading: true }));

                const botMsgId = generateRandomId();
                const botMsg: Message = {
                    messageId: botMsgId,
                    messageContent: "",
                    role: "chatbot",
                    messageCreatedAt: now,
                    messageTimestamp: Date.now(),
                };
                set((state) => ({ messages: [...state.messages, botMsg] }));

                const historyLines = get()
                    .messages
                    .filter((m) => m.role !== "assistant")
                    .slice(-10)
                    .map((m) => `${m.role}: ${m.messageContent}`);

                try {
                    const answer = await runLangChainAgent(get().config, input, historyLines, {
                        onTrace: ({ step, phase, content }) => {
                            const title =
                                phase === "thought"
                                    ? `思考 ${step}`
                                    : phase === "action"
                                        ? `动作 ${step}`
                                        : `观察 ${step}`;
                            set((state) => ({
                                messages: [
                                    ...state.messages,
                                    {
                                        messageId: generateRandomId(),
                                        messageContent: `### ${title}\n${content}`,
                                        role: "assistant",
                                        messageCreatedAt: new Date().toISOString(),
                                        messageTimestamp: Date.now(),
                                    },
                                ],
                            }));
                        },
                    });
                    set((state) => ({
                        messages: state.messages.map((m) =>
                            m.messageId === botMsgId
                                ? { ...m, messageContent: answer }
                                : m
                        ),
                    }));
                } catch (e) {
                    const errMsg = e instanceof Error ? e.message : String(e);
                    set((state) => ({
                        messages: state.messages.map((m) =>
                            m.messageId === botMsgId ? { ...m, messageContent: `错误: ${errMsg}` } : m
                        ),
                    }));
                } finally {
                    set({ isLoading: false });
                }
            },

            getContext: (contextLength: number) => sliceContext(get().messages, contextLength),

            clearMessages: () => set({ messages: [] }),
            resetChatbot: () =>
                set({
                    chatbotId: generateRandomId(),
                    messages: [],
                    input: "",
                    isLoading: false,
                }),
        }),
        { name: "chatbot-storage" }
    )
);

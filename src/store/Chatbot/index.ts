import { sendMessage } from "@/components/utils/apiutils";
import { generateRandomId } from "@/components/utils/RandomGenerator";
import { create } from "zustand";
import { persist } from "zustand/middleware";


export type Message = {
    messageId: string;
    messageContent: string;
    role: 'user' | 'chatbot';
    messageCreatedAt: string;
    messageTimestamp: number;
}

interface ChatbotProps {
    chatbotId: string;
    chatbotName: string;
    chatbotDescription: string;
    baseurl: string;
    chatbotModel: string;
    chatbotApi: string;
    usertoken: string;
    messages: Message[];
    input: string;
    isLoading: boolean;
    handleSubmit: (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    setchatbotApi: (api: string) => void;
    setusertoken: (token: string) => void;
    getresponse: (messages: { role: 'user' | 'assistant'; content: string }[], usertoken: string, baseurl: string) => void;
    getcontext: (messages: Message[], contextlength: number) => { role: 'user' | 'assistant'; content: string }[];
    getBoturl: () => void;
}


export const useChatbot = create<ChatbotProps>()(
    persist(
        (set, get) => ({
            chatbotId: generateRandomId(),
            chatbotName: 'Chatbot',
            chatbotDescription: 'test',
            baseurl: 'https://api.siliconflow.cn/v1/chat/completions',
            chatbotModel: 'deepseek-ai/DeepSeek-V3.2',
            usertoken: 'sk-vnasjeozmivbxcsjqvijtutshvncclxzwdhrcycolkladrzo',
            messages: [],
            input: '',
            isLoading: false,
            chatbotApi: '',
            handleSubmit(e) {
                e.preventDefault();
                const currentInput = get().input.trim();
                if (!currentInput) return;
                set({
                    input: '',
                    messages: [...get().messages, {
                        messageId: generateRandomId(),
                        messageContent: currentInput,
                        role: 'user',
                        messageCreatedAt: new Date().toISOString(),
                        messageTimestamp: Date.now(),
                    }]
                });
            },
            getBoturl: () => {
                set({})
                return 'https://api.siliconflow.cn/v1';
            },
            setchatbotApi: (api) => {
                set({ chatbotApi: api });
            },
            setusertoken: (token) => {
                set({ usertoken: token });
            },
            handleInputChange: (e) => {
                set({ input: e.target.value });
            },

            getcontext: (messages, contextlength) => {
                return messages.slice(-contextlength).map(msg => ({
                    role: msg.role === 'chatbot' ? 'assistant' as const : 'user' as const,
                    content: msg.messageContent,
                }));
            },
            getresponse: async (messages, usertoken, baseurl) => {
                const response = await sendMessage(messages, usertoken, baseurl, get().chatbotModel)

                // 非流式传输
                // set({
                //     messages: [...get().messages, {
                //         messageId: generateRandomId(),
                //         messageContent: chunk.choices[0].message.content,
                //         role: 'chatbot',
                //         messageCreatedAt: new Date().toISOString(),
                //         messageTimestamp: Date.now(),
                //     }]
                // });
                // return response

                //流式传输
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let fullContent = ""; // 缓存完整内容

                if (!reader) return;
                const newMessageId = generateRandomId()
                set({
                    messages: [...get().messages, {
                        messageId: newMessageId,
                        messageContent: '',
                        role: 'chatbot',
                        messageCreatedAt: new Date().toISOString(),
                        messageTimestamp: Date.now()
                    }]
                })
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed === 'data: [DONE]') continue;

                        if (trimmed.startsWith('data: ')) {
                            try {
                                const json = JSON.parse(trimmed.slice(6));
                                // 假设后端结构是 { choices: [{ delta: { content: "..." } }] }
                                const content = json.choices[0]?.delta?.content || "";

                                fullContent += content;

                                set({ messages: get().messages.map(msg => msg.messageId === newMessageId ? { ...msg, messageContent: fullContent } : msg) })
                                // 实时更新状态，触发 UI 重新渲染
                            } catch (e) {
                                console.error("解析碎片失败", e);
                            }
                        }
                    }
                }

            }
        }),
        { name: 'chatbot-storage' }
    )
)

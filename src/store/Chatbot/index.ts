import { generateRandomId } from "@/components/utils/RandomGenerator";
import { create } from "zustand";
import { persist } from "zustand/middleware";


type Message = {
    messageId: string;
    messageContent: string;
    messageType: 'user' | 'chatbot';
    messageCreatedAt: string;
}

interface ChatbotProps {
    chatbotId: string;
    chatbotName: string;
    chatbotDescription: string;
    chatbotApi: string;
    messages: Message[];
    input: string;
    handleSubmit: (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    setchatbotApi: (api: string) => void;
    isLoading: boolean;
}


export const useChatbot = create<ChatbotProps>()(
    persist(
        (set, get) => ({
            chatbotId: generateRandomId(),
            chatbotName: 'Chatbot',
            chatbotDescription: 'test',
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
                        messageType: 'user',
                        messageCreatedAt: new Date().toISOString(),
                    }]
                });
            },
            handleInputChange: (e) => {
                set({ input: e.target.value });
            },
            setchatbotApi: (api) => {
                set({ chatbotApi: api });
            },
        }),
        { name: 'chatbot-storage' }
    )
)

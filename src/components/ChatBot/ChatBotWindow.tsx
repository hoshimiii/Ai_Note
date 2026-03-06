"use client";
import { useState } from "react";
import { MessageCircle, X, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatPanel } from "@/components/ChatBot/ChatPanel"; // 刚才写的面板逻辑
import { cn } from "@/lib/utils";
import { useChatbot } from "@/store/Chatbot";

export function ChatController() {
    const { chatbotId } = useChatbot();
    const [isOpen, setIsOpen] = useState(false);
    const [isFloating, setIsFloating] = useState(true); // 切换模式的状态

    return (
        <>
            {/* 1. 触发按钮（悬浮在右下角） */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 p-4 bg-primary text-gray-900 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
            >
                {isOpen ? <X /> : <MessageCircle />}
            </button>

            {/* 2. 动画容器 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={cn(
                            "z-40 bg-background border shadow-2xl flex flex-col transition-all duration-300",
                            // 根据状态动态切换样式
                            isFloating
                                ? "fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl"
                                : "fixed top-0 right-0 h-screen w-96 rounded-none border-l"
                        )}
                    >
                        {/* 头部控制栏 */}
                        <div className="p-3 border-b flex justify-between items-center bg-muted/30">
                            <span className="font-bold text-sm">AI 任务助手</span>
                            <button onClick={() => setIsFloating(!isFloating)} className="hover:bg-accent p-1 rounded">
                                {isFloating ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                        </div>

                        {/* 具体的对话内容组件 */}
                        <ChatPanel activeChatbotId={chatbotId} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
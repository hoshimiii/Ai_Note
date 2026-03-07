"use client";
import { useState } from "react";
import { MessageCircle, X, Minimize2, Maximize2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatPanel } from "@/components/ChatBot/ChatPanel"; // 刚才写的面板逻辑
import { cn } from "@/lib/utils";
import { useChatbot } from "@/store/Chatbot";

export function ChatController() {
    const { chatbotId } = useChatbot();
    const [isOpen, setIsOpen] = useState(false);
    const [FloatMode, setIsFloating] = useState(0); // 切换模式的状态 0 1 2 0作为右下角浮动，1作为侧边栏，2作为底部对话框形式（防止遮挡）

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
                            FloatMode === 0
                                ? "fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl"
                                : FloatMode === 1
                                    ? "fixed top-0 right-0 h-screen w-96 rounded-none border-l"
                                    : "fixed bottom-44 left-0 w-full h-[30vh] rounded-t-2xl"
                        )}
                    >
                        {/* 头部控制栏 */}
                        <div className={cn(FloatMode !== 2 ? "p-3 border-b flex justify-between items-center bg-muted/30" : "p-3 border-b flex justify-between items-center bg-muted/30")}>
                            <span className="font-bold text-sm">小ai同学</span>
                            <button onClick={() => setIsFloating(2)} className="ml-auto hover:bg-accent p-1 rounded" title={FloatMode === 0 ? "切换至底部模式" : "返回浮窗"}>
                                {FloatMode !== 2 ? <ChevronDown size={16} /> : ''}
                            </button>
                            <button onClick={() => setIsFloating(FloatMode === 0 ? 1 : 0)} className="hover:bg-accent p-1 rounded" title={FloatMode === 0 ? "切换到侧边栏" : "返回浮窗"}>
                                {FloatMode !== 1 ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                        </div>

                        {/* 具体的对话内容组件 */}
                        <ChatPanel activeChatbotId={chatbotId} FloatMode={FloatMode} />
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
}
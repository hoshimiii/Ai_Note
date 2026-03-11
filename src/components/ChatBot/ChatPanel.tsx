
import { useEffect, useRef } from "react";
import { useChatbot } from "@/store/Chatbot";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils"; // 之前讨论过的 cn 函数
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface ChatPanelProps {
    activeChatbotId: string;
    FloatMode: string | number;
}

export function ChatPanel({ activeChatbotId, FloatMode }: ChatPanelProps) {
    // useChat 会自动处理消息状态、输入框状态、以及流式请求
    const { usertoken, messages, handleSubmit, getcontext, isLoading, getresponse } = useChatbot();
    const scrollRef = useRef<HTMLDivElement>(null);
    const { chatbotApi, baseurl } = useChatbot();
    // 自动滚动逻辑：每当有新消息（包括流式输出的字）时，滚动到底部
    useEffect(() => {
        // console.log(activeChatbotId)
        console.log(messages)
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [messages]);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div className={cn(FloatMode !== 2 ? "flex flex-col h-full bg-background" : "flex flex-col w-full h-full bg-background")}>
            {/* 1. 消息滚动区域 */}
            <ScrollArea ref={scrollRef} className={cn(FloatMode !== 2 ? "flex-1 p-4 h-[60vh]" : "flex-1 p-4 h-[30vh]")}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50 mt-20">
                        <Bot size={40} />
                        <p className="text-sm">我是你的看板助手，有什么可以帮你的吗？</p>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.messageId}
                        className={cn(
                            "mb-6 flex gap-3",
                            m.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        {/* 头像 */}
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"
                        )}>
                            {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        {/* 气泡 */}
                        <div className={cn(
                            FloatMode !== 2 ? "max-w-[300px]" : "max-w-[500px]",
                            " rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                            m.role === "user"
                                ? "bg-gray-200 text-foreground rounded-tr-none"
                                : "bg-blue-100 text-foreground rounded-tl-none border"
                        )}>
                            <div className="min-w-0 whitespace-pre-wrap [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
                                {/* prose prose-sm dark:prose-invert */}
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}>
                                    {/* {m.messageContent} */}
                                    {(isLoading && (m.role === "assistant" || m.role === "chatbot") && !m.messageContent)
                                        ? "正在思考..."
                                        : m.messageContent.replace(/\\n/g, "\n")}

                                </ReactMarkdown>
                            </div>

                        </div>
                    </div>
                ))}

                {/* AI 正在输入的 Loading 状态 */}
                {/* {&& (
                    <div className="flex gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
                            
                        </div>
                        <div className="bg-muted/50 rounded-2xl px-4 py-2 text-sm animate-pulse">
                            正在思考...
                        </div>
                    </div>
                )} */}
            </ScrollArea>

            {/* 2. 输入区域 */}
            <div className="p-4 border-t bg-background">
                <form
                    onSubmit={(e) => handleSubmit(e, inputRef.current?.value ?? '')}
                    className="relative flex items-center gap-2">
                    <textarea
                        rows={1}
                        ref={inputRef}
                        // onChange={(e) => handleInputChange(e)}
                        placeholder="输入消息..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e, inputRef.current?.value ?? '');
                                getresponse(getcontext(messages, 10), usertoken, baseurl);
                                if (inputRef.current) {
                                    inputRef.current.value = '';
                                }
                            }
                        }}
                        className="flex-1 min-h-[40px] max-h-32 p-3 bg-muted/50 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                    />
                    <Button
                        type="submit"
                        size="icon"

                        disabled={isLoading || !inputRef.current?.value.trim()}
                        className="shrink-0 rounded-xl text-gray-900"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                    </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                    AI 可能生成错误信息，请核实重要事项。
                </p>
            </div>
        </div>
    );
}
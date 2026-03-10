import { type Block as BlockType } from "@/store/kanban";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";


export const Block = ({ block, content, onChange }: { block: BlockType, content: string, onChange: (content: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <>
            {!isEditing ? (
                (() => {

                    switch (block.blockType) {
                        case 'markdown':
                            return (
                                <textarea
                                    value={content}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="w-full field-sizing-content min-w-1 p-3 border rounded resize-none font-mono"
                                    placeholder="输入 Markdown 内容..."
                                />
                            );
                        case 'code':
                            return (
                                <CodeMirror
                                    value={content}
                                    onChange={(value) => onChange(value)}
                                    className="w-full field-sizing-content min-w-1 p-3 border rounded resize-none font-mono"
                                />
                            );
                    }
                })()
            ) : (
                (() => {
                    switch (block.blockType) {
                        case 'markdown':
                            return (
                                <div onClick={() => setIsEditing(true)} className="min-h-12 border">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                        {content}
                                    </ReactMarkdown>
                                </div>
                            );
                        case 'code':
                            return (
                                <div onClick={() => setIsEditing(true)} className="min-h-12 border">
                                    <CodeMirror
                                        value={content}
                                        onChange={(value) => onChange(value)}
                                        className="w-full field-sizing-content min-w-1 p-3 border rounded resize-none font-mono"
                                    />
                                </div>
                            );
                        default:
                            return <div>Unknown block type: {block.blockType}</div>;
                    }
                })()
            )}
        </>
    );
}

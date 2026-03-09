// import { useNotes, type Note as NoteType } from "@/store/notes";
import { useWorkSpace, type Note as NoteType } from "@/store/kanban";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { useState } from "react";
import { Button } from "../ui/button";


export const NoteItem = ({ note }: { note: NoteType }) => {
    return (
        <div className="flex flex-col gap-2 text-sm p-1 ml-2">
            {note.noteTitle}
        </div>
    )
}


export const Note = ({ note, activeMissionId }: { note: NoteType, activeMissionId: string }) => {
    const { updateNote } = useWorkSpace();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(note?.noteContent || "开始笔记内容...");
    // const isActive = nowNoteId === note.noteId;

    const handleSave = () => {
        updateNote(activeMissionId, note.noteId, { ...note, noteContent: content, noteUpdatedAt: new Date().toISOString() });
        setIsEditing(false);
    };

    return (
        <div className="p-4" >
            <div className="flex justify-between items-center mb-4"
                onDoubleClick={() => { if (isEditing) setIsEditing(false); handleSave() }}>
                <h3 className="text-lg font-semibold">{note?.noteTitle}</h3>
                <Button variant="ghost" size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="px-3 py-1 bg-blue-50 rounded hover:bg-blue-600"
                >
                    {isEditing ? '保存' : '编辑'}
                </Button>
            </div>

            {isEditing ? (
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-96 p-3 border rounded resize-none font-mono"
                    placeholder="输入 Markdown 内容..."
                />
            ) : (
                <div className="prose max-w-none"
                    onDoubleClick={() => setIsEditing(true)}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}>
                        {content}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    )
}
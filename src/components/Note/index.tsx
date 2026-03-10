import { useWorkSpace, type Note as NoteType } from "@/store/kanban";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { DeleteDialog } from "../items/DeleteDialog";
import { RenameDialog } from "../items/RenameDialog";
import { SidebarMenuAction } from "../ui/sidebar";
import { TrashIcon } from "lucide-react";
import { PencilIcon } from "lucide-react";
import { Block } from "./Block";
import { LinkTaskDialog } from "../items/LinkTaskDialog";
import { generateRandomId } from "../utils/RandomGenerator";


export const NoteItem = ({ note, nowmission }: { note: NoteType, nowmission: string }) => {
    const { deleteNote, RenameNote, setActiveNote } = useWorkSpace();
    useEffect(() => {
        const handlePopState = () => {
            // 当用户点击鼠标侧键或浏览器后退按钮时
            // 检查当前 URL 状态，如果回到了任务页，则重置 activeNoteId
            setActiveNote(nowmission, null);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    return (
        <div className="flex flex-col gap-2 text-sm p-1 ml-2 h-4">
            <div className="flex justify-between items-center">
                {note.noteTitle}
                <div className="flex items-end">
                    <SidebarMenuAction asChild>
                        <DeleteDialog
                            title="确定要删除任务吗?"
                            description="此操作无法撤销，相关数据将永久消失"
                            onConfirm={() => deleteNote(nowmission, note.noteId)}
                            trigger={<Button variant="ghost" size="sm" className="cursor-pointer group-hover/menu-item:block hidden"><TrashIcon className="w-4 h-4 text-red-500" /></Button>} />

                    </SidebarMenuAction>
                    <SidebarMenuAction asChild>
                        <RenameDialog
                            title="重命名?"
                            initialName={note.noteTitle}
                            onConfirm={(newName) => RenameNote(nowmission, note.noteId, newName)}
                            trigger={<Button variant="ghost" size="sm" className="cursor-pointer group-hover/menu-item:block hidden"><PencilIcon className="w-4 h-4 text-blue-500" /></Button>} />
                    </SidebarMenuAction>
                </div>
            </div>
        </div>
    )
}


export const Note = ({ note, activeMissionId }: { note: NoteType, activeMissionId: string }) => {
    const { missions, boards, updateNote, createBlock, deleteBlock } = useWorkSpace();

    const [localContents, setLocalContents] = useState<Record<string, string>>(
        () => Object.fromEntries(note?.blocks?.map(b => [b.blockId, b.blockContent]) ?? [])
    );

    useEffect(() => {
        setLocalContents(Object.fromEntries(note?.blocks?.map(b => [b.blockId, b.blockContent]) ?? []));
    }, [note?.noteId]);

    useEffect(() => {
        setLocalContents(prev => {
            const next = { ...prev };
            note?.blocks?.forEach(b => {
                if (!(b.blockId in next)) {
                    next[b.blockId] = b.blockContent;
                }
            });
            return next;
        });
    }, [note?.blocks]);

    const handleBlockChange = (blockId: string, content: string) => {
        setLocalContents(prev => ({ ...prev, [blockId]: content }));
    };

    const handleSave = () => {
        const updatedNote: NoteType = {
            ...note,
            blocks: note?.blocks?.map(b => ({
                ...b,
                blockContent: localContents[b.blockId] ?? b.blockContent,
                blockUpdatedAt: new Date().toISOString(),
            })),
            noteUpdatedAt: new Date().toISOString(),
        };
        updateNote(activeMissionId, note?.noteId ?? '', updatedNote);
    };

    const handleLinkTask = (note: NoteType | null, taskId: string | null) => {
        if (!note) return;
        const updatedNote: NoteType = {
            ...note,
            relatedTaskId: taskId || "",
            noteUpdatedAt: new Date().toISOString(),
        };
        updateNote(activeMissionId, note.noteId, updatedNote);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-lg font-semibold">{note?.noteTitle}</h3>
                <Button variant="ghost" size="sm"
                    onClick={handleSave}
                    className="px-3 py-1 bg-blue-50 rounded hover:bg-blue-600"
                >
                    保存
                </Button>
                <LinkTaskDialog
                    note={note}
                    activeMissionId={activeMissionId}
                    missions={missions}
                    boards={boards}
                    onConfirm={handleLinkTask}
                    trigger={<Button variant="ghost" size="sm">Link to Task</Button>}
                />
            </div>

            {note?.blocks?.map((block) => (
                <div className="p-1">
                    <DeleteDialog
                        title="确定要删除这个块吗?"
                        description={`此操作将永久删除块及其所有关联的任务数据。`}
                        onConfirm={() => deleteBlock(note, block.blockId)}
                    />
                    <Block
                        key={block.blockId}
                        block={block}
                        content={localContents[block.blockId] ?? block.blockContent}
                        onChange={(content) => handleBlockChange(block.blockId, content)}
                    />
                </div>

            ))}
            <Button variant="outline" className="cursor-pointer text-black"
                onClick={() => createBlock(note, {
                    blockId: generateRandomId(),
                    blockType: 'markdown',
                    blockContent: '',
                    blockCreatedAt: new Date().toISOString(),
                    blockUpdatedAt: new Date().toISOString()
                })}>create markdown block</Button>
            <Button variant="outline" className="cursor-pointer text-black"
                onClick={() => createBlock(note, {
                    blockId: generateRandomId(),
                    blockType: 'code',
                    blockContent: '',
                    blockCreatedAt: new Date().toISOString(),
                    blockUpdatedAt: new Date().toISOString()
                })}>create code block</Button>
        </div>
    );
}
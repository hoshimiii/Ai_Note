import { useWorkSpace } from "@/store/kanban";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/items/DeleteDialog";
import { Hand, PencilIcon, TrashIcon } from "lucide-react";
import { RenameDialog } from "@/components/items/RenameDialog";
// import { Mission } from "@/components/Mission";
import { DndContext, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/core";
import { MainPage } from "../mainPage";
import { MissionItem } from "@/components/Mission";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { generateRandomId } from "@/components/utils/RandomGenerator";
import { ChatController } from "@/components/ChatBot/ChatBotWindow";
// import { useNotes} from "@/store/notes";
import { type Mission as MissionType } from "@/store/kanban";
import { type Note as NoteType } from "@/store/kanban";
// import {type Note as NoteType} from "@/store/notes";
import { NoteItem } from "@/components/Note";



export const WorkPage = () => {
    const { workspaces, activeWorkSpaceId, activeMissionId, missions,
        setWorkSpace,
        createMission, setMission, deleteMission, RenameMission,
        addNotesToMission, setActiveNote,
        moveTask,
        createNote,
    } = useWorkSpace();
    const navigate = useNavigate();

    const activeMissions = Object.values(missions).filter((mission) => mission.WorkSpaceId === activeWorkSpaceId);
    const activateNoteId = activeMissions.find((mission) => mission.MissionId === activeMissionId)?.activateNoteId;
    // 用 useRef 保存跨渲染的可变值，用 useState 驱动 UI 更新
    const currentHoverIdRef = useRef<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const preMissionIdRef = useRef<string | null>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);

    const HandleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active.data.current?.type === 'task') {
            // 记录拖拽开始时的 Mission，供恢复用
            preMissionIdRef.current = activeMissionId;
        }
    };

    const HandleDragOver = (event: DragOverEvent) => {
        const { over } = event;

        // 进入 board 区域：恢复清晰，方便确认放置位置
        if (over?.data.current?.type === 'board') {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
                currentHoverIdRef.current = null;
            }
            setIsPreviewing(false);
            return;
        }

        // 不在任何可放置区域，或不在 mission 上：清除计时器
        if (!over || over.data.current?.type !== 'mission') {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
                currentHoverIdRef.current = null;
            }
            return;
        }

        const overId = over.id as string;

        if (overId !== currentHoverIdRef.current) {
            if (timerRef.current) clearTimeout(timerRef.current);
            currentHoverIdRef.current = overId;

            // 停留 500ms 后切换预览 Mission
            timerRef.current = setTimeout(() => {
                setMission(overId);
                setIsPreviewing(true);
            }, 500);
        }
    };

    const HandleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // 清理悬停计时器
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        currentHoverIdRef.current = null;

        if (over && over.data.current?.type === 'board') {
            const [, ABId, ATId] = String(active.id).split('+');
            const [, OBId] = String(over.id).split('+');
            moveTask(ATId, ABId, OBId);
        } else {
            // 未落到 board，恢复原 Mission
            setMission(preMissionIdRef.current);
        }

        setIsPreviewing(false);
        preMissionIdRef.current = null;

    };
    const handleClickmission = (missionId: string) => {
        setMission(missionId);
        setActiveNote(missionId, null)
    };
    const handleClicknote = (missionId: string, noteId: string) => {
        setMission(missionId)
        setActiveNote(missionId, noteId);
    };

    return (
        <div>
            <SidebarProvider>
                <DndContext
                    onDragStart={HandleDragStart}
                    onDragEnd={HandleDragEnd}
                    onDragOver={HandleDragOver}
                >
                    {/* 这里SidebarProvider的作用是什么： SidebarProvider是用来提供Sidebar的，也就是提供Sidebar的上下文，也就是提供Sidebar的上下文 */}
                    <Sidebar side="left">
                        <SidebarHeader> {workspaces.find(workspace => workspace.workspaceId === activeWorkSpaceId)?.workspaceName}</SidebarHeader>
                        <Button
                            variant="outline"
                            onClick={() => { setMission(null), setWorkSpace(null), navigate('/workspace') }}
                            className="cursor-pointer mx-4 mb-2"
                        >
                            返回工作区
                        </Button>

                        <SidebarContent>
                            <Button className="cursor-pointer" variant="outline" onClick={() => createMission({
                                MissionId: generateRandomId(),
                                activateNoteId: '',
                                WorkSpaceId: activeWorkSpaceId || '',
                                title: 'New Mission',
                                Notes: []
                            })}>Create New Mission</Button>
                            <SidebarMenu>
                                {activeMissions.map((mission) => (
                                    <SidebarMenuItem className="group/menu-item flex-col bg-gray-100 rounded-md p-1 " key={mission.MissionId}>
                                        <div className="flex justify-between items-center">
                                            <SidebarMenuButton className="cursor-pointer w-[70%]" variant="default" onClick={() => handleClickmission(mission.MissionId)}>
                                                <MissionItem MissionId={mission.MissionId} WorkSpaceId={mission.WorkSpaceId} title={mission.title} Notes={mission.Notes ?? []} />
                                            </SidebarMenuButton>
                                            <SidebarMenuAction asChild>
                                                <DeleteDialog
                                                    title="确定要删除任务吗?"
                                                    description="此操作无法撤销，相关数据将永久消失"
                                                    onConfirm={() => deleteMission(mission.MissionId)}
                                                    trigger={<Button variant="ghost" size="sm" className="cursor-pointer group-hover/menu-item:block hidden"><TrashIcon className="w-4 h-4 text-red-500" /></Button>} />

                                            </SidebarMenuAction>
                                            <SidebarMenuAction asChild>
                                                <RenameDialog
                                                    title="重命名?"
                                                    initialName={mission.title}
                                                    onConfirm={(newName) => RenameMission(mission.MissionId, newName)}
                                                    trigger={<Button variant="ghost" size="sm" className="cursor-pointer group-hover/menu-item:block hidden"><PencilIcon className="w-4 h-4 text-blue-500" /></Button>} />
                                            </SidebarMenuAction>
                                        </div>
                                        {mission.MissionId === activeMissionId && (
                                            <SidebarMenuSub className="group/sub-menu-item flex bg-gray-200 rounded-md p-1 " key={'notes'}>
                                                <SidebarContent>
                                                    {mission.Notes?.map((note) => (
                                                        <SidebarMenuItem key={note.noteId} onClick={() => handleClicknote(mission.MissionId, note.noteId)}>
                                                            <NoteItem note={note} />
                                                        </SidebarMenuItem>
                                                    ))}
                                                </SidebarContent>
                                                <SidebarMenuSubButton>
                                                    <Button className="cursor-pointer" variant="outline" onClick={() => createNote(mission.MissionId, {
                                                        noteId: generateRandomId(),
                                                        noteTitle: 'New Note',
                                                        noteContent: '',
                                                        noteCreatedAt: new Date().toISOString(),
                                                        noteUpdatedAt: new Date().toISOString(),
                                                        relatedTaskId: '',
                                                        blocks: []
                                                    })}>create new note</Button>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSub>
                                        )}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarContent>



                    </Sidebar>

                    <main className={cn("flex-1 w-full transition-all duration-200", isPreviewing ? "opacity-50 scale-95 blur-in-sm" : "opacity-100 scale-95 blur-0")}>
                        <SidebarTrigger className="bg-gray-200 w-[20px] h-[20px]" />
                        <MainPage
                            nowMissionId={activeMissionId}
                            nowNoteId={activateNoteId ?? null}
                            Note_item={activeMissions.find((mission: MissionType) => mission.MissionId === activeMissionId)?.Notes?.find((note) => note.noteId === activateNoteId) ?? null as unknown as NoteType} />
                        <ChatController />
                        <Outlet />
                        {/* outlet的作用是什么： outlet渲染子组件需不需要包含住被渲染的组件？ 是的，outlet渲染子组件需要包含住被渲染的组件。
                    那这里为什么用<Outlet />的形式 */}
                    </main>
                </DndContext>
            </SidebarProvider>
        </div >
    )
}
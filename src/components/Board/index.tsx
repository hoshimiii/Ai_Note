import { useWorkSpace } from "@/store/kanban";
import { Button } from "../ui/button";
import { DeleteDialog } from "../items/DeleteDialog";
import { RenameDialog } from "../items/RenameDialog";
import { LinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Task } from "./Task";
import { BoardItem } from "./BoardItem";
import { generateRandomId } from "../utils/RandomGenerator";
import { LinkNoteDialog } from "../items/LinkNoteDialog";
import { useEffect, useState } from "react";



// DOM of Board
export const Board = ({ nowMissionId, setActiveNoteId }: { nowMissionId: string, setActiveNoteId: (noteId: string) => void }) => {
    // const { boards, updateBoard, moveTask } = useKanban();
    const { missions, boards, tasks, deleteBoard, RenameBoard, updataBoard, createTask, deleteTask, RenameTask, setLinkedNoteIds } = useWorkSpace();
    const activeMissionId = nowMissionId;
    const activeboards = Object.values(boards).filter(board => board.MissionId === activeMissionId);
    return (
        <>
            <div className="flex flex-wrap w-full gap-2">
                {activeboards.map(board => (
                    <div className="flex flex-col gap-2 w-[30%] h-fit bg-blue-100 rounded-md p-2 group" key={board.BoardId}>
                        <BoardItem id={activeMissionId + '+' + board.BoardId} title={board.title}>
                            {/* <div className="flex flex-row gap-2"> */}

                            {/* {board.title} */}
                            <div className="flex  items-center gap-1 opacity-0  pointer-events-none transition-opacity
                                            group-hover:opacity-100 group-hover:pointer-events-auto
                                            group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                                <DeleteDialog
                                    title="确定要删除吗?"
                                    description="此操作无法撤销，相关数据将永久消失"
                                    onConfirm={() => deleteBoard(board.BoardId)}
                                    trigger={<Button variant="ghost" size="icon" className="cursor-pointer h-fit w-6"><TrashIcon className="w-4 h-4 text-red-500" /></Button>}
                                />
                                <RenameDialog
                                    initialName={board.title}
                                    title="重命名"
                                    onConfirm={(newName: string) => RenameBoard(board.BoardId, newName)}
                                    trigger={<Button variant="ghost" size="icon" className="cursor-pointer h-fit w-6"><PencilIcon className="w-4 h-4 text-blue-500" /></Button>}
                                />
                            </div>

                            {/* </div> */}

                            {board.Tasks.map(task => (
                                <div key={task.TaskId} className="flex items-center group/task  bg-white">
                                    <Task id={activeMissionId + '+' + board.BoardId + '+' + task.TaskId} title={task.title} linkedNoteIds={task.linkedNoteIds} setActiveNoteId={setActiveNoteId} />
                                    <div className="flex bg-gray-100 items-center gap-1 opacity-0 pointer-events-none transition-opacity
                                            group-hover/task:opacity-100 group-hover/task:pointer-events-auto
                                            group-focus-within/task:opacity-100 group-focus-within/task:pointer-events-auto">
                                            <DeleteDialog
                                                title="确定要删除吗?"
                                            description="此操作无法撤销，相关数据将永久消失"
                                            onConfirm={() => deleteTask(board.BoardId, task.TaskId)}
                                            trigger={<Button variant="ghost" size="icon" className="cursor-pointer h-fit w-6"><TrashIcon className="w-4 h-4 text-red-500" /></Button>}
                                        />
                                        {/* <RenameDialog
                                            initialName={task.title}
                                            title="重命名"
                                            onConfirm={(newName: string) => RenameTask(board.BoardId, task.TaskId, newName)}
                                            trigger={<Button variant="ghost" size="icon" className="cursor-pointer h-fit w-6"><PencilIcon className="w-4 h-4 text-blue-500" /></Button>}
                                        /> */}
                                        <LinkNoteDialog
                                            noteIds={missions[activeMissionId].Notes.map(note => note.noteId)}
                                            TaskId={task.TaskId}
                                            BoardId={board.BoardId}
                                            activeMissionId={activeMissionId}
                                            missions={missions}
                                            boards={activeboards}
                                            onConfirm={(BoardId: string, taskId: string, noteId: string) => setLinkedNoteIds(BoardId, taskId, noteId)}
                                            trigger={<Button variant="ghost" size="icon" className="cursor-pointer h-fit w-6"><LinkIcon className="w-4 h-4 text-blue-500" /></Button>}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => updataBoard(board.BoardId, [...board.Tasks, {
                                TaskId: generateRandomId(),
                                title: 'New Task',
                                linkedNoteIds: '',
                            }])}>New Task</Button>
                        </BoardItem>
                    </div>

                ))}
            </div >
        </>
    )
}
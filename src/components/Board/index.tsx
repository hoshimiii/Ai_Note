import { useWorkSpace } from "@/store/kanban";
// import { Task } from "./Task";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
// import { KanbanGroup } from "./KanbanGroup";
import { Button } from "../ui/button";
import { DeleteDialog } from "../items/DeleteDialog";
import { RenameDialog } from "../items/RenameDialog";
import { PencilIcon, TrashIcon } from "lucide-react";


// DOM of Board
export const Board = ({ nowMissionId }: { nowMissionId: string }) => {
    // const { boards, updateBoard, moveTask } = useKanban();
    const { missions, boards, tasks, deleteBoard, RenameBoard, updataBoard, createTask } = useWorkSpace();
    const activeMissionId = nowMissionId;
    const activeboards = Object.values(boards).filter(board => board.MissionId === activeMissionId);

    return (
        <>

            <div className="flex flex-wrap w-full gap-2">
                {activeboards.map(board => (
                    <div className="flex flex-col gap-2  w-[30%] h-fit bg-blue-100 rounded-md p-2" key={board.BoardId}>

                        {board.title}
                        <DeleteDialog
                            title="确定要删除吗?"
                            description="此操作无法撤销，相关数据将永久消失"
                            onConfirm={() => deleteBoard(board.BoardId)}
                            trigger={<Button variant="ghost" size="sm" className="cursor-pointer group-hover/menu-item:block hidden"><TrashIcon className="w-4 h-4 text-red-500" /></Button>}
                        />
                        <RenameDialog
                            initialName={board.title}
                            title="重命名"
                            onConfirm={(newName: string) => RenameBoard(board.BoardId, newName)}
                            trigger={<Button variant="ghost" size="sm" className="cursor-pointer group-hover/menu-item:block hidden"><PencilIcon className="w-4 h-4 text-blue-500" /></Button>}
                        />
                        {board.Tasks.map(task => (
                            <div key={task.TaskId}>
                                TASK{task.title}
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => updataBoard(board.BoardId, [...board.Tasks, {
                            TaskId: crypto.randomUUID(),
                            title: 'New Task',
                        }])}>New Task</Button>
                    </div>

                ))}
            </div>
        </>
    )
}
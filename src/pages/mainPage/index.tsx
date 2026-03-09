import { useWorkSpace } from "@/store/kanban";
import { Board } from "../../components/Board";
import { Button } from "../../components/ui/button";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { generateRandomId } from "@/components/utils/RandomGenerator";
import { Note } from "@/components/Note";
import { type Note as NoteType } from "@/store/kanban";

export const MainPage = (
    { nowMissionId, nowNoteId, Note_item }: { nowMissionId: string | null, nowNoteId: string | null, Note_item: NoteType }
) => {
    //此时传入的nowMissionId是activeMissionId 是一个对象吗？ 不是，是一个字符串 
    // const { boards, tasks } = useWorkSpace();    
    const { createBoard, moveTask } = useWorkSpace();

    return (

        <div >
            {nowMissionId ?
                nowNoteId ? (
                    <div>
                        <Note key={nowNoteId} note={Note_item} activeMissionId={nowMissionId} />
                    </div>
                ) : (
                    <>
                        MISSIONID:{nowMissionId}
                        <div className="flex flex-wrap w-[80vw]">
                            <Board nowMissionId={nowMissionId ?? ''} />
                            <Button className="cursor-pointer" variant="outline" onClick={() => createBoard({
                                BoardId: generateRandomId(),
                                MissionId: nowMissionId ?? '',
                                title: '未开始',
                                Tasks: []
                            })}>New Board</Button>
                        </div>
                    </>
                ) : (
                    <div>
                        <p>请选择一个任务</p>
                    </div>
                )}

        </div>

    )
}
import { useWorkSpace } from "@/store/kanban";
import { Board } from "../../components/Board";
import { Button } from "../../components/ui/button";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { generateRandomId } from "@/components/utils/RandomGenerator";


export const MainPage = (
    { nowMissionId }: { nowMissionId: string | null }
) => {
    //此时传入的nowMissionId是activeMissionId 是一个对象吗？ 不是，是一个字符串 
    // const { boards, tasks } = useWorkSpace();    
    const { createBoard, moveTask } = useWorkSpace();

    return (

        <div >
            {nowMissionId ? (
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
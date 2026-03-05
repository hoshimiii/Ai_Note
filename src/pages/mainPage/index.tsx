import { useWorkSpace } from "@/store/kanban";
import { Board } from "../../components/Board";
import { Button } from "../../components/ui/button";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";


export const MainPage = (
    { nowMissionId }: { nowMissionId: string | null }
) => {
    //此时传入的nowMissionId是activeMissionId 是一个对象吗？ 不是，是一个字符串 
    // const { boards, tasks } = useWorkSpace();    
    const { createBoard, moveTask } = useWorkSpace();
    // const HandleDragEnd = (event: DragEndEvent) => {
    //     const { active, over } = event;
    //     console.log('active', active);
    //     console.log('over', over);

    //     const [AMId, ABId, ATId] = String(active.id).split('+');
    //     const [OMId, OBId] = String(over?.id).split('+');

    //     if (active && over) {
    //         moveTask(ATId, ABId, OBId);
    //     }

    // }
    return (

        <div >
            {/* <DndContext onDragEnd={HandleDragEnd}> */}
                {/* {typeof nowMissionId} */}
                {nowMissionId ? (
                    <>
                        MISSIONID:{nowMissionId}
                        <div className="flex flex-wrap w-[80vw]">
                            <Board nowMissionId={nowMissionId ?? ''} />
                            <Button className="cursor-pointer" variant="outline" onClick={() => createBoard({
                                BoardId: crypto.randomUUID(),
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
                {/* <div className="flex flex-wrap w-[80vw]">
                <Board nowMissionId={nowMissionId ?? ''} />
                <Button variant="outline" onClick={() => createBoard({
                    BoardId: crypto.randomUUID(),
                    MissionId: nowMissionId ?? '',
                    title: '未开始',
                    Tasks: []
                })}>New Board</Button>
            </div> */}
            {/* </DndContext> */}
        </div>

    )
}
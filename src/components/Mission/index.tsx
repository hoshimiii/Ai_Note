import { useWorkSpace } from "@/store/kanban";
import { Board } from "../Board";
import { Button } from "../ui/button";


export const Mission = (
    { nowMissionId }: { nowMissionId: string | null }
) => {
    //此时传入的nowMissionId是activeMissionId 是一个对象吗？ 不是，是一个字符串 
    // const { boards, tasks } = useWorkSpace();    
    const { createBoard } = useWorkSpace();
    return (
        <div >
            {/* {typeof nowMissionId} */}
            {nowMissionId ? (
                <>
                    MISSIONID:{nowMissionId}
                    <div className="flex flex-wrap w-[80vw]">
                        <Board nowMissionId={nowMissionId ?? ''} />
                        <Button variant="outline" onClick={() => createBoard({
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
        </div>
    )
}
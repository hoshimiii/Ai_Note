import { useWorkSpace } from "@/store/kanban";


export const Mission = ({ nowMissionId }: { nowMissionId: string | null }) => {
    //此时传入的nowMissionId是activeMissionId 是一个对象吗？ 不是，是一个字符串 
    const { activeMissionId, boards, tasks } = useWorkSpace();
    return (
        <div>
            <h1>{activeMissionId}</h1>
        </div>
    )
}
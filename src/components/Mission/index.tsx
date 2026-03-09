import { useDroppable } from "@dnd-kit/core"
import { type Note as NoteType } from "@/store/kanban";

interface MissionItemProps {
    MissionId: string,
    WorkSpaceId: string
    title: string,
    Notes: NoteType[],
}

export const MissionItem = ({ MissionId, WorkSpaceId, title }: MissionItemProps) => {
    const { setNodeRef } = useDroppable({
        id: MissionId,
        data: {
            type: 'mission'
        }
    })
    return (
        <div ref={setNodeRef}>
                {title}
        </div>
    )
}
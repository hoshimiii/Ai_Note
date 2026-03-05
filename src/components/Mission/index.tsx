import { useDroppable } from "@dnd-kit/core"

interface MissionItemProps {
    MissionId: string,
    WorkSpaceId: string
    title: string,
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
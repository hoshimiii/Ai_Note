import { useWorkSpace } from "@/store/kanban";
import { useDraggable } from "@dnd-kit/core";
import React, { useState } from "react";


interface TaskProps extends React.PropsWithChildren {
    id: string,
    title: string,
    linkedNoteIds: string,
    setActiveNoteId: (noteId: string) => void,
}


export const Task = (props: TaskProps) => {
    const { boards, RenameTask } = useWorkSpace();
    const { id, title, children, linkedNoteIds, setActiveNoteId } = props;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        data: {
            type: 'task'
        }
    })
    const [MissionId, BoardId, TaskId] = id.split('+');
    const style: React.CSSProperties | undefined = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
    } : undefined

    const childrenArray = React.Children.toArray(children);
    const firstChild = childrenArray[0];
    const restChildren = childrenArray.slice(1);
    const [isEditing, setIsEditing] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        if (e.ctrlKey && linkedNoteIds) {
            setActiveNoteId(linkedNoteIds);
        }
    };

    return (
        <>
            {isEditing ? (
                <>
                    <textarea value={title} onChange={(e) => RenameTask(BoardId, TaskId, e.target.value)} onBlur={() => setIsEditing(false)} />

                </>
            ) : (
                <>
                    <div ref={setNodeRef} {...attributes} style={style} className="kanban-item mb-0.5 p-2 rounded-md border-gray-100 bg-white group/task flex items-center gap-1">
                        <div {...listeners} className="cursor-grab text-gray-400 select-none px-1">⠿</div>
                        <div className="flex-1 flex items-center gap-1 cursor-pointer" onClick={handleClick} onDoubleClick={() => setIsEditing(true)}>
                            {title} {firstChild}
                        </div>
                        {restChildren}
                    </div>
                </>
            )}
        </>
    )
}
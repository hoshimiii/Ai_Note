import { useDraggable } from "@dnd-kit/core";
import React from "react";


interface TaskProps extends React.PropsWithChildren {
    id: string,
    title: string,
}


export const Task = (props: TaskProps) => {
    const { id, title, children } = props;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        data: {
            type: 'task'
        }
    })
    const style: React.CSSProperties | undefined = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
    } : undefined

    const childrenArray = React.Children.toArray(children);
    const firstChild = childrenArray[0];
    const restChildren = childrenArray.slice(1);

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="kanban-item mb-0.5 p-2 rounded-md border-gray-100  bg-white group/task">
            <div className="flex items-center gap-1 ">
                {title} {firstChild}
            </div>

            {restChildren}
        </div>
    )
}
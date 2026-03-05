import { useDroppable } from "@dnd-kit/core";
import React from "react";


interface BoardProps extends React.PropsWithChildren {
    id: string,
    title: string,
}

export const BoardItem = (props: BoardProps) => {
    const { id, title, children } = props;
    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: 'board'
        }
    })
    const childrenArray = React.Children.toArray(children);
    const firstChild = childrenArray[0];
    const restChildren = childrenArray.slice(1);
    return (
        <div ref={setNodeRef} className="flex flex-col gap-2" key={id}>
            <div className="flex flex-row gap-2">{title} {firstChild}</div>
            {restChildren}
        </div>
    )
}
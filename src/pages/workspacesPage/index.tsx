
import { Button } from "@/components/ui/button";
import { WorkSpace } from "@/components/WorkSpace";
import { useWorkSpace } from "@/store/kanban"


export const WorkSpacePage = () => {
    const { workspaces, createWorkSpace } = useWorkSpace();
    return (
        <div className=" grid grid-cols-3 gap-3 w-[80vw] p-4 ">
            <WorkSpace />
            <Button className="w-full h-[20vh]" variant="outline" onClick={() => createWorkSpace({
                workspaceId: crypto.randomUUID(),
                workspaceName: 'new WorkSpace'
            })}>创建一个新的workspace</Button>
        </div>
    )
}

//hello
import { useWorkSpace } from "@/store/kanban"
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

export const WorkSpace = () => {
    const { workspaces, deleteWorkSpace, setWorkSpace } = useWorkSpace();
    return (
        <>
            {workspaces.map(workspace => (
                // if (!workspace) return 'have no workspace';
                <div key={workspace?.workspaceId}>

                    <Button asChild className="w-full h-[20vh]" variant='outline' onClick={() => setWorkSpace(workspace.workspaceId)} >
                        {/* <div> */}
                        <Link to="/work">{workspace.workspaceName}</Link>

                        {/* </div> */}
                    </Button>

                    <div className="">
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button className="text-red-400" >删除</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>确定要删除工作区吗?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        此操作将永久删除 "{workspace.workspaceName}" 及其所有关联的任务数据，且无法撤销。
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction className="text-red-600" onClick={() =>
                                        deleteWorkSpace(workspace.workspaceId)}>确认执行删除</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>


                        </AlertDialog>
                    </div>

                </div >
            ))}

        </>
    )
}

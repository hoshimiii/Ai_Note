import { useWorkSpace } from "@/store/kanban";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/items/DeleteDialog";
import { PencilIcon, TrashIcon } from "lucide-react";
import { RenameDialog } from "@/components/items/RenameDialog";
import { Mission } from "@/components/Mission";



export const WorkPage = () => {
    const { workspaces, activeWorkSpaceId, activeMissionId, missions, boards, tasks, createMission, setMission, deleteMission, RenameMission } = useWorkSpace();
    const navigate = useNavigate();

    const activeMissions = Object.values(missions).filter((mission) => mission.WorkSpaceId === activeWorkSpaceId);
    // const nowMission = Object.values(missions).find((mission) => mission.MissionId === activeMissionId);
    return (
        <div>
            <SidebarProvider>
                {/* 这里SidebarProvider的作用是什么： SidebarProvider是用来提供Sidebar的，也就是提供Sidebar的上下文，也就是提供Sidebar的上下文 */}
                <Sidebar side="left">
                    {/* 这里main作用是什么： main是用来包裹被渲染的组件的，也就是被渲染的组件会在这个main里面 */}
                    {/* 这里SidebarTrigger的作用是什么： SidebarTrigger是用来触发Sidebar的，也就是点击SidebarTrigger会触发Sidebar的打开和关闭 */}
                    {/* 这里SidebarHeader的作用是什么： SidebarHeader是用来显示Sidebar的标题的，也就是显示当前工作区的名称 */}

                    <SidebarHeader> {workspaces.find(workspace => workspace.workspaceId === activeWorkSpaceId)?.workspaceName}</SidebarHeader>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/workspace')}
                        className="cursor-pointer mx-4 mb-2"
                    >
                        返回工作区
                    </Button>

                    <SidebarContent>
                        <Button className="cursor-pointer" variant="outline" onClick={() => createMission({
                            MissionId: crypto.randomUUID(),
                            WorkSpaceId: activeWorkSpaceId || '',
                            title: 'New Mission'
                        })}>New Mission</Button>
                        <SidebarMenu>
                            {activeMissions.map((mission) => (
                                <SidebarMenuItem className="group/menu-item flex bg-gray-100 rounded-md p-1 " key={mission.MissionId}>
                                    <SidebarMenuButton className="cursor-pointer w-[70%]" variant="default" onClick={() => setMission(mission.MissionId)}>
                                        {mission.title}
                                    </SidebarMenuButton>
                                    <SidebarMenuAction asChild>
                                        <DeleteDialog
                                            title="确定要删除任务吗?"
                                            description="此操作无法撤销，相关数据将永久消失"
                                            onConfirm={() => deleteMission(mission.MissionId)}
                                            trigger={<Button variant="ghost" size="sm" className="cursor-pointer group-hover/menu-item:block hidden"><TrashIcon className="w-4 h-4 text-red-500" /></Button>} />

                                    </SidebarMenuAction>
                                    <SidebarMenuAction asChild>
                                        <RenameDialog
                                            title="重命名?"
                                            initialName={mission.title}
                                            onConfirm={(newName) => RenameMission(mission.MissionId, newName)}
                                            trigger={<Button variant="ghost" size="sm" className="cursor-pointer group-hover/menu-item:block hidden"><PencilIcon className="w-4 h-4 text-blue-500" /></Button>} />
                                    </SidebarMenuAction>

                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>



                </Sidebar>

                <main className="flex-1 w-full">
                    <SidebarTrigger className="bg-gray-200 w-[20px] h-[20px]" />
                    <Mission nowMissionId={activeMissionId} />
                    <Outlet />
                    {/* outlet的作用是什么： outlet渲染子组件需不需要包含住被渲染的组件？ 是的，outlet渲染子组件需要包含住被渲染的组件。
                    那这里为什么用<Outlet />的形式 */}
                </main>
            </SidebarProvider>
        </div>
    )
}
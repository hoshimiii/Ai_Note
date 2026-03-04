import { create } from 'zustand'
import { persist } from 'zustand/middleware'


type Mission = {
    MissionId: string,
    WorkSpaceId: string
    title: string,
    // Boards: Board[]
}

type Board = {
    BoardId: string,
    MissionId: string,
    title: string,
    // Tasks: Task[]

}
type Task = {
    TaskId: string,
    BoardId: string,
    title: string,
    status: boolean
}

type WorkSpace = {
    workspaceId: string,
    workspaceName: string,
}

interface WorkSpaceProps {
    workspaces: WorkSpace[],
    activeWorkSpaceId: string | null,
    activeMissionId: string | null,

    missions: Record<string, Mission>,
    boards: Record<string, Board>,
    tasks: Record<string, Task>,

    createWorkSpace: (WorkSpace: WorkSpace) => void,
    setWorkSpace: (WorkSpaceId: string) => void,
    deleteWorkSpace: (WorkSpaceId: string) => void,
    RenameWorkSpace: (WorkSpaceId: string, newName: string) => void

    createMission: (Mission: Mission) => void,
    setMission: (MissionId: string) => void,
    deleteMission: (MissionId: string) => void,
    RenameMission: (MissionId: string, newName: string) => void,
}


export const useWorkSpace = create<WorkSpaceProps>()(
    persist(
        (set, get) => ({
            workspaces: [],
            activeWorkSpaceId: null,
            activeMissionId: null,
            missions: {},
            boards: {},
            tasks: {},

            createWorkSpace: (workspace) => {
                set((state) => ({ workspaces: [...state.workspaces, workspace] }));
                // console.log(`已创建新的workspace`)
            },

            setWorkSpace: (workspaceId) => {
                set({ activeWorkSpaceId: workspaceId });

            },
            deleteWorkSpace: (workspaceId) => {
                set((state) => {
                    // 1. 过滤掉目标空间
                    const nextWorkspaces = state.workspaces.filter(w => w.workspaceId !== workspaceId);

                    // 2. 如果删掉的是当前选中的空间，把 activeWorkspaceId 重置为 null (回到列表页)
                    const nextActiveId = state.activeWorkSpaceId === workspaceId ? null : state.activeWorkSpaceId;

                    return {
                        workspaces: nextWorkspaces,
                        activeWorkSpaceId: nextActiveId
                    };
                });
            },
            RenameWorkSpace: (workspaceId, newName) => {
                set((state) => ({
                    workspaces: state.workspaces.map((w) =>
                        w.workspaceId === workspaceId ? { ...w, workspaceName: newName } : w
                    )
                }));
            },

            createMission: (mission) => {
                set((state) => ({ missions: { ...state.missions, [mission.MissionId]: mission } }));
            },
            setMission: (missionId) => {
                set({ activeMissionId: missionId });
            },
            deleteMission: (missionId) => {
                set((state) => ({ missions: Object.fromEntries(Object.entries(state.missions).filter(([id]) => id !== missionId)) }));
            },
            RenameMission: (missionId, newName) => {
                set((state) => ({ missions: { ...state.missions, [missionId]: { ...state.missions[missionId], title: newName } } }));
            },


        }),
        { name: 'workspace-storage' }

    )
)
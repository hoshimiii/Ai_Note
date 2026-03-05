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
    Tasks: Task[],
    // Tasks: Task[]

}
type Task = {
    TaskId: string,
    title: string,
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
    setWorkSpace: (WorkSpaceId: string | null) => void,
    deleteWorkSpace: (WorkSpaceId: string) => void,
    RenameWorkSpace: (WorkSpaceId: string, newName: string) => void

    createMission: (Mission: Mission) => void,
    setMission: (MissionId: string | null) => void,
    deleteMission: (MissionId: string) => void,
    RenameMission: (MissionId: string, newName: string) => void,

    createBoard: (Board: Board) => void,
    deleteBoard: (BoardId: string) => void,
    RenameBoard: (BoardId: string, newName: string) => void,
    updataBoard: (BoardId: string, newTask: Task[]) => void,

    createTask: (Task: Task) => void,
    deleteTask: (TaskId: string) => void,
    RenameTask: (TaskId: string, newName: string) => void,
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


            createBoard: (board) => {
                set((state) => ({ boards: { ...state.boards, [board.BoardId]: board } }));
            },
            deleteBoard: (boardId) => {
                set((state) => ({ boards: Object.fromEntries(Object.entries(state.boards).filter(([id]) => id !== boardId)) }));
            },
            RenameBoard: (boardId, newName) => {
                set((state) => ({ boards: { ...state.boards, [boardId]: { ...state.boards[boardId], title: newName } } }));
            },
            updataBoard: (boardId, newTask) => {
                set((state) => ({ boards: { ...state.boards, [boardId]: { ...state.boards[boardId], Tasks: newTask } } }));
            },
            
            createTask: (task) => {
                set((state) => ({ tasks: { ...state.tasks, [task.TaskId]: task } }));
            },
            deleteTask: (taskId) => {
                set((state) => ({ tasks: Object.fromEntries(Object.entries(state.tasks).filter(([id]) => id !== taskId)) }));
            },
            RenameTask: (taskId, newName) => {
                set((state) => ({ tasks: { ...state.tasks, [taskId]: { ...state.tasks[taskId], title: newName } } }));
            },
        }),
        { name: 'workspace-storage' }

    )
)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// import type { Note } from '../notes'


export type Mission = {
    MissionId: string,
    WorkSpaceId: string,
    activateNoteId: string | null,
    title: string,
    Notes: Note[],
    // Boards: Board[]
}

export type Note = {
    noteId: string;
    noteTitle: string;
    noteContent: string;
    noteCreatedAt: string;
    noteUpdatedAt: string;
    relatedTaskId: string;
    blocks: Block[];
}

type Block = {
    blockId: string;
    blockType: string;
    blockContent: string;
    blockCreatedAt: string;
    blockUpdatedAt: string;
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
    // activeNoteId: string | null,

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
    setMissionNotes: (MissionId: string, notes: Note[]) => void,
    addNotesToMission: (MissionId: string, newNote: Note) => void,
    removeNotesFromMission: (MissionId: string, noteIds: string[]) => void,
    updateNotesInMission: (MissionId: string, noteId: string, newNote: Note) => void,

    createBoard: (Board: Board) => void,
    deleteBoard: (BoardId: string) => void,
    RenameBoard: (BoardId: string, newName: string) => void,
    updataBoard: (BoardId: string, newTask: Task[]) => void,
    moveBoard: (boardId: string, sourceMissionId: string, targetMissionId: string) => void,

    createTask: (Task: Task) => void,
    deleteTask: (BoardId: string, TaskId: string) => void,
    RenameTask: (BoardId: string, TaskId: string, newName: string) => void,
    moveTask: (taskId: string, sourceBoardId: string, targetBoardId: string) => void,

    setActiveNote: (activeMissionId: string, noteId: string | null) => void,
    createNote: (activeMissionId: string, newNote: Note) => Note,
    deleteNote: (activeMissionId: string, noteId: string) => void,
    RenameNote: (activeMissionId: string, noteId: string, newName: string) => void,
    updateNote: (activeMissionId: string, noteId: string, newNote: Note) => void,

    createBlock: (activeMissionId: string, noteId: string, newBlock: Block) => Block,
    deleteBlock: (activeMissionId: string, noteId: string, blockId: string) => void,
    RenameBlock: (activeMissionId: string, noteId: string, blockId: string, newName: string) => void,
    updateBlock: (activeMissionId: string, noteId: string, blockId: string, newBlock: Block) => void,
}


export const useWorkSpace = create<WorkSpaceProps>()(
    persist(
        (set, get) => ({
            workspaces: [],
            activeWorkSpaceId: null,
            activeMissionId: null,
            activeNoteId: null,
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

            setMissionNotes: (missionId, notes) => {
                set((state) => ({ missions: { ...state.missions, [missionId]: { ...state.missions[missionId], Notes: notes } } }));
            },

            addNotesToMission: (missionId, newNote) => {
                set((state) => ({ missions: { ...state.missions, [missionId]: { ...state.missions[missionId], Notes: [...(state.missions[missionId].Notes ?? []), newNote] } } }));
            },
            removeNotesFromMission: (missionId, noteIds) => {
                set((state) => ({ missions: { ...state.missions, [missionId]: { ...state.missions[missionId], Notes: (state.missions[missionId].Notes ?? []).filter(n => !noteIds.includes(n.noteId)) } } }));
            },
            updateNotesInMission: (missionId, noteId, newNote) => {
                set((state) => ({ missions: { ...state.missions, [missionId]: { ...state.missions[missionId], Notes: (state.missions[missionId].Notes ?? []).map(n => n.noteId === noteId ? { ...n, newNote } : n) } } }));
            },


            setActiveNote: (activeMissionId, noteId) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], activateNoteId: noteId } } }));
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
            moveBoard: (boardId, sourceMissionId, targetMissionId) => {
                set((state) => {
                    if (sourceMissionId === targetMissionId) return state;
                    const sourceMission = state.missions[sourceMissionId];
                    const targetMission = state.missions[targetMissionId];
                    if (!sourceMission || !targetMission) return state;
                    const board = state.boards[boardId];
                    if (!board) return state;
                    return {
                        boards: {
                            ...state.boards,
                            [boardId]: {
                                ...board,
                                MissionId: targetMissionId
                            }
                        }
                    };
                });
            },

            createTask: (task) => {
                set((state) => ({ tasks: { ...state.tasks, [task.TaskId]: task } }));
            },
            deleteTask: (boardId, taskId) => {
                set((state) => ({ boards: { ...state.boards, [boardId]: { ...state.boards[boardId], Tasks: state.boards[boardId].Tasks.filter(t => t.TaskId !== taskId) } } }));
            },
            RenameTask: (boardId, taskId, newName) => {
                set((state) => ({ boards: { ...state.boards, [boardId]: { ...state.boards[boardId], Tasks: state.boards[boardId].Tasks.map(t => t.TaskId === taskId ? { ...t, title: newName } : t) } } }));
            },
            moveTask: (taskId, sourceBoardId, targetBoardId) => {
                set((state) => {
                    if (sourceBoardId === targetBoardId) return state;
                    const sourceBoard = state.boards[sourceBoardId];
                    const targetBoard = state.boards[targetBoardId];
                    if (!sourceBoard || !targetBoard) return state;
                    const task = sourceBoard.Tasks.find(t => t.TaskId === taskId);
                    if (!task) return state;
                    return {
                        boards: {
                            ...state.boards,
                            [sourceBoardId]: {
                                ...sourceBoard,
                                Tasks: sourceBoard.Tasks.filter(t => t.TaskId !== taskId)
                            },
                            [targetBoardId]: {
                                ...targetBoard,
                                Tasks: [...targetBoard.Tasks, task]
                            }
                        }
                    };
                });
            },

            createNote: (activeMissionId, note) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], Notes: [...state.missions[activeMissionId].Notes, note] } } }));
                return note;
            },
            deleteNote: (activeMissionId, noteId) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], Notes: state.missions[activeMissionId].Notes.filter(n => n.noteId !== noteId) } } }));
            },
            RenameNote: (activeMissionId, noteId, newName) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], Notes: state.missions[activeMissionId].Notes.map(n => n.noteId === noteId ? { ...n, noteTitle: newName } : n) } } }));
            },
            updateNote: (activeMissionId, noteId, newNote) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], Notes: state.missions[activeMissionId].Notes.map(n => n.noteId === noteId ? { ...n, ...newNote } : n) } } }));
            },

            createBlock: (activeMissionId, noteId, newBlock) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], Notes: state.missions[activeMissionId].Notes.map(n => n.noteId === noteId ? { ...n, blocks: [...n.blocks, newBlock] } : n) } } }));
                return newBlock;
            },
            deleteBlock: (activeMissionId, noteId, blockId) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], Notes: state.missions[activeMissionId].Notes.map(n => n.noteId === noteId ? { ...n, blocks: n.blocks.filter(b => b.blockId !== blockId) } : n) } } }));
            },
            RenameBlock: (activeMissionId, noteId, blockId, newName) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], Notes: state.missions[activeMissionId].Notes.map(n => n.noteId === noteId ? { ...n, blocks: n.blocks.map(b => b.blockId === blockId ? { ...b, blockContent: newName } : b) } : n) } } }));
            },
            updateBlock: (activeMissionId, noteId, blockId, newBlock) => {
                set((state) => ({ missions: { ...state.missions, [activeMissionId]: { ...state.missions[activeMissionId], Notes: state.missions[activeMissionId].Notes.map(n => n.noteId === noteId ? { ...n, blocks: n.blocks.map(b => b.blockId === blockId ? { ...b, ...newBlock } : b) } : n) } } }));
            },
        }),
        {
            name: 'workspace-storage',
            version: 1,
            migrate: (persistedState: any, version: number) => {
                if (version === 0) {
                    // 为旧的 missions 添加 Notes 字段
                    const missions = persistedState.missions || {};
                    Object.keys(missions).forEach(missionId => {
                        if (!missions[missionId].Notes) {
                            missions[missionId].Notes = [];
                        }
                    });
                    return {
                        ...persistedState,
                        missions
                    };
                }
                return persistedState;
            }
        }

    )
)
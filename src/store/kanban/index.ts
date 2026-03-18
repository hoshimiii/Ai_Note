import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SubTask = {
    subTaskId: string;
    title: string;
    completed: boolean;
    linkedNoteId: string;
    linkedBlockId: string;
}

export type Mission = {
    MissionId: string,
    WorkSpaceId: string,
    activateNoteId: string | null,
    title: string,
    Notes: Note[],
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

export type Block = {
    blockId: string;
    blockType: string;
    blockContent: string;
    blockCreatedAt: string;
    blockUpdatedAt: string;
    linkedBoardId?: string;
    linkedTaskId?: string;
    linkedSubTaskId?: string;
}

export type Board = {
    BoardId: string,
    MissionId: string,
    title: string,
    Tasks: Task[],
}

export type Task = {
    TaskId: string,
    title: string,
    linkedNoteIds: string,
    subTasks: SubTask[],
}

type WorkSpace = {
    workspaceId: string,
    workspaceName: string,
}

interface WorkSpaceProps {
    workspaces: WorkSpace[],
    activeWorkSpaceId: string | null,
    activeMissionId: string | null,

    missionOrder: Record<string, string[]>,
    boardOrder: Record<string, string[]>,

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
    reorderMissions: (workspaceId: string, orderedIds: string[]) => void,

    createBoard: (Board: Board) => void,
    deleteBoard: (BoardId: string) => void,
    RenameBoard: (BoardId: string, newName: string) => void,
    updataBoard: (BoardId: string, newTask: Task[]) => void,
    moveBoard: (boardId: string, sourceMissionId: string, targetMissionId: string) => void,
    reorderBoards: (missionId: string, orderedIds: string[]) => void,

    createTask: (Task: Task) => void,
    deleteTask: (BoardId: string, TaskId: string) => void,
    RenameTask: (BoardId: string, TaskId: string, newName: string) => void,
    moveTask: (taskId: string, sourceBoardId: string, targetBoardId: string, targetIndex?: number) => void,
    reorderTasks: (boardId: string, orderedIds: string[]) => void,
    setLinkedNoteIds: (boardId: string, taskId: string, linkedNoteIds: string) => void,

    addSubTask: (boardId: string, taskId: string, subTask: SubTask) => void,
    removeSubTask: (boardId: string, taskId: string, subTaskId: string) => void,
    toggleSubTask: (boardId: string, taskId: string, subTaskId: string) => void,
    renameSubTask: (boardId: string, taskId: string, subTaskId: string, newTitle: string) => void,
    linkSubTask: (boardId: string, taskId: string, subTaskId: string, noteId: string, blockId: string) => void,
    linkBlock: (activeMissionId: string, noteId: string, blockId: string, boardId: string, taskId: string, subTaskId: string) => void,

    setActiveNote: (activeMissionId: string, noteId: string | null) => void,
    createNote: (activeMissionId: string, newNote: Note) => Note,
    deleteNote: (activeMissionId: string, noteId: string) => void,
    RenameNote: (activeMissionId: string, noteId: string, newName: string) => void,
    updateNote: (activeMissionId: string, noteId: string, newNote: Note) => void,

    createBlock: (note: Note, newBlock: Block) => Block,
    insertBlock: (note: Note, index: number, newBlock: Block) => Block,
    deleteBlock: (note: Note, blockId: string) => void,
    RenameBlock: (note: Note, blockId: string, newName: string) => void,
    updateBlock: (note: Note, blockId: string, newBlock: Block) => void,
}


export const useWorkSpace = create<WorkSpaceProps>()(
    persist(
        (set, _get) => ({
            workspaces: [],
            activeWorkSpaceId: null,
            activeMissionId: null,
            activeNoteId: null,
            missionOrder: {},
            boardOrder: {},
            missions: {},
            boards: {},
            tasks: {},

            createWorkSpace: (workspace) => {
                set((state) => ({ workspaces: [...state.workspaces, workspace] }));
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
                    const nextMissionOrder = { ...state.missionOrder };
                    delete nextMissionOrder[workspaceId];
                    return {
                        workspaces: nextWorkspaces,
                        activeWorkSpaceId: nextActiveId,
                        missionOrder: nextMissionOrder,
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
                set((state) => {
                    const prevOrder = state.missionOrder[mission.WorkSpaceId] ?? [];
                    return {
                        missions: { ...state.missions, [mission.MissionId]: mission },
                        missionOrder: {
                            ...state.missionOrder,
                            [mission.WorkSpaceId]: [...prevOrder, mission.MissionId],
                        },
                    };
                });
            },
            setMission: (missionId) => {
                set({ activeMissionId: missionId });
            },
            deleteMission: (missionId) => {
                set((state) => {
                    const mission = state.missions[missionId];
                    const wsId = mission?.WorkSpaceId;
                    const nextMissionOrder = wsId
                        ? { ...state.missionOrder, [wsId]: (state.missionOrder[wsId] ?? []).filter(id => id !== missionId) }
                        : state.missionOrder;
                    return {
                        missions: Object.fromEntries(Object.entries(state.missions).filter(([id]) => id !== missionId)),
                        missionOrder: nextMissionOrder,
                    };
                });
            },
            RenameMission: (missionId, newName) => {
                set((state) => ({ missions: { ...state.missions, [missionId]: { ...state.missions[missionId], title: newName } } }));
            },
            reorderMissions: (workspaceId, orderedIds) => {
                set((state) => ({
                    missionOrder: { ...state.missionOrder, [workspaceId]: orderedIds },
                }));
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
                set((state) => {
                    const prevOrder = state.boardOrder[board.MissionId] ?? [];
                    return {
                        boards: { ...state.boards, [board.BoardId]: board },
                        boardOrder: {
                            ...state.boardOrder,
                            [board.MissionId]: [...prevOrder, board.BoardId],
                        },
                    };
                });
            },
            deleteBoard: (boardId) => {
                set((state) => {
                    const board = state.boards[boardId];
                    const mId = board?.MissionId;
                    const nextBoardOrder = mId
                        ? { ...state.boardOrder, [mId]: (state.boardOrder[mId] ?? []).filter(id => id !== boardId) }
                        : state.boardOrder;
                    return {
                        boards: Object.fromEntries(Object.entries(state.boards).filter(([id]) => id !== boardId)),
                        boardOrder: nextBoardOrder,
                    };
                });
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
                    const board = state.boards[boardId];
                    if (!board) return state;
                    const nextSourceOrder = (state.boardOrder[sourceMissionId] ?? []).filter(id => id !== boardId);
                    const nextTargetOrder = [...(state.boardOrder[targetMissionId] ?? []), boardId];
                    return {
                        boards: { ...state.boards, [boardId]: { ...board, MissionId: targetMissionId } },
                        boardOrder: {
                            ...state.boardOrder,
                            [sourceMissionId]: nextSourceOrder,
                            [targetMissionId]: nextTargetOrder,
                        },
                    };
                });
            },
            reorderBoards: (missionId, orderedIds) => {
                set((state) => ({
                    boardOrder: { ...state.boardOrder, [missionId]: orderedIds },
                }));
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
            moveTask: (taskId, sourceBoardId, targetBoardId, targetIndex) => {
                set((state) => {
                    if (sourceBoardId === targetBoardId) {
                        const board = state.boards[sourceBoardId];
                        if (!board) return state;
                        const tasks = board.Tasks.filter(t => t.TaskId !== taskId);
                        const task = board.Tasks.find(t => t.TaskId === taskId);
                        if (!task) return state;
                        const idx = targetIndex !== undefined ? targetIndex : tasks.length;
                        const newTasks = [...tasks.slice(0, idx), task, ...tasks.slice(idx)];
                        return { boards: { ...state.boards, [sourceBoardId]: { ...board, Tasks: newTasks } } };
                    }
                    const sourceBoard = state.boards[sourceBoardId];
                    const targetBoard = state.boards[targetBoardId];
                    if (!sourceBoard || !targetBoard) return state;
                    const task = sourceBoard.Tasks.find(t => t.TaskId === taskId);
                    if (!task) return state;
                    const newTargetTasks = [...targetBoard.Tasks];
                    const idx = targetIndex !== undefined ? targetIndex : newTargetTasks.length;
                    newTargetTasks.splice(idx, 0, task);
                    return {
                        boards: {
                            ...state.boards,
                            [sourceBoardId]: { ...sourceBoard, Tasks: sourceBoard.Tasks.filter(t => t.TaskId !== taskId) },
                            [targetBoardId]: { ...targetBoard, Tasks: newTargetTasks },
                        }
                    };
                });
            },
            reorderTasks: (boardId, orderedIds) => {
                set((state) => {
                    const board = state.boards[boardId];
                    if (!board) return state;
                    const taskMap = Object.fromEntries(board.Tasks.map(t => [t.TaskId, t]));
                    const newTasks = orderedIds.map(id => taskMap[id]).filter(Boolean);
                    return { boards: { ...state.boards, [boardId]: { ...board, Tasks: newTasks } } };
                });
            },
            setLinkedNoteIds: (boardId, taskId, linkedNoteIds) => {
                set((state) => ({ boards: { ...state.boards, [boardId]: { ...state.boards[boardId], Tasks: state.boards[boardId].Tasks.map(t => t.TaskId === taskId ? { ...t, linkedNoteIds } : t) } } }));
            },

            addSubTask: (boardId, taskId, subTask) => {
                set((state) => ({
                    boards: {
                        ...state.boards,
                        [boardId]: {
                            ...state.boards[boardId],
                            Tasks: state.boards[boardId].Tasks.map(t =>
                                t.TaskId === taskId
                                    ? { ...t, subTasks: [...(t.subTasks ?? []), subTask] }
                                    : t
                            ),
                        },
                    },
                }));
            },
            removeSubTask: (boardId, taskId, subTaskId) => {
                set((state) => ({
                    boards: {
                        ...state.boards,
                        [boardId]: {
                            ...state.boards[boardId],
                            Tasks: state.boards[boardId].Tasks.map(t =>
                                t.TaskId === taskId
                                    ? { ...t, subTasks: (t.subTasks ?? []).filter(s => s.subTaskId !== subTaskId) }
                                    : t
                            ),
                        },
                    },
                }));
            },
            toggleSubTask: (boardId, taskId, subTaskId) => {
                set((state) => ({
                    boards: {
                        ...state.boards,
                        [boardId]: {
                            ...state.boards[boardId],
                            Tasks: state.boards[boardId].Tasks.map(t =>
                                t.TaskId === taskId
                                    ? { ...t, subTasks: (t.subTasks ?? []).map(s => s.subTaskId === subTaskId ? { ...s, completed: !s.completed } : s) }
                                    : t
                            ),
                        },
                    },
                }));
            },
            renameSubTask: (boardId, taskId, subTaskId, newTitle) => {
                set((state) => ({
                    boards: {
                        ...state.boards,
                        [boardId]: {
                            ...state.boards[boardId],
                            Tasks: state.boards[boardId].Tasks.map(t =>
                                t.TaskId === taskId
                                    ? { ...t, subTasks: (t.subTasks ?? []).map(s => s.subTaskId === subTaskId ? { ...s, title: newTitle } : s) }
                                    : t
                            ),
                        },
                    },
                }));
            },
            linkSubTask: (boardId, taskId, subTaskId, noteId, blockId) => {
                set((state) => {
                    const nextBoards = {
                        ...state.boards,
                        [boardId]: {
                            ...state.boards[boardId],
                            Tasks: state.boards[boardId].Tasks.map(t =>
                                t.TaskId === taskId
                                    ? { ...t, subTasks: (t.subTasks ?? []).map(s => s.subTaskId === subTaskId ? { ...s, linkedNoteId: noteId, linkedBlockId: blockId } : s) }
                                    : t
                            ),
                        },
                    };
                    let nextMissions = state.missions;
                    if (blockId && noteId) {
                        const missionId = Object.keys(state.missions).find(id =>
                            state.missions[id].Notes.some(n => n.noteId === noteId)
                        );
                        if (missionId) {
                            const mission = state.missions[missionId];
                            nextMissions = {
                                ...state.missions,
                                [missionId]: {
                                    ...mission,
                                    Notes: mission.Notes.map(n =>
                                        n.noteId === noteId
                                            ? { ...n, blocks: n.blocks.map(b => b.blockId === blockId ? { ...b, linkedBoardId: boardId, linkedTaskId: taskId, linkedSubTaskId: subTaskId } : b) }
                                            : n
                                    )
                                }
                            };
                        }
                    }
                    return { boards: nextBoards, missions: nextMissions };
                });
            },
            linkBlock: (activeMissionId, noteId, blockId, boardId, taskId, subTaskId) => {
                set((state) => {
                    const mission = state.missions[activeMissionId];
                    if (!mission) return state;
                    const board = state.boards[boardId];
                    if (!board || board.MissionId !== activeMissionId) return state;
                    const task = board.Tasks.find(t => t.TaskId === taskId);
                    if (!task) return state;
                    const hasSubTask = subTaskId && (task.subTasks ?? []).some(s => s.subTaskId === subTaskId);
                    const nextNotes = mission.Notes.map(n => {
                        if (n.noteId !== noteId) return n;
                        return {
                            ...n,
                            blocks: n.blocks.map(b =>
                                b.blockId === blockId ? { ...b, linkedBoardId: boardId, linkedTaskId: taskId, linkedSubTaskId: subTaskId || "" } : b
                            )
                        };
                    });
                    let nextBoards = state.boards;
                    if (hasSubTask) {
                        nextBoards = {
                            ...state.boards,
                            [boardId]: {
                                ...board,
                                Tasks: board.Tasks.map(t =>
                                    t.TaskId === taskId
                                        ? { ...t, subTasks: (t.subTasks ?? []).map(s => s.subTaskId === subTaskId ? { ...s, linkedNoteId: noteId, linkedBlockId: blockId } : s) }
                                        : t
                                ),
                            },
                        };
                    }
                    return {
                        missions: { ...state.missions, [activeMissionId]: { ...mission, Notes: nextNotes } },
                        boards: nextBoards,
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

            createBlock: (note, newBlock) => {
                set((state) => {
                    const missionId = Object.keys(state.missions).find(id =>
                        state.missions[id].Notes.some(n => n.noteId === note.noteId)
                    );
                    if (!missionId) return state;
                    const mission = state.missions[missionId];
                    return {
                        missions: {
                            ...state.missions,
                            [missionId]: {
                                ...mission,
                                Notes: mission.Notes.map(n =>
                                    n.noteId === note.noteId
                                        ? { ...n, blocks: [...n.blocks, newBlock] }
                                        : n
                                )
                            }
                        }
                    };
                });
                return newBlock;
            },
            insertBlock: (note, index, newBlock) => {
                set((state) => {
                    const missionId = Object.keys(state.missions).find(id =>
                        state.missions[id].Notes.some(n => n.noteId === note.noteId)
                    );
                    if (!missionId) return state;
                    const mission = state.missions[missionId];
                    const noteData = mission.Notes.find(n => n.noteId === note.noteId);
                    if (!noteData) return state;
                    const blocks = [...noteData.blocks];
                    blocks.splice(Math.max(0, index), 0, newBlock);
                    return {
                        missions: {
                            ...state.missions,
                            [missionId]: {
                                ...mission,
                                Notes: mission.Notes.map(n =>
                                    n.noteId === note.noteId ? { ...n, blocks } : n
                                )
                            }
                        }
                    };
                });
                return newBlock;
            },
            deleteBlock: (note, blockId) => {
                set((state) => {
                    const missionId = Object.keys(state.missions).find(id =>
                        state.missions[id].Notes.some(n => n.noteId === note.noteId)
                    );
                    if (!missionId) return state;
                    const mission = state.missions[missionId];
                    return {
                        missions: {
                            ...state.missions,
                            [missionId]: {
                                ...mission,
                                Notes: mission.Notes.map(n =>
                                    n.noteId === note.noteId
                                        ? { ...n, blocks: n.blocks.filter(b => b.blockId !== blockId) }
                                        : n
                                )
                            }
                        }
                    };
                });
            },
            RenameBlock: (note, blockId, newName) => {
                set((state) => {
                    const missionId = Object.keys(state.missions).find(id =>
                        state.missions[id].Notes.some(n => n.noteId === note.noteId)
                    );
                    if (!missionId) return state;
                    const mission = state.missions[missionId];
                    return {
                        missions: {
                            ...state.missions,
                            [missionId]: {
                                ...mission,
                                Notes: mission.Notes.map(n =>
                                    n.noteId === note.noteId
                                        ? { ...n, blocks: n.blocks.map(b => b.blockId === blockId ? { ...b, blockContent: newName } : b) }
                                        : n
                                )
                            }
                        }
                    };
                });
            },
            updateBlock: (note, blockId, newBlock) => {
                set((state) => {
                    const missionId = Object.keys(state.missions).find(id =>
                        state.missions[id].Notes.some(n => n.noteId === note.noteId)
                    );
                    if (!missionId) return state;
                    const mission = state.missions[missionId];
                    return {
                        missions: {
                            ...state.missions,
                            [missionId]: {
                                ...mission,
                                Notes: mission.Notes.map(n =>
                                    n.noteId === note.noteId
                                        ? { ...n, blocks: n.blocks.map(b => b.blockId === blockId ? { ...b, ...newBlock } : b) }
                                        : n
                                )
                            }
                        }
                    };
                });
            },
        }),
        {
            name: 'workspace-storage',
            version: 3,
            migrate: (persistedState: any, version: number) => {
                let state = persistedState;
                if (version < 1) {
                    const missions = state.missions || {};
                    Object.keys(missions).forEach(missionId => {
                        if (!missions[missionId].Notes) {
                            missions[missionId].Notes = [];
                        }
                    });
                    state = { ...state, missions };
                }
                if (version < 3) {
                    const missions = state.missions || {};
                    Object.keys(missions).forEach(missionId => {
                        (missions[missionId].Notes || []).forEach((note: any) => {
                            (note.blocks || []).forEach((block: any) => {
                                if (block.linkedBoardId === undefined) block.linkedBoardId = "";
                                if (block.linkedTaskId === undefined) block.linkedTaskId = "";
                                if (block.linkedSubTaskId === undefined) block.linkedSubTaskId = "";
                            });
                        });
                    });
                    state = { ...state, missions };
                }
                return state;
            }
        }
    )
)
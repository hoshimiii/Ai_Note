# Block 与 Task 双向链接功能

**改动时间**: 2025-03-17

## 概述

为 Block 添加与 SubTask 相同的链接能力，实现 Block ↔ SubTask 双向链接，并在链接弹窗中支持新建笔记/Task。

## 数据结构变更

### Block 类型 (`src/store/kanban/index.ts`)

```typescript
export type Block = {
    blockId: string;
    blockType: string;
    blockContent: string;
    blockCreatedAt: string;
    blockUpdatedAt: string;
    linkedBoardId?: string;   // 新增
    linkedTaskId?: string;   // 新增
    linkedSubTaskId?: string; // 新增
};
```

### 持久化迁移

- `persist` version: 2 → 3
- 遍历所有 `missions[].Notes[].blocks[]`，为旧 Block 补全 `linkedBoardId`、`linkedTaskId`、`linkedSubTaskId`（空字符串）

### 导出变更

- `Board` 类型由 `type` 改为 `export type`

## Store 变更

### 新增 `linkBlock`

```typescript
linkBlock: (activeMissionId, noteId, blockId, boardId, taskId, subTaskId) => void
```

- 更新 Block 的 `linkedBoardId`、`linkedTaskId`、`linkedSubTaskId`
- 若存在对应 SubTask，同步更新 SubTask 的 `linkedNoteId`、`linkedBlockId`

### 修改 `linkSubTask`

- 当 `blockId` 非空时，同步更新该 Block 的 `linkedBoardId`、`linkedTaskId`、`linkedSubTaskId`

## 新增组件

### LinkBlockDialog (`src/components/items/LinkBlockDialog.tsx`)

- 选择 Board → Task → SubTask
- 支持「新建 Task」「新建 SubTask」按钮
- Props: `boards`, `currentBoardId`, `currentTaskId`, `currentSubTaskId`, `onConfirm`, `onCreateTask`, `onCreateSubTask`, `trigger`

## 组件修改

### Note (`src/components/Note/index.tsx`)

- 从 `useWorkSpace` 获取: `boardOrder`, `linkBlock`, `addSubTask`, `updataBoard`
- 计算 `allBoards`（当前 Mission 下的 Board 列表）
- 每个 Block 旁增加 LinkBlockDialog 按钮（hover 显示）
- 已链接时按钮为蓝色
- `onCreateTask`: 调用 `updataBoard` 添加新 Task
- `onCreateSubTask`: 调用 `addSubTask` 添加新 SubTask

### LinkSubTaskDialog (`src/components/items/LinkSubTaskDialog.tsx`)

- 新增 `onCreateNote` 回调
- 新增「新建笔记」按钮

### Task (`src/components/Board/Task.tsx`)

- 从 `useWorkSpace` 获取 `createNote`
- 向 LinkSubTaskDialog 传入 `onCreateNote`，创建新 Note 并返回 `noteId`

## 文件清单

| 文件 | 操作 |
|------|------|
| `src/store/kanban/index.ts` | 修改 Block 类型、linkSubTask、新增 linkBlock、migrate |
| `src/components/items/LinkBlockDialog.tsx` | 新增 |
| `src/components/items/LinkSubTaskDialog.tsx` | 新增 onCreateNote、新建笔记按钮 |
| `src/components/Note/index.tsx` | 集成 LinkBlockDialog、新建 Task/SubTask |
| `src/components/Board/Task.tsx` | 传入 createNote 给 LinkSubTaskDialog |

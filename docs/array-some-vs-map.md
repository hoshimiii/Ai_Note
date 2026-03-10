# Array.some vs Array.map

## 核心区别

| | `some` | `map` |
|---|---|---|
| 返回值 | `boolean` | 新数组 |
| 目的 | 判断是否存在满足条件的元素 | 对每个元素做转换，生成新数组 |
| 是否遍历全部 | 找到第一个满足条件的元素就停止 | 始终遍历全部元素 |
| 副作用 | 无 | 无（返回新数组，不修改原数组） |

## 用法

```ts
const arr = [1, 2, 3, 4];

arr.some(n => n > 3);   // true  （找到 4 后立即停止）
arr.map(n => n * 2);    // [2, 4, 6, 8]
```

## 在本项目中的典型用法

```ts
// some：查找 note 所属的 missionId（只需要知道"有没有"）
const missionId = Object.keys(state.missions).find(id =>
    state.missions[id].Notes.some(n => n.noteId === note.noteId)
);

// map：更新 notes 数组中的某一项（需要返回完整的新数组）
Notes: mission.Notes.map(n =>
    n.noteId === note.noteId
        ? { ...n, blocks: [...n.blocks, newBlock] }
        : n
)
```

`some` 用在 `find` 的回调里，目的是判断这个 mission 里"是否包含"目标 note，一旦找到就短路退出，性能更好。

`map` 用于生成更新后的 Notes 新数组，必须遍历所有元素以保留未修改的项。

## 常见误用

```ts
// 错误：用 map 来做存在性判断
missions[id].Notes.map(n => n.noteId === note.noteId) // 返回 [false, true, false]，不是 boolean

// 错误：用 some 来做数据转换
Notes.some(n => ({ ...n, blocks: [] })) // 返回 true/false，不是新数组
```

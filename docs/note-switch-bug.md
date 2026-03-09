# Bug: 切换 Note 不刷新内容

## 现象

点击侧边栏第一个 note 正常加载，点击另一个 note 后，页面仍显示第一个 note 的内容。

## 根因

`Note` 组件内部用 `useState` 初始化了 `content`：

```tsx
const [content, setContent] = useState(note?.noteContent || "...");
```

`useState` 的初始值**只在组件首次挂载时执行一次**。切换 note 时，React 判断组件类型未变化，复用了同一个组件实例，不会重新挂载，因此 `content` 状态保持旧值不变。

## 修复

在 `MainPage` 中给 `Note` 组件添加 `key={nowNoteId}`：

```tsx
<Note key={nowNoteId} note={Note_item} activeMissionId={nowMissionId} nowNoteId={nowNoteId} />
```

`key` 变化时 React 会强制卸载旧组件、挂载新组件，`useState` 重新执行初始化，`content` 正确加载新 note 的内容。

## 涉及文件

- `src/pages/mainPage/index.tsx` — 添加 `key={nowNoteId}`

# React 回调函数模式：父子组件状态协作

## 核心问题

多个子组件（Block）各自有输入，父组件（Note）需要在用户点击保存时统一收集所有子组件的最新内容。

---

## 模式：父组件持有状态，子组件只负责通知

### 数据流向

```
用户输入 → Block.onChange → Note.handleBlockChange → localContents (state)
                                                            ↓
保存按钮 → Note.handleSave → updateNote(整合后的 note)
```

### 父组件 (Note)

```tsx
// 1. 用 Record<blockId, content> 统一管理所有 block 的内容
const [localContents, setLocalContents] = useState<Record<string, string>>(
    () => Object.fromEntries(note.blocks.map(b => [b.blockId, b.blockContent]))
);

// 2. 这个函数作为回调传给子组件
const handleBlockChange = (blockId: string, content: string) => {
    setLocalContents(prev => ({ ...prev, [blockId]: content }));
};

// 3. 保存时从 localContents 读取最新内容
const handleSave = () => {
    const updatedNote = {
        ...note,
        blocks: note.blocks.map(b => ({
            ...b,
            blockContent: localContents[b.blockId] ?? b.blockContent,
        })),
    };
    updateNote(activeMissionId, note.noteId, updatedNote);
};

// 4. 传给子组件两样东西：当前内容（受控）+ 变更回调
<Block
    content={localContents[block.blockId]}
    onChange={(content) => handleBlockChange(block.blockId, content)}
/>
```

### 子组件 (Block)

```tsx
// 子组件不持有内容状态，只负责展示和通知
export const Block = ({ content, onChange }: { content: string, onChange: (content: string) => void }) => {
    return (
        <textarea
            value={content}           // 受控：内容来自父组件
            onChange={(e) => onChange(e.target.value)}  // 通知父组件
        />
    );
};
```

---

## 关键细节

### 切换 note 时重置本地状态

```tsx
// note.noteId 变化说明切换了笔记，需要重新初始化 localContents
useEffect(() => {
    setLocalContents(Object.fromEntries(note.blocks.map(b => [b.blockId, b.blockContent])));
}, [note.noteId]);
```

### 新增 block 时同步本地状态

```tsx
// note.blocks 变化时，只补充新 block，不覆盖已编辑的旧内容
useEffect(() => {
    setLocalContents(prev => {
        const next = { ...prev };
        note.blocks.forEach(b => {
            if (!(b.blockId in next)) {
                next[b.blockId] = b.blockContent;
            }
        });
        return next;
    });
}, [note.blocks]);
```

---

## 为什么不直接在 Block 内部持有 state？

| 方案 | 问题 |
|------|------|
| Block 自己管理 state | 父组件无法读取，保存时拿不到最新内容 |
| 每次输入直接写 store | 频繁触发全局更新，性能差 |
| 父组件用 `Record<id, content>` | 父组件统一持有，保存和新增 block 都能正确处理 ✓ |

---

## 回调函数签名设计原则

- **只传必要参数**：`onChange: (content: string) => void`，不要把 blockId 也传进去，因为父组件在传回调时已经通过闭包绑定了 blockId
- **用箭头函数绑定参数**：`onChange={(content) => handleBlockChange(block.blockId, content)}`，这样 Block 组件本身不需要知道自己的 id

# 富文本复制到 Markdown 的问题与修复

## 为什么会丢样式

网页复制通常同时包含两份内容：

- `text/plain`：纯文本
- `text/html`：带结构的 HTML

你的编辑器之前直接接收 textarea 默认粘贴，实际主要用了纯文本，所以标题、列表、代码块结构会丢失。

## 已做修复

在 `src/components/Note/Block/index.tsx` 的 markdown 编辑态 `textarea` 增加了 `onPaste`：

1. 优先读取剪贴板的 `text/html`
2. 把 HTML 转成 Markdown
3. 按光标位置插入，不覆盖全部内容

## 当前支持的转换

- 标题：`h1~h6` -> `# ~ ######`
- 段落：`p`
- 列表：`ul/ol/li`
- 粗体/斜体：`strong/em`
- 行内代码与代码块：`code/pre`
- 链接：`a`
- 引用：`blockquote`
- 图片：`img` -> `![alt](src)`

## 仍然可能不完美的场景

- 复杂表格
- 多层嵌套混排
- 某些网站复制时注入的特殊 DOM

## 进一步优化建议

- 如果后续要覆盖更复杂 HTML，接入专门库（如 `turndown`）会更稳定。
- 当前实现是轻量转换，适合你现在的标题/列表/代码块核心场景。

---

# 点击预览区一次直接定位光标

## 问题

点击 Markdown 预览区会切换到编辑态，但光标不在点击位置，还需要再次点击定位。

## 原因

预览区是渲染后的 HTML，切换到编辑态的 textarea 后，React 只会 `focus()`，不知道应该把光标放在哪。

## 修复方案

```
点击预览 div
  ↓
caretRangeFromPoint(x, y)  ← 浏览器 API，返回点击位置的 DOM range
  ↓
取从预览 div 开始到点击位置的所有文本
  ↓
在原始 markdown 中反向查找该文本（取末尾30字符匹配）
  ↓
找到在 markdown 中的对应偏移量，存入 ref
  ↓
setIsEditing(true)
  ↓
useEffect 检测 isEditing 变为 true
  ↓
textareaRef.focus() + setSelectionRange(offset, offset)
```

## 关键 API

```ts
document.caretRangeFromPoint(x, y)
// 返回点击坐标对应的 DOM Range 对象（含文本节点 + 字符偏移）

const fullRange = document.createRange();
fullRange.setStart(previewDiv, 0);
fullRange.setEnd(range.startContainer, range.startOffset);
const textBefore = fullRange.toString(); // 点击点之前的全部文本
```

## 已知限制

- 渲染后的文本不包含 Markdown 语法字符（如 `**`、`##`），所以存在位置偏差
- 对纯文本内容效果好，对大量语法符号的段落会有轻微偏差
- Firefox 需要 `document.caretPositionFromPoint`，当前实现仅覆盖 Chromium

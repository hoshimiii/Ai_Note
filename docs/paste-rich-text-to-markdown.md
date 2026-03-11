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

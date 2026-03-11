# Note Block 中 ReactMarkdown 用法与图片支持

## 你当前写法是否正确

是正确的。  
`ReactMarkdown` + `remarkMath` + `rehypeKatex` 可以正常渲染：

- 普通 Markdown 文本
- 行内公式 `$a+b$`
- 块级公式 `$$...$$`

当前这段可用：

```tsx
<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
  {content}
</ReactMarkdown>
```

---

## 如何加入图片

`ReactMarkdown` 原生支持 Markdown 图片语法，不需要额外插件：

```md
![图片说明](https://example.com/a.png)
```

或本地相对路径（前提是图片能被前端访问到）：

```md
![本地图](/images/demo.png)
```

---

## 建议：给图片加样式，防止撑爆 block

在 `ReactMarkdown` 里自定义 `img` 渲染：

```tsx
<ReactMarkdown
  remarkPlugins={[remarkMath]}
  rehypePlugins={[rehypeKatex]}
  components={{
    img: (props) => (
      <img
        {...props}
        className="max-w-full h-auto rounded-md"
        loading="lazy"
      />
    ),
  }}
>
  {content}
</ReactMarkdown>
```

这样图片会：

- 宽度不超过容器
- 保持比例
- 懒加载

---

## 如果需要“上传图片后插入 Markdown”

最小流程：

1. 用户在编辑态上传图片
2. 上传后拿到 URL
3. 在 `content` 插入 `![alt](url)`
4. `ReactMarkdown` 自动显示图片

# React Router 导航机制

## 核心概念：History Stack

浏览器维护一个 **history 栈**，每次 URL 变化就压入一条记录。
鼠标侧键/浏览器返回 = POP 操作，从栈顶弹出一条记录。

```
[ /workspace ] → [ /work ] → [ /work ]
                                ↑ 打开 note 时 push 的新记录
                   ← POP：回到 /work（看板状态）
      ← POP：回到 /workspace
```

---

## 三种导航方式

### 1. `<Link to="/path">`
声明式导航，渲染为 `<a>` 标签，适合静态跳转。

### 2. `useNavigate()`
命令式导航，适合在事件处理器中使用。

```tsx
const navigate = useNavigate();

// PUSH：向栈中压入新记录（可以返回）
navigate('/work');

// REPLACE：替换当前记录（不可返回）
navigate('/work', { replace: true });

// 数字：在栈中移动，-1 等同于浏览器返回
navigate(-1);
```

**本项目的用法：**
```tsx
// 返回工作区
onClick={() => { setWorkSpace(null); navigate('/workspace') }}

// 打开 note 时 push 一条 history，让返回键可以回到看板
const handleClicknote = (missionId: string, noteId: string) => {
    setMission(missionId);
    setActiveNote(missionId, noteId);
    navigate('/work'); // 关键：产生 history 记录
};
```

### 3. `<Navigate to="/path" />`
渲染时立即跳转，适合权限守卫/重定向。

---

## 三个导航相关 Hook

### `useNavigate()`
返回导航函数，用于触发路由跳转。

### `useLocation()`
返回当前 location 对象。

```ts
const location = useLocation();
location.pathname  // 当前路径，如 "/work"
location.search    // 查询参数，如 "?id=123"
location.state     // navigate 时附带的 state
location.key       // 每次导航都会变化的唯一标识 ← 重要
```

### `useNavigationType()`
返回最近一次导航的类型：
- `'PUSH'` — 正常跳转
- `'REPLACE'` — replace 跳转
- `'POP'` — 浏览器前进/后退/侧键

---

## 本项目解决"返回键回到看板"的方案

**问题：** 切换到 note 是纯 Zustand 状态变更，没有 URL 变化，所以没有 history 记录。
返回键直接跳到上一个 URL（`/workspace`）。

**解决方案：**

```
打开 note → setActiveNote(id) + navigate('/work')  → history 栈新增一条
返回键    → POP 触发 → useEffect 检测到 → setActiveNote(null) → 回到看板
```

**代码实现：**

```tsx
// workPage.tsx
const location = useLocation();
const navigationType = useNavigationType();

useEffect(() => {
    if (navigationType === 'POP' && activeMissionId && activateNoteId) {
        setActiveNote(activeMissionId, null); // 清掉 note，显示看板
    }
}, [location.key]); // location.key 每次导航都变，避免重复触发
```

**为什么用 `location.key` 而不是 `navigationType`：**

`navigationType` 本身不是响应式的触发源，它的值在多次渲染中可能保持不变。
用 `location.key` 作为 `useEffect` 的依赖，确保每次导航（包括 POP）都准确触发一次。

---

## Route 配置

### `createBrowserRouter`（本项目用法）

```tsx
const routes = [
    { path: "/",         element: <div>Home</div> },
    { path: "/workspace", element: <WorkSpacePage /> },
    { path: "/work",     element: <WorkPage /> },
]
export const router = createBrowserRouter(routes)
```

### 嵌套路由 + `<Outlet />`

父路由渲染 `<Outlet />`，子路由填充进去：

```tsx
{
    path: "/work",
    element: <WorkPage />,  // 内部有 <Outlet />
    children: [
        { path: "note/:noteId", element: <NoteDetail /> }
    ]
}
```

访问 `/work/note/123` 时，`<WorkPage>` 渲染，`<Outlet>` 位置渲染 `<NoteDetail>`。

**本项目 WorkPage 里有 `<Outlet />`，但当前没有子路由配置。**
这意味着如果以后要将 note 做成 URL（`/work/note/:noteId`），只需加子路由，不用改父组件。

---

## 面试常见问题

**Q: `useNavigate` 和 `<Link>` 的区别？**

`<Link>` 是声明式，适合静态 UI；`useNavigate` 是命令式，适合需要先执行逻辑（如校验、更新状态）再跳转的场景。

---

**Q: `navigate('/work')` 和 `navigate('/work', { replace: true })` 的区别？**

`push`（默认）：栈中新增记录，用户可以返回。
`replace`：替换当前记录，用户不能通过返回键回来。
典型场景：登录成功后 replace 到首页，避免用户返回到登录页。

---

**Q: SPA 里"无 URL 变化的视图切换"如何支持浏览器返回？**

本项目遇到的真实问题。纯状态切换没有 history 记录，返回键会越过当前页面。
解决：视图切换时调用 `navigate`（push 模式）产生 history 记录，再用 `useNavigationType() === 'POP'` 监听返回事件来恢复状态。

---

**Q: 如何在路由跳转时传递数据？**

```tsx
// 传递
navigate('/detail', { state: { from: 'board', itemId: '123' } });

// 接收
const location = useLocation();
console.log(location.state); // { from: 'board', itemId: '123' }
```

注意：`state` 不在 URL 中，刷新页面后 `state` 丢失。如果需要持久化，应该用 URL 参数（`/detail?id=123`）或 localStorage。

---

**Q: 如何获取 URL 参数？**

```tsx
// 路由定义：{ path: "/note/:noteId" }
import { useParams } from 'react-router';
const { noteId } = useParams();

// 查询参数：/work?tab=board
import { useSearchParams } from 'react-router';
const [searchParams] = useSearchParams();
const tab = searchParams.get('tab');
```

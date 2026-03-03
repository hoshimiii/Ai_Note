
import { WorkSpacePage } from "@/pages/workspacesPage"
import { createBrowserRouter } from "react-router"

const routes = [
    {
        path: "/",
        element: <div>Home</div>
    },
    {
        path: "/workspace",
        element: <WorkSpacePage />
    },
    {
        path: "/work",
        element: <div>workPage</div>
    }
]

export const router = createBrowserRouter(routes)
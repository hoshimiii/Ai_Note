
import { WorkPage } from "@/pages/workPage"
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
        element: <WorkPage />
    }
]

export const router = createBrowserRouter(routes)
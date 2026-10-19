import { Blocks, CircleDollarSign, Clapperboard, Images, LibraryBig, ListTodo, PanelsTopLeft, Settings, WandSparkles } from "lucide-react";

export const navigationTools = [
    {
        slug: "create",
        label: "Create",
        icon: WandSparkles,
        section: "Workspace",
    },
    {
        slug: "projects",
        label: "Projects",
        icon: Clapperboard,
        section: "Workspace",
    },
    {
        slug: "canvas",
        label: "Canvas",
        icon: PanelsTopLeft,
        section: "Workspace",
    },
    {
        slug: "tasks",
        label: "Tasks",
        icon: ListTodo,
        section: "Workspace",
    },
    {
        slug: "assets",
        label: "Assets",
        icon: Images,
        section: "Workspace",
    },
    {
        slug: "skills",
        label: "Skills",
        icon: LibraryBig,
        section: "Manage",
    },
    {
        slug: "plugins",
        label: "Extensions",
        icon: Blocks,
        section: "Manage",
    },
    {
        slug: "wallet",
        label: "Usage",
        icon: CircleDollarSign,
        section: "Manage",
    },
    {
        slug: "settings",
        label: "Settings",
        icon: Settings,
        section: "Manage",
    },
] as const;

export type NavigationToolSlug = (typeof navigationTools)[number]["slug"];

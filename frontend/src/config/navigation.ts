import {
  Building2,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "MANAGER", "ADMIN"],
  },
  {
    href: "/employees",
    label: "Employees",
    icon: Users,
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/departments",
    label: "Departments",
    icon: Building2,
    roles: ["ADMIN"],
  },
  {
    href: "/teams",
    label: "Teams",
    icon: UsersRound,
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: CheckSquare,
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/users",
    label: "Users",
    icon: UserCog,
    roles: ["ADMIN"],
  },
];

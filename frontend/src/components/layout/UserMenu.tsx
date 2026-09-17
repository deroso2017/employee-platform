"use client";

import { LogOut, Settings, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useAuth } from "@/context/AuthContext";

function getInitials(email?: string): string {
  if (!email) {
    return "U";
  }

  return email.split("@")[0].slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const initials = getInitials(user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className={[
          "inline-flex h-9 items-center gap-2 rounded-md px-2",
          "text-sm font-medium transition-colors",
          "outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2",
        ].join(" ")}
      >
        <Avatar className="size-8">
          <AvatarFallback className="text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="hidden lg:flex flex-col items-start">
          <span className="max-w-32 truncate text-xs font-medium">
            {user.email}
          </span>

          <span className="text-[10px] text-muted-foreground">{user.role}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{user.email}</span>

            <span className="text-xs font-normal text-muted-foreground">
              {user.role}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserCircle className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import { NAV_ITEMS } from "@/config/navigation";

import { DesktopNav } from "./DesktopNav";
import { TabletNav } from "./TabletNav";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Brand } from "./Brand";

export default function Navbar() {
  const { user } = useAuth();

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false,
  );

  return (
    <header className="sticky top-0 z-50 border-b border-nav-border bg-nav-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Brand />

        {/* Navigation */}
        <div className="flex min-w-0 flex-1 items-center">
          <DesktopNav items={visibleNavItems} />
          <TabletNav items={visibleNavItems} />
        </div>

        {/* Account */}
        <div className="ml-auto flex shrink-0 items-center">
          <ThemeToggle />
          <UserMenu />
          {/* Mobile menu */}
          <MobileNav items={visibleNavItems} />
        </div>
      </div>
    </header>
  );
}

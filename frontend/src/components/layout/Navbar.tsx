"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import { NAV_ITEMS } from "@/config/navigation";

import { DesktopNav } from "./DesktopNav";
import { TabletNav } from "./TabletNav";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";

export default function Navbar() {
  const { user } = useAuth();

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false,
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <MobileNav items={visibleNavItems} />

        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2"
          aria-label="Employee Platform dashboard"
        >
          <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            EP
          </span>

          <span className="hidden font-semibold tracking-tight sm:inline">
            Employee Platform
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex min-w-0 flex-1 items-center">
          <DesktopNav items={visibleNavItems} />
          <TabletNav items={visibleNavItems} />
        </div>

        {/* Account */}
        <div className="ml-auto flex shrink-0 items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

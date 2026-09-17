"use client";

import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/context/AuthContext";
import { isNavItemActive } from "./navigation-utils";
import type { NavItem } from "@/config/navigation";

interface MobileNavProps {
  items: NavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Sheet>
      {/* Fixed: Use the 'render' prop for Base UI instead of 'asChild' to avoid nested <button> errors */}
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
        }
      />

      <SheetContent
        side="left"
        className="flex w-[300px] max-w-[85vw] flex-col"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">
              EP
            </span>
            Employee Platform
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <nav
          aria-label="Mobile navigation"
          className="flex flex-1 flex-col gap-1 overflow-y-auto"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-md px-3 py-2.5",
                  "text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t pt-4">
          {user && (
            <div className="mb-3 rounded-md bg-muted/50 px-3 py-2">
              <p className="truncate text-sm font-medium">{user.email}</p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {user.role}
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

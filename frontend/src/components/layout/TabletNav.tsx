"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { isNavItemActive } from "./navigation-utils";
import type { NavItem } from "@/config/navigation";

interface TabletNavProps {
  items: NavItem[];
}

const PRIMARY_ITEM_COUNT = 4;

export function TabletNav({ items }: TabletNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const primaryItems = items.slice(0, PRIMARY_ITEM_COUNT);
  const moreItems = items.slice(PRIMARY_ITEM_COUNT);

  const moreActive = moreItems.some((item) =>
    isNavItemActive(pathname, item.href),
  );

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden lg:flex xl:hidden items-center gap-1"
    >
      {primaryItems.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "inline-flex items-center gap-2 rounded-md px-3 py-2",
              "text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {moreItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More navigation options"
            className={[
              "inline-flex h-9 items-center justify-center gap-2",
              "rounded-md px-3 text-sm font-medium",
              "transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2",
              moreActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
          >
            <MoreHorizontal className="size-4 shrink-0" />
            <span>More</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname, item.href);

              return (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={active ? "bg-muted" : ""}
                >
                  <Icon className="mr-2 size-4" />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}

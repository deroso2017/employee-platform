"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavItemActive } from "./navigation-utils";
import type { NavItem } from "@/config/navigation";

interface DesktopNavProps {
  items: NavItem[];
}

export function DesktopNav({ items }: DesktopNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden xl:flex items-center gap-1"
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
              "inline-flex items-center gap-2 rounded-md px-3 py-2",
              "text-sm font-medium transition-colors",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-ring",
              "focus-visible:ring-offset-2",
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
    </nav>
  );
}

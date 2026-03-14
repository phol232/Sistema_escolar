"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { NAV_ICONS } from "./nav-icons";

interface NavLinksProps {
  collapsed: boolean;
  items: NavItem[];
}

export function NavLinks({ collapsed, items }: NavLinksProps) {
  const pathname = usePathname();
  const router = useRouter();
  const prefetchedHrefs = useRef(new Set<string>());

  const prefetchHref = useCallback((href: string) => {
    if (prefetchedHrefs.current.has(href)) {
      return;
    }

    prefetchedHrefs.current.add(href);
    void router.prefetch(href as Route);
  }, [router]);

  if (items.length === 0) {
    return collapsed ? null : (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
        Este módulo no tiene accesos visibles para tu rol todavía.
      </div>
    );
  }

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon];
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={`${item.module}-${item.href}`}
            href={item.href as Route}
            onFocus={() => prefetchHref(item.href)}
            onMouseEnter={() => prefetchHref(item.href)}
            className={cn(
              "group flex rounded-xl border border-transparent transition",
              collapsed
                ? "justify-center px-0 py-1.5"
                : "items-center gap-3 px-3 py-2 hover:border-foreground hover:bg-foreground hover:text-background",
              isActive && "border-foreground bg-foreground text-background shadow-xs",
            )}
            title={item.label}
          >
            <Icon
              className={cn(
                "shrink-0",
                collapsed ? "h-5 w-5" : "h-4.5 w-4.5",
                item.iconColor,
                isActive && "text-current",
              )}
            />
            {!collapsed ? <p className="truncate text-sm font-semibold leading-5">{item.label}</p> : null}
          </Link>
        );
      })}
    </nav>
  );
}

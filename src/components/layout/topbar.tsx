"use client";

import { useMemo } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { UserMenu } from "@/components/layout/user-menu";
import { DASHBOARD_NAV, PHASE_TWO_MODULES } from "@/lib/constants";
import type { AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TopbarProps {
  user: AppUser;
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const visibleItems = useMemo(() => DASHBOARD_NAV.filter((item) => item.roles.includes(user.role)), [user.role]);
  const visibleModules = useMemo(
    () => PHASE_TWO_MODULES.filter((module) => visibleItems.some((item) => item.module === module.id)),
    [visibleItems],
  );

  const currentModuleId =
    visibleItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.module ??
    visibleModules[0]?.id ??
    "";

  const currentNavItem = visibleItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  const currentModule = visibleModules.find((m) => m.id === currentModuleId);

  return (
    <header className="relative z-30 flex items-center justify-between gap-3 overflow-visible">
      {/* ── Breadcrumb / título de página ── */}
      <div className="hidden min-w-0 md:flex md:items-center md:gap-2">
        {currentModule && (
          <>
            <span className="truncate text-xs font-medium text-muted-foreground">{currentModule.label}</span>
            {currentNavItem && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                <span className="truncate text-sm font-semibold text-foreground">{currentNavItem.label}</span>
              </>
            )}
          </>
        )}
        {!currentModule && !currentNavItem && (
          <span className="text-sm font-semibold text-foreground">Inicio</span>
        )}
      </div>

      {/* ── Controles derechos ── */}
      <div className="ml-auto flex items-center gap-2.5">
        <div className="min-w-[180px]">
          <select
            aria-label="Seleccionar módulo"
            className={cn(
              "flex h-9 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium shadow-xs",
              "outline-none transition focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-ring/15",
            )}
            onChange={(event) => {
              const nextModule = visibleModules.find((module) => module.id === event.target.value);
              if (nextModule) {
                router.push(nextModule.href as Route);
              }
            }}
            value={currentModuleId}
          >
            {visibleModules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.label}
              </option>
            ))}
          </select>
        </div>
        <UserMenu user={user} />
      </div>
    </header>
  );
}

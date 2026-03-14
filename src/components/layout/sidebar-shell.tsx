"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, GraduationCap, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { APP_NAME, DASHBOARD_NAV, PHASE_TWO_MODULES } from "@/lib/constants";
import type { AppRole, NavModuleId } from "@/lib/types";
import { cn } from "@/lib/utils";

import { NAV_ICONS } from "./nav-icons";
import { NavLinks } from "./nav-links";

interface SidebarShellProps {
  role: AppRole;
}

export function SidebarShell({ role }: SidebarShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState<{ module: NavModuleId; pathname: string } | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => DASHBOARD_NAV.filter((item) => item.roles.includes(role)), [role]);
  const visibleModules = useMemo(
    () => PHASE_TWO_MODULES.filter((module) => visibleItems.some((item) => item.module === module.id)),
    [visibleItems],
  );

  const routeModule =
    visibleItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.module ?? visibleModules[0]?.id ?? "configuracion";
  const activeModule =
    selectedModule && selectedModule.pathname === pathname && visibleModules.some((module) => module.id === selectedModule.module)
      ? selectedModule.module
      : routeModule;
  const activeItems = visibleItems.filter((item) => item.module === activeModule);
  const activeModuleMeta = visibleModules.find((module) => module.id === activeModule) ?? null;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setIsSelectorOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <aside
      className={cn(
        "surface-sidebar hidden shrink-0 overflow-hidden transition-[width,padding] duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[92px] p-3" : "w-[252px] p-4",
      )}
    >
      <div className="space-y-4 border-b border-sidebar-border pb-4">
        <div className={cn("flex items-start gap-3", collapsed && "flex-col items-center gap-2")}>
          <Link
            aria-label="Ir al inicio"
            className={cn("flex min-w-0 items-center gap-3", collapsed && "justify-center")}
            href={"/inicio" as Route}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            {!collapsed ? (
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Panel</p>
                <h1 className="truncate text-[1.35rem] font-semibold leading-none">{APP_NAME}</h1>
                <p className="truncate text-xs text-muted-foreground">Accesos del módulo actual</p>
              </div>
            ) : null}
          </Link>
          <Button
            aria-label={collapsed ? "Expandir sidebar" : "Comprimir sidebar"}
            className={cn("shrink-0", collapsed && "mt-1")}
            onClick={() => setCollapsed((current) => !current)}
            size="icon"
            variant="outline"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {!collapsed ? (
          <div className="space-y-2.5" ref={selectorRef}>
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Módulo activo</p>
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/[0.08] px-2 text-[11px] font-semibold text-primary">
                {visibleModules.length}
              </span>
            </div>
            <div className="relative">
              <button
                aria-expanded={isSelectorOpen}
                aria-haspopup="listbox"
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition",
                  "hover:border-primary/35 hover:bg-primary/[0.06]",
                  isSelectorOpen && "border-primary/35 bg-primary/[0.08] ring-4 ring-ring/15",
                )}
                onClick={() => setIsSelectorOpen((current) => !current)}
                type="button"
              >
                {activeModuleMeta ? (
                  <>
                    {(() => {
                      const ActiveIcon = NAV_ICONS[activeModuleMeta.icon];

                      return <ActiveIcon className={cn("h-4.5 w-4.5 shrink-0", activeModuleMeta.iconColor)} />;
                    })()}
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{activeModuleMeta.label}</span>
                  </>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">Seleccionar módulo</span>
                )}
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isSelectorOpen && "rotate-180 text-primary")} />
              </button>

              {isSelectorOpen ? (
                <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 rounded-xl border border-border bg-card p-2 shadow-lg">
                  <div className="space-y-1" role="listbox">
                    {visibleModules.map((module) => {
                      const ModuleIcon = NAV_ICONS[module.icon];
                      const isSelected = module.id === activeModule;

                      return (
                        <button
                          key={module.id}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-primary/[0.08] hover:text-primary",
                          )}
                          onClick={() => {
                            setSelectedModule({ module: module.id, pathname });
                            setIsSelectorOpen(false);
                          }}
                          type="button"
                        >
                          <ModuleIcon className={cn("h-4 w-4 shrink-0", isSelected ? "text-current" : module.iconColor)} />
                          <span className="min-w-0 flex-1 truncate">{module.label}</span>
                          {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/[0.45] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Accesos</p>
              <p className="mt-1 text-sm font-medium">{activeItems.length} opciones disponibles</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {visibleModules.map((module) => {
              const ModuleIcon = NAV_ICONS[module.icon];
              const isSelected = module.id === activeModule;

              return (
                <button
                  key={module.id}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-sidebar-border bg-card hover:border-foreground hover:bg-foreground hover:text-background",
                  )}
                  onClick={() => setSelectedModule({ module: module.id, pathname })}
                  title={module.label}
                  type="button"
                >
                  <ModuleIcon className={cn("h-4.5 w-4.5", module.iconColor, isSelected && "text-current")} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={cn("mt-4 flex-1 overflow-y-auto", collapsed ? "pr-0" : "pr-1")}>
        <NavLinks collapsed={collapsed} items={activeItems} />
      </div>

      <div className={cn("mt-4 border-t border-sidebar-border pt-4", collapsed ? "px-0" : "px-0")}>
        {collapsed ? (
          <form action={logoutAction} className="flex justify-center">
            <Button
              aria-label="Cerrar sesión"
              className="border-destructive/25 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              size="icon"
              type="submit"
              variant="outline"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sesión</p>
            <form action={logoutAction}>
              <Button
                className="w-full justify-start gap-2 border-destructive/25 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                type="submit"
                variant="outline"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}

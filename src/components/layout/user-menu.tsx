"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { logoutAction } from "@/app/actions/auth";
import { ROLE_LABELS } from "@/lib/constants";
import type { AppUser } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: AppUser;
}

function getSettingsHref(role: AppUser["role"]) {
  if (role === "super_admin" || role === "director") {
    return "/configuracion/anio-escolar";
  }

  return "/inicio";
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = user.displayName
    ?.split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const settingsHref = useMemo(() => getSettingsHref(user.role), [user.role]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative z-40" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-left shadow-sm transition hover:border-primary/25 hover:bg-background",
          isOpen && "border-primary/30 ring-2 ring-primary/10",
        )}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
          {initials ?? "US"}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-52 truncate text-sm font-semibold">{user.displayName ?? user.email}</p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>
        <div className="hidden min-[480px]:flex min-[480px]:items-center min-[480px]:gap-2 md:inline-flex">
          <span className="text-sm font-medium">Perfil</span>
          <span
            className={cn("text-xs text-muted-foreground transition-transform", isOpen && "rotate-180")}
            aria-hidden="true"
          >
            ▼
          </span>
        </div>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-50 mt-3 w-56 rounded-xl border border-border/80 bg-background/98 p-2 shadow-2xl backdrop-blur"
          role="menu"
        >
          <Link
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted"
            href={settingsHref}
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            Ajustes
          </Link>
          <form action={logoutAction}>
            <Button
              className="mt-1 w-full justify-start rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
              role="menuitem"
              size="sm"
              type="submit"
              variant="ghost"
            >
              Cerrar sesión
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

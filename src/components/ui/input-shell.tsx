"use client";

import { useRef, type HTMLAttributes, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

interface InputShellProps extends HTMLAttributes<HTMLDivElement> {
  filled?: boolean;
}

export function InputShell({ filled = false, className, onClick, children, ...props }: InputShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button,a,label,input,textarea,select")) {
      return;
    }

    const control = shellRef.current?.querySelector<HTMLElement>("input, textarea, select");
    control?.focus();
  }

  return (
    <div
      {...props}
      className={cn(
        "flex cursor-text items-center gap-3 rounded-lg border border-input bg-card px-3 shadow-xs transition-colors",
        "focus-within:border-primary/40 focus-within:bg-primary/[0.06] focus-within:ring-4 focus-within:ring-ring/15",
        "data-[filled=true]:border-primary/20 data-[filled=true]:bg-primary/[0.06]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      data-filled={filled ? "true" : "false"}
      onClick={handleClick}
      ref={shellRef}
    >
      {children}
    </div>
  );
}

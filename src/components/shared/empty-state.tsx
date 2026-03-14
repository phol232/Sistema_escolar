import { FolderOpen } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/60">
        <FolderOpen className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

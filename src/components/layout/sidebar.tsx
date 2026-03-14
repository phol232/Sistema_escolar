import type { AppRole } from "@/lib/types";

import { SidebarShell } from "./sidebar-shell";

interface SidebarProps {
  role: AppRole;
}

export function Sidebar({ role }: SidebarProps) {
  return <SidebarShell role={role} />;
}

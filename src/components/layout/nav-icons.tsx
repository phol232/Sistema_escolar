import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CalendarRange,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  HeartHandshake,
  LayoutGrid,
  Link2,
  School,
  Settings2,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

import type { NavIconKey } from "@/lib/types";

export const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  users: Users,
  settings2: Settings2,
  graduationCap: GraduationCap,
  briefcaseBusiness: BriefcaseBusiness,
  heartHandshake: HeartHandshake,
  userPlus: UserPlus,
  userCog: UserCog,
  calendarRange: CalendarRange,
  calendarCheck2: CalendarCheck2,
  school: School,
  building2: Building2,
  link2: Link2,
  layoutGrid: LayoutGrid,
  bookOpen: BookOpen,
  clipboardList: ClipboardList,
  folderKanban: FolderKanban,
};

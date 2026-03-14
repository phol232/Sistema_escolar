export type AppRole =
  | "super_admin"
  | "director"
  | "subdirector"
  | "secretaria"
  | "tesoreria"
  | "docente"
  | "tutor"
  | "apoderado";

export type EstadoGeneral = "activo" | "inactivo";

export type SexoTipo = "M" | "F";

export interface AppUser {
  id: string;
  email: string;
  role: AppRole;
  personaId?: string | null;
  displayName?: string | null;
}

export type NavModuleId = "configuracion" | "escolar" | "academico" | "tesoreria";

export type NavIconKey =
  | "users"
  | "settings2"
  | "graduationCap"
  | "briefcaseBusiness"
  | "heartHandshake"
  | "userPlus"
  | "userCog"
  | "calendarRange"
  | "calendarCheck2"
  | "school"
  | "building2"
  | "link2"
  | "layoutGrid"
  | "bookOpen"
  | "clipboardList"
  | "folderKanban";

export interface SidebarModule {
  id: NavModuleId;
  label: string;
  href: string;
  description: string;
  icon: NavIconKey;
  iconColor: string;
  roles: AppRole[];
}

export interface NavItem {
  href: string;
  label: string;
  description?: string;
  shortLabel?: string;
  roles: AppRole[];
  icon: NavIconKey;
  iconColor: string;
  module: NavModuleId;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
}

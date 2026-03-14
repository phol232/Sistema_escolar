import type { AppRole, NavItem, SidebarModule } from "@/lib/types";

export const APP_NAME = "Sistema Escolar";

export const ALL_ROLES: AppRole[] = [
  "super_admin",
  "director",
  "subdirector",
  "secretaria",
  "tesoreria",
  "docente",
  "tutor",
  "apoderado",
];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  director: "Director",
  subdirector: "Subdirector",
  secretaria: "Secretaría",
  tesoreria: "Tesorería",
  docente: "Docente",
  tutor: "Tutor",
  apoderado: "Apoderado",
};

const ADMIN_ROLES: AppRole[] = ["super_admin", "director"];
const STAFF_ROLES: AppRole[] = ["super_admin", "director", "subdirector", "secretaria"];
const STUDENT_MANAGEMENT_ROLES: AppRole[] = ["super_admin", "director", "subdirector", "secretaria", "docente", "tutor"];
const TEACHER_MANAGEMENT_ROLES: AppRole[] = ["super_admin", "director", "subdirector"];
const GUARDIAN_MANAGEMENT_ROLES: AppRole[] = ["super_admin", "director", "secretaria", "tutor"];

export const PHASE_TWO_MODULES: SidebarModule[] = [
  {
    id: "configuracion",
    label: "Configuración",
    href: "/personas",
    description: "Maestros y catálogos",
    icon: "settings2",
    iconColor: "text-amber-600",
    roles: ["super_admin", "director", "subdirector", "secretaria"],
  },
  {
    id: "escolar",
    label: "Escolar",
    href: "/alumnos",
    description: "Actores y matrículas",
    icon: "graduationCap",
    iconColor: "text-emerald-600",
    roles: ["super_admin", "director", "subdirector", "secretaria", "docente", "tutor", "tesoreria"],
  },
  {
    id: "academico",
    label: "Académico",
    href: "/academico/secciones",
    description: "Cursos y evaluación",
    icon: "bookOpen",
    iconColor: "text-indigo-600",
    roles: ["super_admin", "director", "subdirector", "docente", "tutor", "apoderado"],
  },
  {
    id: "tesoreria",
    label: "Tesorería",
    href: "/tesoreria/pensiones",
    description: "Pensiones y pagos",
    icon: "folderKanban",
    iconColor: "text-orange-600",
    roles: ["super_admin", "director", "tesoreria", "secretaria", "apoderado"],
  },
];

export const DASHBOARD_NAV: NavItem[] = [
  {
    href: "/personas",
    label: "Personas",
    roles: STAFF_ROLES,
    icon: "users",
    iconColor: "text-sky-600",
    module: "configuracion",
  },
  {
    href: "/configuracion/usuarios",
    label: "Usuarios",
    roles: ["super_admin"],
    icon: "userCog",
    iconColor: "text-slate-600",
    module: "configuracion",
  },
  {
    href: "/configuracion/anio-escolar",
    label: "Años",
    roles: ADMIN_ROLES,
    icon: "calendarRange",
    iconColor: "text-amber-600",
    module: "configuracion",
  },
  {
    href: "/configuracion/niveles-grados",
    label: "Niveles",
    roles: ADMIN_ROLES,
    icon: "school",
    iconColor: "text-amber-600",
    module: "configuracion",
  },
  {
    href: "/configuracion/aulas",
    label: "Aulas",
    roles: ADMIN_ROLES,
    icon: "building2",
    iconColor: "text-amber-600",
    module: "configuracion",
  },
  {
    href: "/docentes",
    label: "Docentes",
    roles: TEACHER_MANAGEMENT_ROLES,
    icon: "briefcaseBusiness",
    iconColor: "text-violet-600",
    module: "configuracion",
  },
  {
    href: "/alumnos",
    label: "Alumnos",
    roles: STUDENT_MANAGEMENT_ROLES,
    icon: "graduationCap",
    iconColor: "text-emerald-600",
    module: "escolar",
  },
  {
    href: "/apoderados",
    label: "Apoderados",
    roles: GUARDIAN_MANAGEMENT_ROLES,
    icon: "heartHandshake",
    iconColor: "text-rose-600",
    module: "escolar",
  },
  {
    href: "/apoderados/vinculaciones",
    label: "Vínculos",
    roles: GUARDIAN_MANAGEMENT_ROLES,
    icon: "link2",
    iconColor: "text-rose-600",
    module: "escolar",
  },
  {
    href: "/matriculas",
    label: "Matrículas",
    roles: ["super_admin", "director", "secretaria", "tesoreria"],
    icon: "folderKanban",
    iconColor: "text-emerald-600",
    module: "escolar",
  },
  {
    href: "/academico/secciones",
    label: "Secciones",
    roles: ["super_admin", "director", "subdirector", "docente", "tutor"],
    icon: "layoutGrid",
    iconColor: "text-indigo-600",
    module: "academico",
  },
  {
    href: "/academico/cursos",
    label: "Cursos",
    roles: ["super_admin", "director", "subdirector", "docente", "tutor"],
    icon: "bookOpen",
    iconColor: "text-indigo-600",
    module: "academico",
  },
  {
    href: "/academico/asignaciones",
    label: "Asignar",
    roles: TEACHER_MANAGEMENT_ROLES,
    icon: "link2",
    iconColor: "text-indigo-600",
    module: "academico",
  },
  {
    href: "/asistencia",
    label: "Asistencia",
    roles: ["super_admin", "director", "subdirector", "docente", "tutor", "apoderado"],
    icon: "calendarCheck2",
    iconColor: "text-indigo-600",
    module: "academico",
  },
  {
    href: "/evaluaciones",
    label: "Evaluar",
    roles: ["super_admin", "director", "subdirector", "docente", "tutor"],
    icon: "clipboardList",
    iconColor: "text-indigo-600",
    module: "academico",
  },
  {
    href: "/evaluaciones/notas",
    label: "Notas",
    roles: ["super_admin", "director", "subdirector", "docente", "tutor", "apoderado"],
    icon: "bookOpen",
    iconColor: "text-indigo-600",
    module: "academico",
  },
  {
    href: "/tesoreria/pensiones",
    label: "Pensiones",
    roles: ["super_admin", "director", "tesoreria", "secretaria", "apoderado"],
    icon: "calendarRange",
    iconColor: "text-orange-600",
    module: "tesoreria",
  },
  {
    href: "/tesoreria/pagos",
    label: "Pagos",
    roles: ["super_admin", "director", "tesoreria", "apoderado"],
    icon: "folderKanban",
    iconColor: "text-orange-600",
    module: "tesoreria",
  },
];

export const ROLE_GUARDS = {
  configuracion: ["super_admin", "director"],
  personas: STAFF_ROLES,
  alumnos: STUDENT_MANAGEMENT_ROLES,
  docentes: TEACHER_MANAGEMENT_ROLES,
  apoderados: GUARDIAN_MANAGEMENT_ROLES,
  tesoreria: ["super_admin", "director", "tesoreria"],
  academico: ["super_admin", "director", "subdirector", "docente", "tutor"],
  evaluaciones: ["super_admin", "director", "subdirector", "docente", "tutor", "apoderado"],
} satisfies Record<string, readonly AppRole[]>;

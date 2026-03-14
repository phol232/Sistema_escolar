import { ModulePage } from "@/components/shared/module-page";

export default function AsignacionesPage() {
  return (
    <ModulePage
      title="Asignaciones"
      description="Pendiente de enlazar docente, curso y sección con reglas únicas por salón."
      highlights={[
        "Tabla docente_curso_seccion",
        "Control de duplicados por curso/sección",
      ]}
    />
  );
}

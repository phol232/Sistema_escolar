import { ModulePage } from "@/components/shared/module-page";

export default function DocenteDetallePage() {
  return (
    <ModulePage
      title="Detalle del docente"
      description="Preparado para ver datos del docente, cursos asignados y secciones tutoriadas."
      highlights={[
        "Asignaciones por curso y sección",
        "Historial académico del docente",
      ]}
    />
  );
}

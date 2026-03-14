import { ModulePage } from "@/components/shared/module-page";

export default function SeccionesPage() {
  return (
    <ModulePage
      title="Secciones"
      description="Configuración de secciones, tutor asignado, aula y turno."
      highlights={[
        "Validación de capacidad del aula",
        "Consulta de secciones por año escolar activo",
      ]}
    />
  );
}

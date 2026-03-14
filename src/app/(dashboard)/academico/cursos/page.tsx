import { ModulePage } from "@/components/shared/module-page";

export default function CursosPage() {
  return (
    <ModulePage
      title="Cursos"
      description="Gestión base de cursos y catálogo académico."
      highlights={[
        "Cursos troncales y especialidades",
        "Catálogo reutilizable por nivel/grado",
      ]}
    />
  );
}

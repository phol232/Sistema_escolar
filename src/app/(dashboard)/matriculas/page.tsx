import { ModulePage } from "@/components/shared/module-page";

export default function MatriculasPage() {
  return (
    <ModulePage
      title="Matrículas"
      description="Base lista para listar matrículas y estados por año escolar."
      actionLabel="Nueva matrícula"
      highlights={[
        "Invocación server-side a crear_matricula",
        "Visualización de pensiones generadas",
      ]}
    />
  );
}

import { ModulePage } from "@/components/shared/module-page";

export default function EvaluacionesPage() {
  return (
    <ModulePage
      title="Evaluaciones"
      description="Base para registrar evaluaciones por curso, sección y bimestre."
      actionLabel="Nueva evaluación"
      highlights={[
        "Creación por docente o subdirección",
        "Peso y fecha de evaluación",
      ]}
    />
  );
}

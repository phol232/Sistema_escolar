import { MatriculaForm } from "@/components/forms/matricula-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NuevaMatriculaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nueva matrícula" description="Formulario inicial para crear matrícula y generar pensiones." />
      <MatriculaForm />
    </div>
  );
}

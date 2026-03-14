import { DocenteForm } from "@/components/forms/docente-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NuevoDocentePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo docente" description="Base del formulario de creación de docentes." />
      <DocenteForm />
    </div>
  );
}

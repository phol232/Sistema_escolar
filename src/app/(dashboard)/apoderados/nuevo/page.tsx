import { ApoderadoForm } from "@/components/forms/apoderado-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NuevoApoderadoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo apoderado" description="Base del formulario de creación de apoderados." />
      <ApoderadoForm />
    </div>
  );
}

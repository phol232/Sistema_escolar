import { AlumnoForm } from "@/components/forms/alumno-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NuevoAlumnoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo alumno" description="Base del formulario de creación de alumnos." />
      <AlumnoForm />
    </div>
  );
}

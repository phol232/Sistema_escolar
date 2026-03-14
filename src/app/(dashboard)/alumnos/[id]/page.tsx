import { ModulePage } from "@/components/shared/module-page";

export default function AlumnoDetallePage() {
  return (
    <ModulePage
      title="Detalle del alumno"
      description="Vista preparada para editar datos personales, matrícula vigente y relaciones con apoderados."
      highlights={[
        "Resumen de datos personales",
        "Historial académico y financiero",
      ]}
    />
  );
}

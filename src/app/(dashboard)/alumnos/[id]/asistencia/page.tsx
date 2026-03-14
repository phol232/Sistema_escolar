import { ModulePage } from "@/components/shared/module-page";

export default function AlumnoAsistenciaPage() {
  return (
    <ModulePage
      title="Asistencia del alumno"
      description="Preparado para mostrar histórico de asistencia por fechas y estado."
      highlights={[
        "Filtro por periodo",
        "Trazabilidad de faltas, tardanzas y justificaciones",
      ]}
    />
  );
}

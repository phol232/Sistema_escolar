import { ModulePage } from "@/components/shared/module-page";

export default function AsistenciaPage() {
  return (
    <ModulePage
      title="Asistencia"
      description="Registro diario preparado para trabajar por sección y fecha."
      highlights={[
        "Estados presente, falta, tardanza y justificado",
        "Realtime reservado para supervisión del director",
      ]}
    />
  );
}

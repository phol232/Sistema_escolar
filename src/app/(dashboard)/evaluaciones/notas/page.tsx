import { ModulePage } from "@/components/shared/module-page";

export default function NotasPage() {
  return (
    <ModulePage
      title="Notas"
      description="Base para ingreso y consulta de notas por evaluación."
      highlights={[
        "Promedios por bimestre con RPC",
        "Edición segura según asignación docente",
      ]}
    />
  );
}

import { ModulePage } from "@/components/shared/module-page";

export default function ApoderadoDetallePage() {
  return (
    <ModulePage
      title="Detalle del apoderado"
      description="Preparado para ver alumnos vinculados, parentesco y estado financiero."
      highlights={[
        "Dependientes asociados",
        "Resumen de pensiones y pagos",
      ]}
    />
  );
}

import { ModulePage } from "@/components/shared/module-page";

export default function PensionesPage() {
  return (
    <ModulePage
      title="Pensiones"
      description="Listado base para pensiones por matrícula, estado y vencimiento."
      highlights={[
        "Resumen por alumno y año escolar",
        "Estados pendiente, parcial, pagado y vencido",
      ]}
    />
  );
}

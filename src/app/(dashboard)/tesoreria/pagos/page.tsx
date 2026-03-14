import { ModulePage } from "@/components/shared/module-page";

export default function PagosPage() {
  return (
    <ModulePage
      title="Pagos"
      description="Base para registrar pagos y visualizar su efecto en la pensión."
      actionLabel="Registrar pago"
      highlights={[
        "Invocación server-side a registrar_pago",
        "Notificación en tiempo real para tesorería",
      ]}
    />
  );
}

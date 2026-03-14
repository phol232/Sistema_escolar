import { ModulePage } from "@/components/shared/module-page";

export default function RecoveryPage() {
  return (
    <ModulePage
      title="Recuperar acceso"
      description="Base lista para conectar el flujo de recuperación con Supabase Auth."
      actionLabel="Configurar correo"
      highlights={[
        "Agregar envío de reset password con Supabase",
        "Implementar confirmación por email y cambio de contraseña",
      ]}
    />
  );
}

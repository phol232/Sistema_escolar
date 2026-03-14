import { redirect } from "next/navigation";

import { AdminUserRegisterForm } from "@/components/forms/admin-user-register-form";
import { requireCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildFullName } from "@/lib/utils";

export default async function UsuariosPage() {
  const currentUser = await requireCurrentUser();

  if (currentUser.role !== "super_admin") {
    redirect("/inicio");
  }

  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from("usuarios")
    .select(
      "id,username,estado,created_at,roles!inner(nombre),personas!inner(dni,nombres,apellido_paterno,apellido_materno,email)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <AdminUserRegisterForm users={[]} />;
  }

  const users = (data ?? []).map((row: any) => ({
    id: row.id as string,
    fullName: row.personas ? buildFullName(row.personas) : "Usuario",
    dni: row.personas?.dni ?? "-",
    email: row.personas?.email ?? "-",
    role: row.roles?.nombre ?? "apoderado",
    username: row.username ?? "-",
    estado: row.estado ?? "activo",
    createdAt: row.created_at ?? new Date().toISOString(),
  }));

  return <AdminUserRegisterForm users={users} />;
}

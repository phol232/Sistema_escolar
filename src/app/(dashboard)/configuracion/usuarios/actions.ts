"use server";

import { revalidatePath } from "next/cache";

import { isRoleAllowed, requireCurrentUser } from "@/lib/auth";
import { registerSchoolUser } from "@/lib/auth/register-service";
import { adminRegisterSchema, type AdminRegisterFormValues } from "@/lib/validations/auth.schema";

export async function registerUserByAdminAction(values: AdminRegisterFormValues) {
  const currentUser = await requireCurrentUser();

  if (!isRoleAllowed(currentUser.role, ["super_admin"])) {
    return {
      ok: false as const,
      message: "No tienes permisos para crear usuarios.",
    };
  }

  const parsed = adminRegisterSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const payload = parsed.data;
  const result = await registerSchoolUser({
    nombres: payload.nombres,
    apellidos: payload.apellidos,
    dni: payload.dni,
    email: payload.email,
    password: payload.password,
    role: payload.role,
  });

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.message ?? "No se pudo crear el usuario.",
    };
  }

  revalidatePath("/configuracion/usuarios");

  return {
    ok: true as const,
    message: result.message ?? "Usuario creado correctamente.",
  };
}

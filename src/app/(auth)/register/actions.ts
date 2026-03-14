"use server";

import { registerSchoolUser } from "@/lib/auth/register-service";
import { createClient } from "@/lib/supabase/server";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth.schema";

export async function registerAction(values: RegisterFormValues) {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos para el registro.",
    };
  }

  const payload = parsed.data;
  const result = await registerSchoolUser({
    nombres: payload.nombres,
    apellidos: payload.apellidos,
    dni: payload.dni,
    email: payload.email,
    password: payload.password,
    role: "super_admin",
  });

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.message ?? "No se pudo completar el registro.",
    };
  }

  const supabase = await createClient();
  const signInResult = await supabase.auth.signInWithPassword({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

  if (signInResult.error) {
    return {
      ok: true as const,
      redirectTo: "/login?registered=1",
      message: "Cuenta creada. Inicia sesión para continuar.",
    };
  }

  return {
    ok: true as const,
    redirectTo: "/inicio",
  };
}

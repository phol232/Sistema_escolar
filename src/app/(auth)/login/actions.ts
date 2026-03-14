"use server";

import { loginSchema, type LoginFormValues } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(values: LoginFormValues) {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Credenciales inválidas",
    };
  }

  const supabase = await createClient();
  const { email, password } = parsed.data;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      ok: false as const,
      message: error.message,
    };
  }

  return {
    ok: true as const,
    redirectTo: "/inicio",
  };
}

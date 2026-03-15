import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/types";
import { buildFullName } from "@/lib/utils";

interface RegisterUserPayload {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  password: string;
  role: AppRole;
}

interface RegisterUserResult {
  ok: boolean;
  message?: string;
}

function normalizeDni(value: string) {
  return value.trim().toUpperCase();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function splitLastNames(apellidos: string) {
  const chunks = apellidos
    .trim()
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (chunks.length < 2) {
    return null;
  }

  return {
    apellidoPaterno: chunks[0],
    apellidoMaterno: chunks.slice(1).join(" "),
  };
}

function usernameBaseFromEmail(email: string) {
  const candidate = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 36);

  return candidate.length >= 3 ? candidate : "usuario";
}

function errorMessageFromPostgres(error: { code?: string; message?: string } | null, fallback: string) {
  if (!error) {
    return fallback;
  }

  if (error.code === "23505") {
    if (error.message?.includes("personas_dni_key")) {
      return "El DNI ya está registrado.";
    }

    if (error.message?.includes("usuarios_username_key")) {
      return "No se pudo generar un username único para este usuario.";
    }

    return "Ya existe un registro con esos datos.";
  }

  return error.message ?? fallback;
}

function errorMessageFromAuth(error: { code?: string; message?: string; status?: number } | null, fallback: string) {
  if (!error) {
    return fallback;
  }

  const normalizedCode = (error.code ?? "").toLowerCase();
  const normalizedMessage = (error.message ?? "").toLowerCase();

  if (error.status === 502 || normalizedMessage.includes("bad gateway")) {
    return "No se pudo conectar con Supabase Auth (502). Revisa NEXT_PUBLIC_SUPABASE_URL o la configuracion del proxy/dominio.";
  }
  if (normalizedCode.includes("email") && normalizedCode.includes("exists")) {
    return "El correo ya está registrado en Auth.";
  }

  if (normalizedMessage.includes("already been registered")) {
    return "El correo ya está registrado en Auth.";
  }

  return error.message ?? fallback;
}

async function deletePersona(admin: any, personaId: string | null) {
  if (!personaId) {
    return;
  }

  await admin.from("personas").delete().eq("id", personaId);
}

async function deleteAuthUser(admin: any, authUserId: string | null) {
  if (!authUserId) {
    return;
  }

  await admin.auth.admin.deleteUser(authUserId);
}

async function getRoleId(admin: any, role: AppRole) {
  const roleLookup = await admin.from("roles").select("id").eq("nombre", role).maybeSingle();

  if (roleLookup.error) {
    return {
      ok: false as const,
      message: roleLookup.error.message ?? "No se pudo validar el rol del usuario.",
    };
  }

  if (roleLookup.data?.id) {
    return {
      ok: true as const,
      roleId: roleLookup.data.id as string,
    };
  }

  const roleInsert = await admin
    .from("roles")
    .insert({
      nombre: role,
      descripcion: `Rol ${role}`,
    })
    .select("id")
    .single();

  if (roleInsert.error || !roleInsert.data?.id) {
    return {
      ok: false as const,
      message: roleInsert.error?.message ?? "No se pudo crear el rol en base de datos.",
    };
  }

  return {
    ok: true as const,
    roleId: roleInsert.data.id as string,
  };
}

async function buildUniqueUsername(admin: any, email: string) {
  const base = usernameBaseFromEmail(email);
  const existing = await admin.from("usuarios").select("username").ilike("username", `${base}%`).limit(300);

  if (existing.error) {
    return base;
  }

  const used = new Set((existing.data ?? []).map((row: { username: string }) => row.username));

  if (!used.has(base)) {
    return base;
  }

  let index = 2;
  while (used.has(`${base}_${index}`) && index < 1000) {
    index += 1;
  }

  return `${base}_${index}`;
}

export async function registerSchoolUser(payload: RegisterUserPayload): Promise<RegisterUserResult> {
  const admin = createAdminClient() as any;
  const lastNames = splitLastNames(payload.apellidos);

  if (!lastNames) {
    return {
      ok: false,
      message: "Ingresa apellido paterno y materno.",
    };
  }

  const email = normalizeEmail(payload.email);
  const dni = normalizeDni(payload.dni);
  const nombres = payload.nombres.trim();
  const fullName = `${nombres} ${payload.apellidos.trim()}`;
  const username = await buildUniqueUsername(admin, email);

  const roleResponse = await getRoleId(admin, payload.role);

  if (!roleResponse.ok) {
    return {
      ok: false,
      message: roleResponse.message,
    };
  }

  let personaId: string | null = null;
  let authUserId: string | null = null;

  const personaResponse = await admin
    .from("personas")
    .insert({
      dni,
      nombres,
      apellido_paterno: lastNames.apellidoPaterno,
      apellido_materno: lastNames.apellidoMaterno,
      email,
      estado: "activo",
    })
    .select("id")
    .single();

  if (personaResponse.error || !personaResponse.data?.id) {
    return {
      ok: false,
      message: errorMessageFromPostgres(personaResponse.error, "No se pudo guardar la persona."),
    };
  }

  personaId = personaResponse.data.id as string;

  const authResponse = await admin.auth.admin.createUser({
    email,
    password: payload.password,
    email_confirm: true,
    app_metadata: {
      role: payload.role,
    },
    user_metadata: {
      full_name: fullName,
      persona_id: personaId,
    },
  });

  if (authResponse.error || !authResponse.data.user?.id) {
    await deletePersona(admin, personaId);
    return {
      ok: false,
      message: errorMessageFromAuth(authResponse.error, "No se pudo crear el usuario en Auth."),
    };
  }

  authUserId = authResponse.data.user.id;

  const usuarioResponse = await admin.from("usuarios").insert({
    id: authUserId,
    persona_id: personaId,
    username,
    rol_id: roleResponse.roleId,
    estado: "activo",
  });

  if (usuarioResponse.error) {
    await deleteAuthUser(admin, authUserId);
    await deletePersona(admin, personaId);
    return {
      ok: false,
      message: errorMessageFromPostgres(usuarioResponse.error, "No se pudo guardar el usuario en la tabla usuarios."),
    };
  }

  const syncMetadataResponse = await admin.auth.admin.updateUserById(authUserId, {
    app_metadata: {
      role: payload.role,
    },
    user_metadata: {
      full_name: fullName,
      persona_id: personaId,
    },
  });

  if (syncMetadataResponse.error) {
    return {
      ok: true,
      message: "Usuario creado, pero no se pudo sincronizar metadata adicional en Auth.",
    };
  }

  return {
    ok: true,
  };
}

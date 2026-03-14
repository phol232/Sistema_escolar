"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { isRoleAllowed, requireCurrentUser } from "@/lib/auth";
import {
  PHASE2_ALUMNOS_TAG,
  PHASE2_APODERADOS_TAG,
  PHASE2_CONFIG_ANIOS_TAG,
  PHASE2_CONFIG_AULAS_TAG,
  PHASE2_CONFIG_NIVELES_GRADOS_TAG,
  PHASE2_DOCENTES_TAG,
  PHASE2_PERSONAS_TAG,
  PHASE2_VINCULOS_TAG,
} from "@/lib/phase2/cache-tags";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/types";
import type { ActionResult, SelectOption } from "@/lib/types/phase2";
import { buildFullName } from "@/lib/utils";
import {
  alumnoCrudSchema,
  anioEscolarCrudSchema,
  apoderadoCrudSchema,
  aulaCrudSchema,
  docenteCrudSchema,
  gradoCrudSchema,
  nivelCrudSchema,
  personaCrudSchema,
  vinculoCrudSchema,
} from "@/lib/validations/phase2.schema";

const PERSONAS_ROLES: AppRole[] = ["super_admin", "director", "subdirector", "secretaria"];
const CONFIG_ROLES: AppRole[] = ["super_admin", "director"];
const ALUMNOS_ROLES: AppRole[] = ["super_admin", "director", "subdirector", "secretaria"];
const DOCENTES_ROLES: AppRole[] = ["super_admin", "director", "subdirector"];
const APODERADOS_ROLES: AppRole[] = ["super_admin", "director", "secretaria"];

function admin(): any {
  return createAdminClient() as any;
}

async function assertAllowed(roles: readonly AppRole[]) {
  const user = await requireCurrentUser();

  if (!isRoleAllowed(user.role, roles)) {
    throw new Error("FORBIDDEN");
  }
}

function failure(message: string): ActionResult {
  return { ok: false, message };
}

function fromError(error: { code?: string; message?: string } | null, fallback: string): ActionResult {
  if (!error) {
    return { ok: true };
  }

  if (error.code === "23505") {
    return failure("Ya existe un registro con esos datos.");
  }

  if (error.code === "23503") {
    return failure("No se puede completar la operación porque hay registros relacionados.");
  }

  return failure(error.message ?? fallback);
}

function normalizeText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeDate(value?: string | null) {
  return value && value.length > 0 ? value : null;
}

function safeRevalidate(...paths: string[]) {
  paths.forEach((path) => revalidatePath(path));
}

function safeRevalidateTags(...tags: string[]) {
  tags.forEach((tag) => revalidateTag(tag, "max"));
}

function sanitizeSearchTerm(value?: string | null) {
  return (value ?? "").replace(/[,%()]/g, " ").trim();
}

export async function upsertPersonaAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(PERSONAS_ROLES);
  const parsed = personaCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const values = parsed.data;
  const record = {
    dni: values.dni,
    nombres: values.nombres,
    apellido_paterno: values.apellido_paterno,
    apellido_materno: values.apellido_materno,
    fecha_nacimiento: normalizeDate(values.fecha_nacimiento),
    sexo: values.sexo ? values.sexo : null,
    direccion: normalizeText(values.direccion),
    ubigeo: normalizeText(values.ubigeo),
    telefono: normalizeText(values.telefono),
    email: normalizeText(values.email),
    estado: values.estado,
  };

  const response = payload.id
    ? await admin().from("personas").update(record).eq("id", payload.id)
    : await admin().from("personas").insert(record);

  const result = fromError(response.error, "No se pudo guardar la persona.");

  if (result.ok) {
    safeRevalidate("/personas", "/alumnos", "/docentes", "/apoderados");
    safeRevalidateTags(PHASE2_PERSONAS_TAG, PHASE2_DOCENTES_TAG, PHASE2_ALUMNOS_TAG, PHASE2_APODERADOS_TAG, PHASE2_VINCULOS_TAG);
  }

  return result;
}

export async function deletePersonaAction(id: string): Promise<ActionResult> {
  await assertAllowed(PERSONAS_ROLES);
  const response = await admin().from("personas").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar la persona.");

  if (result.ok) {
    safeRevalidate("/personas", "/alumnos", "/docentes", "/apoderados");
    safeRevalidateTags(PHASE2_PERSONAS_TAG, PHASE2_DOCENTES_TAG, PHASE2_ALUMNOS_TAG, PHASE2_APODERADOS_TAG, PHASE2_VINCULOS_TAG);
  }

  return result;
}

export async function upsertAnioEscolarAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(CONFIG_ROLES);
  const parsed = anioEscolarCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const response = payload.id
    ? await admin().from("anios_escolares").update(parsed.data).eq("id", payload.id)
    : await admin().from("anios_escolares").insert(parsed.data);

  const result = fromError(response.error, "No se pudo guardar el año escolar.");

  if (result.ok) {
    safeRevalidate("/configuracion/anio-escolar");
    safeRevalidateTags(PHASE2_CONFIG_ANIOS_TAG);
  }

  return result;
}

export async function deleteAnioEscolarAction(id: string): Promise<ActionResult> {
  await assertAllowed(CONFIG_ROLES);
  const response = await admin().from("anios_escolares").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar el año escolar.");

  if (result.ok) {
    safeRevalidate("/configuracion/anio-escolar");
    safeRevalidateTags(PHASE2_CONFIG_ANIOS_TAG);
  }

  return result;
}

export async function upsertNivelAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(CONFIG_ROLES);
  const parsed = nivelCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const response = payload.id
    ? await admin().from("niveles").update(parsed.data).eq("id", payload.id)
    : await admin().from("niveles").insert(parsed.data);

  const result = fromError(response.error, "No se pudo guardar el nivel.");

  if (result.ok) {
    safeRevalidate("/configuracion/niveles-grados");
    safeRevalidateTags(PHASE2_CONFIG_NIVELES_GRADOS_TAG);
  }

  return result;
}

export async function deleteNivelAction(id: string): Promise<ActionResult> {
  await assertAllowed(CONFIG_ROLES);
  const response = await admin().from("niveles").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar el nivel.");

  if (result.ok) {
    safeRevalidate("/configuracion/niveles-grados");
    safeRevalidateTags(PHASE2_CONFIG_NIVELES_GRADOS_TAG);
  }

  return result;
}

export async function upsertGradoAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(CONFIG_ROLES);
  const parsed = gradoCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const response = payload.id
    ? await admin().from("grados").update(parsed.data).eq("id", payload.id)
    : await admin().from("grados").insert(parsed.data);

  const result = fromError(response.error, "No se pudo guardar el grado.");

  if (result.ok) {
    safeRevalidate("/configuracion/niveles-grados");
    safeRevalidateTags(PHASE2_CONFIG_NIVELES_GRADOS_TAG);
  }

  return result;
}

export async function deleteGradoAction(id: string): Promise<ActionResult> {
  await assertAllowed(CONFIG_ROLES);
  const response = await admin().from("grados").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar el grado.");

  if (result.ok) {
    safeRevalidate("/configuracion/niveles-grados");
    safeRevalidateTags(PHASE2_CONFIG_NIVELES_GRADOS_TAG);
  }

  return result;
}

export async function upsertAulaAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(CONFIG_ROLES);
  const parsed = aulaCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const response = payload.id
    ? await admin().from("aulas").update(parsed.data).eq("id", payload.id)
    : await admin().from("aulas").insert(parsed.data);

  const result = fromError(response.error, "No se pudo guardar el aula.");

  if (result.ok) {
    safeRevalidate("/configuracion/aulas");
    safeRevalidateTags(PHASE2_CONFIG_AULAS_TAG);
  }

  return result;
}

export async function deleteAulaAction(id: string): Promise<ActionResult> {
  await assertAllowed(CONFIG_ROLES);
  const response = await admin().from("aulas").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar el aula.");

  if (result.ok) {
    safeRevalidate("/configuracion/aulas");
    safeRevalidateTags(PHASE2_CONFIG_AULAS_TAG);
  }

  return result;
}

export async function upsertAlumnoAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(ALUMNOS_ROLES);
  const parsed = alumnoCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const values = {
    persona_id: parsed.data.persona_id,
    codigo_estudiante: parsed.data.codigo_estudiante,
    procedencia_colegio: normalizeText(parsed.data.procedencia_colegio),
    estado: parsed.data.estado,
  };

  const response = payload.id
    ? await admin().from("alumnos").update(values).eq("id", payload.id)
    : await admin().from("alumnos").insert(values);

  const result = fromError(response.error, "No se pudo guardar el alumno.");

  if (result.ok) {
    safeRevalidate("/alumnos", "/apoderados/vinculaciones");
    safeRevalidateTags(PHASE2_ALUMNOS_TAG, PHASE2_VINCULOS_TAG);
  }

  return result;
}

export async function deleteAlumnoAction(id: string): Promise<ActionResult> {
  await assertAllowed(ALUMNOS_ROLES);
  const response = await admin().from("alumnos").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar el alumno.");

  if (result.ok) {
    safeRevalidate("/alumnos", "/apoderados/vinculaciones");
    safeRevalidateTags(PHASE2_ALUMNOS_TAG, PHASE2_VINCULOS_TAG);
  }

  return result;
}

export async function searchAlumnoPersonaOptionsAction(payload?: {
  query?: string;
  includePersonaId?: string | null;
  limit?: number;
}): Promise<SelectOption[]> {
  await assertAllowed(ALUMNOS_ROLES);
  const query = sanitizeSearchTerm(payload?.query);
  const limit = Math.min(Math.max(payload?.limit ?? 60, 20), 150);

  let personasQuery = admin()
    .from("personas")
    .select("id,dni,nombres,apellido_paterno,apellido_materno")
    .order("apellido_paterno", { ascending: true })
    .order("apellido_materno", { ascending: true })
    .order("nombres", { ascending: true })
    .limit(limit * 3);

  if (query.length > 0) {
    personasQuery = personasQuery.or(
      `dni.ilike.%${query}%,nombres.ilike.%${query}%,apellido_paterno.ilike.%${query}%,apellido_materno.ilike.%${query}%`,
    );
  }

  const [personasResponse, alumnosResponse] = await Promise.all([
    personasQuery,
    admin().from("alumnos").select("persona_id"),
  ]);

  if (personasResponse.error || alumnosResponse.error) {
    return [];
  }

  const taken = new Set((alumnosResponse.data ?? []).map((item: { persona_id: string }) => item.persona_id));
  const includePersonaId = payload?.includePersonaId ?? null;

  return (personasResponse.data ?? [])
    .filter((row: any) => row.id === includePersonaId || !taken.has(row.id))
    .slice(0, limit)
    .map((row: any) => ({
      value: row.id,
      label: buildFullName(row),
      helper: row.dni,
    }));
}

export async function upsertDocenteAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(DOCENTES_ROLES);
  const parsed = docenteCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const values = {
    persona_id: parsed.data.persona_id,
    especialidad: normalizeText(parsed.data.especialidad),
    fecha_contratacion: normalizeDate(parsed.data.fecha_contratacion),
    estado: parsed.data.estado,
  };

  const response = payload.id
    ? await admin().from("docentes").update(values).eq("id", payload.id)
    : await admin().from("docentes").insert(values);

  const result = fromError(response.error, "No se pudo guardar el docente.");

  if (result.ok) {
    safeRevalidate("/docentes");
    safeRevalidateTags(PHASE2_DOCENTES_TAG);
  }

  return result;
}

export async function deleteDocenteAction(id: string): Promise<ActionResult> {
  await assertAllowed(DOCENTES_ROLES);
  const response = await admin().from("docentes").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar el docente.");

  if (result.ok) {
    safeRevalidate("/docentes");
    safeRevalidateTags(PHASE2_DOCENTES_TAG);
  }

  return result;
}

export async function searchDocentePersonaOptionsAction(payload?: {
  query?: string;
  includePersonaId?: string | null;
  limit?: number;
}): Promise<SelectOption[]> {
  await assertAllowed(DOCENTES_ROLES);
  const query = sanitizeSearchTerm(payload?.query);
  const limit = Math.min(Math.max(payload?.limit ?? 60, 20), 150);

  let personasQuery = admin()
    .from("personas")
    .select("id,dni,nombres,apellido_paterno,apellido_materno")
    .order("apellido_paterno", { ascending: true })
    .order("apellido_materno", { ascending: true })
    .order("nombres", { ascending: true })
    .limit(limit * 3);

  if (query.length > 0) {
    personasQuery = personasQuery.or(
      `dni.ilike.%${query}%,nombres.ilike.%${query}%,apellido_paterno.ilike.%${query}%,apellido_materno.ilike.%${query}%`,
    );
  }

  const [personasResponse, docentesResponse] = await Promise.all([
    personasQuery,
    admin().from("docentes").select("persona_id"),
  ]);

  if (personasResponse.error || docentesResponse.error) {
    return [];
  }

  const taken = new Set((docentesResponse.data ?? []).map((item: { persona_id: string }) => item.persona_id));
  const includePersonaId = payload?.includePersonaId ?? null;

  return (personasResponse.data ?? [])
    .filter((row: any) => row.id === includePersonaId || !taken.has(row.id))
    .slice(0, limit)
    .map((row: any) => ({
      value: row.id,
      label: buildFullName(row),
      helper: row.dni,
    }));
}

export async function upsertApoderadoAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(APODERADOS_ROLES);
  const parsed = apoderadoCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const values = {
    persona_id: parsed.data.persona_id,
    ocupacion: normalizeText(parsed.data.ocupacion),
    estado: parsed.data.estado,
  };

  const response = payload.id
    ? await admin().from("apoderados").update(values).eq("id", payload.id)
    : await admin().from("apoderados").insert(values);

  const result = fromError(response.error, "No se pudo guardar el apoderado.");

  if (result.ok) {
    safeRevalidate("/apoderados", "/apoderados/vinculaciones");
    safeRevalidateTags(PHASE2_APODERADOS_TAG, PHASE2_VINCULOS_TAG);
  }

  return result;
}

export async function deleteApoderadoAction(id: string): Promise<ActionResult> {
  await assertAllowed(APODERADOS_ROLES);
  const response = await admin().from("apoderados").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar el apoderado.");

  if (result.ok) {
    safeRevalidate("/apoderados", "/apoderados/vinculaciones");
    safeRevalidateTags(PHASE2_APODERADOS_TAG, PHASE2_VINCULOS_TAG);
  }

  return result;
}

export async function searchApoderadoPersonaOptionsAction(payload?: {
  query?: string;
  includePersonaId?: string | null;
  limit?: number;
}): Promise<SelectOption[]> {
  await assertAllowed(APODERADOS_ROLES);
  const query = sanitizeSearchTerm(payload?.query);
  const limit = Math.min(Math.max(payload?.limit ?? 60, 20), 150);

  let personasQuery = admin()
    .from("personas")
    .select("id,dni,nombres,apellido_paterno,apellido_materno")
    .order("apellido_paterno", { ascending: true })
    .order("apellido_materno", { ascending: true })
    .order("nombres", { ascending: true })
    .limit(limit * 3);

  if (query.length > 0) {
    personasQuery = personasQuery.or(
      `dni.ilike.%${query}%,nombres.ilike.%${query}%,apellido_paterno.ilike.%${query}%,apellido_materno.ilike.%${query}%`,
    );
  }

  const [personasResponse, apoderadosResponse] = await Promise.all([
    personasQuery,
    admin().from("apoderados").select("persona_id"),
  ]);

  if (personasResponse.error || apoderadosResponse.error) {
    return [];
  }

  const taken = new Set((apoderadosResponse.data ?? []).map((item: { persona_id: string }) => item.persona_id));
  const includePersonaId = payload?.includePersonaId ?? null;

  return (personasResponse.data ?? [])
    .filter((row: any) => row.id === includePersonaId || !taken.has(row.id))
    .slice(0, limit)
    .map((row: any) => ({
      value: row.id,
      label: buildFullName(row),
      helper: row.dni,
    }));
}

export async function upsertVinculoAction(payload: { id?: string | null; values: unknown }): Promise<ActionResult> {
  await assertAllowed(APODERADOS_ROLES);
  const parsed = vinculoCrudSchema.safeParse(payload.values);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const values = parsed.data;
  const response = payload.id
    ? await admin().from("alumno_apoderado").update(values).eq("id", payload.id)
    : await admin().from("alumno_apoderado").insert(values);

  const result = fromError(response.error, "No se pudo guardar la vinculación.");

  if (result.ok) {
    safeRevalidate("/apoderados/vinculaciones");
    safeRevalidateTags(PHASE2_VINCULOS_TAG);
  }

  return result;
}

export async function deleteVinculoAction(id: string): Promise<ActionResult> {
  await assertAllowed(APODERADOS_ROLES);
  const response = await admin().from("alumno_apoderado").delete().eq("id", id);
  const result = fromError(response.error, "No se pudo eliminar la vinculación.");

  if (result.ok) {
    safeRevalidate("/apoderados/vinculaciones");
    safeRevalidateTags(PHASE2_VINCULOS_TAG);
  }

  return result;
}

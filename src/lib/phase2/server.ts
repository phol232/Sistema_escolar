import "server-only";

import { unstable_cache } from "next/cache";

import { isRoleAllowed, requireCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AlumnosPageData,
  AniosPageData,
  ApoderadosPageData,
  AulasPageData,
  DocentesPageData,
  NivelesGradosPageData,
  PaginationMeta,
  PersonaRecord,
  PersonasPageData,
  SelectOption,
  VinculosPageData,
} from "@/lib/types/phase2";
import { buildFullName } from "@/lib/utils";

import type { AppRole } from "../types";
import {
  PHASE2_ALUMNOS_TAG,
  PHASE2_APODERADOS_TAG,
  PHASE2_CONFIG_ANIOS_TAG,
  PHASE2_CONFIG_AULAS_TAG,
  PHASE2_CONFIG_NIVELES_GRADOS_TAG,
  PHASE2_DOCENTES_TAG,
  PHASE2_PERSONAS_TAG,
  PHASE2_VINCULOS_TAG,
} from "./cache-tags";

const PERSONAS_ROLES: AppRole[] = ["super_admin", "director", "subdirector", "secretaria"];
const CONFIG_ROLES: AppRole[] = ["super_admin", "director"];
const ALUMNOS_ROLES: AppRole[] = ["super_admin", "director", "subdirector", "secretaria"];
const DOCENTES_ROLES: AppRole[] = ["super_admin", "director", "subdirector"];
const APODERADOS_ROLES: AppRole[] = ["super_admin", "director", "secretaria"];
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

async function assertAllowed(roles: readonly AppRole[]) {
  const user = await requireCurrentUser();

  if (!isRoleAllowed(user.role, roles)) {
    throw new Error("FORBIDDEN");
  }
}

function admin(): any {
  return createAdminClient() as any;
}

function mapPersonaRows(rows: any[]): PersonaRecord[] {
  return rows.map((row) => ({
    id: row.id,
    dni: row.dni,
    nombres: row.nombres,
    apellido_paterno: row.apellido_paterno,
    apellido_materno: row.apellido_materno,
    fecha_nacimiento: row.fecha_nacimiento ?? null,
    sexo: row.sexo ?? null,
    direccion: row.direccion ?? null,
    ubigeo: row.ubigeo ?? null,
    telefono: row.telefono ?? null,
    email: row.email ?? null,
    estado: row.estado,
    nombre_completo: buildFullName(row),
  }));
}

function normalizePage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function normalizePageSize(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.floor(value), MAX_PAGE_SIZE);
}

function buildPagination(total: number, page: number, pageSize: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    page,
    pageSize,
    total,
    totalPages,
  };
}

const getPersonasPageRowsCached = unstable_cache(
  async (page: number, pageSize: number) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await admin()
      .from("personas")
      .select("id,dni,nombres,apellido_paterno,apellido_materno,fecha_nacimiento,sexo,direccion,ubigeo,telefono,email,estado", {
        count: "planned",
      })
      .order("apellido_paterno", { ascending: true })
      .order("apellido_materno", { ascending: true })
      .order("nombres", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return {
      personas: mapPersonaRows(data ?? []),
      total: count ?? 0,
    };
  },
  ["phase2-personas-page"],
  {
    revalidate: 60,
    tags: [PHASE2_PERSONAS_TAG],
  },
);

const getDocentesPageRowsCached = unstable_cache(
  async (page: number, pageSize: number) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await admin()
      .from("docentes")
      .select("id,persona_id,especialidad,fecha_contratacion,estado,personas!inner(id,dni,nombres,apellido_paterno,apellido_materno)", {
        count: "planned",
      })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const docentes = (data ?? []).map((row: any) => {
      const persona = row.personas;

      return {
        id: row.id,
        persona_id: row.persona_id,
        persona_nombre: persona ? buildFullName(persona) : "Persona",
        dni: persona?.dni ?? "",
        especialidad: row.especialidad ?? null,
        fecha_contratacion: row.fecha_contratacion ?? null,
        estado: row.estado,
      };
    });

    return {
      docentes,
      total: count ?? 0,
    };
  },
  ["phase2-docentes-page"],
  {
    revalidate: 60,
    tags: [PHASE2_DOCENTES_TAG],
  },
);

const getAlumnosPageRowsCached = unstable_cache(
  async (page: number, pageSize: number) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await admin()
      .from("alumnos")
      .select("id,persona_id,codigo_estudiante,procedencia_colegio,estado,personas!inner(id,dni,nombres,apellido_paterno,apellido_materno)", {
        count: "planned",
      })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const alumnos = (data ?? []).map((row: any) => {
      const persona = row.personas;

      return {
        id: row.id,
        persona_id: row.persona_id,
        persona_nombre: persona ? buildFullName(persona) : "Persona",
        dni: persona?.dni ?? "",
        codigo_estudiante: row.codigo_estudiante,
        procedencia_colegio: row.procedencia_colegio ?? null,
        estado: row.estado,
      };
    });

    return {
      alumnos,
      total: count ?? 0,
    };
  },
  ["phase2-alumnos-page"],
  {
    revalidate: 60,
    tags: [PHASE2_ALUMNOS_TAG],
  },
);

const getApoderadosPageRowsCached = unstable_cache(
  async (page: number, pageSize: number) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await admin()
      .from("apoderados")
      .select("id,persona_id,ocupacion,estado,personas!inner(id,dni,nombres,apellido_paterno,apellido_materno)", {
        count: "planned",
      })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const apoderados = (data ?? []).map((row: any) => {
      const persona = row.personas;

      return {
        id: row.id,
        persona_id: row.persona_id,
        persona_nombre: persona ? buildFullName(persona) : "Persona",
        dni: persona?.dni ?? "",
        ocupacion: row.ocupacion ?? null,
        estado: row.estado,
      };
    });

    return {
      apoderados,
      total: count ?? 0,
    };
  },
  ["phase2-apoderados-page"],
  {
    revalidate: 60,
    tags: [PHASE2_APODERADOS_TAG],
  },
);

const getAlumnosOptionsCached = unstable_cache(
  async (): Promise<SelectOption[]> => {
    const { data, error } = await admin()
      .from("alumnos")
      .select("id,codigo_estudiante,personas!inner(nombres,apellido_paterno,apellido_materno)")
      .order("id", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row: any) => ({
      value: row.id,
      label: row.personas ? buildFullName(row.personas) : "Alumno",
      helper: row.codigo_estudiante ?? "",
    }));
  },
  ["phase2-alumnos-options"],
  {
    revalidate: 60,
    tags: [PHASE2_ALUMNOS_TAG],
  },
);

const getApoderadosOptionsCached = unstable_cache(
  async (): Promise<SelectOption[]> => {
    const { data, error } = await admin()
      .from("apoderados")
      .select("id,personas!inner(dni,nombres,apellido_paterno,apellido_materno)")
      .order("id", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row: any) => ({
      value: row.id,
      label: row.personas ? buildFullName(row.personas) : "Apoderado",
      helper: row.personas?.dni ?? "",
    }));
  },
  ["phase2-apoderados-options"],
  {
    revalidate: 60,
    tags: [PHASE2_APODERADOS_TAG],
  },
);

const getVinculosRowsCached = unstable_cache(
  async () => {
    const { data, error } = await admin().from("alumno_apoderado").select("id,alumno_id,apoderado_id,parentesco,es_principal");

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
  ["phase2-vinculos-rows"],
  {
    revalidate: 60,
    tags: [PHASE2_VINCULOS_TAG],
  },
);

const getAniosRowsCached = unstable_cache(
  async () => {
    const { data, error } = await admin()
      .from("anios_escolares")
      .select("id,anio,fecha_inicio,fecha_fin,activo")
      .order("anio", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
  ["phase2-config-anios"],
  {
    revalidate: 60,
    tags: [PHASE2_CONFIG_ANIOS_TAG],
  },
);

const getNivelesGradosRowsCached = unstable_cache(
  async () => {
    const [nivelesResponse, gradosResponse] = await Promise.all([
      admin().from("niveles").select("id,codigo,nombre,estado").order("nombre", { ascending: true }),
      admin().from("grados").select("id,nivel_id,nombre,orden,estado").order("orden", { ascending: true }),
    ]);

    if (nivelesResponse.error) {
      throw new Error(nivelesResponse.error.message);
    }

    if (gradosResponse.error) {
      throw new Error(gradosResponse.error.message);
    }

    return {
      niveles: nivelesResponse.data ?? [],
      grados: gradosResponse.data ?? [],
    };
  },
  ["phase2-config-niveles-grados"],
  {
    revalidate: 60,
    tags: [PHASE2_CONFIG_NIVELES_GRADOS_TAG],
  },
);

const getAulasRowsCached = unstable_cache(
  async () => {
    const { data, error } = await admin().from("aulas").select("id,nombre,capacidad").order("nombre", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
  ["phase2-config-aulas"],
  {
    revalidate: 60,
    tags: [PHASE2_CONFIG_AULAS_TAG],
  },
);

export async function getPersonasPageData(params?: { page?: number; pageSize?: number }): Promise<PersonasPageData> {
  await assertAllowed(PERSONAS_ROLES);
  const page = normalizePage(params?.page);
  const pageSize = normalizePageSize(params?.pageSize);
  const { personas, total } = await getPersonasPageRowsCached(page, pageSize);

  return {
    personas,
    pagination: buildPagination(total, page, pageSize),
  };
}

export async function getAniosPageData(): Promise<AniosPageData> {
  await assertAllowed(CONFIG_ROLES);
  const anios = await getAniosRowsCached();
  return { anios };
}

export async function getNivelesGradosPageData(): Promise<NivelesGradosPageData> {
  await assertAllowed(CONFIG_ROLES);
  const { niveles, grados: gradosRows } = await getNivelesGradosRowsCached();
  const nivelMap = new Map(niveles.map((nivel: any) => [nivel.id, nivel.nombre]));
  const grados = gradosRows.map((grado: any) => ({
    ...grado,
    nivel_nombre: nivelMap.get(grado.nivel_id) ?? "Nivel",
  }));

  return {
    niveles,
    grados,
    nivelOptions: niveles.map((nivel: any) => ({ value: nivel.id, label: nivel.nombre, helper: nivel.codigo })),
  };
}

export async function getAulasPageData(): Promise<AulasPageData> {
  await assertAllowed(CONFIG_ROLES);
  const aulas = await getAulasRowsCached();
  return { aulas };
}

export async function getAlumnosPageData(params?: { page?: number; pageSize?: number }): Promise<AlumnosPageData> {
  await assertAllowed(ALUMNOS_ROLES);
  const page = normalizePage(params?.page);
  const pageSize = normalizePageSize(params?.pageSize);
  const { alumnos, total } = await getAlumnosPageRowsCached(page, pageSize);

  return {
    alumnos,
    pagination: buildPagination(total, page, pageSize),
  };
}

export async function getDocentesPageData(params?: { page?: number; pageSize?: number }): Promise<DocentesPageData> {
  await assertAllowed(DOCENTES_ROLES);
  const page = normalizePage(params?.page);
  const pageSize = normalizePageSize(params?.pageSize);
  const { docentes, total } = await getDocentesPageRowsCached(page, pageSize);

  return {
    docentes,
    pagination: buildPagination(total, page, pageSize),
  };
}

export async function getApoderadosPageData(params?: { page?: number; pageSize?: number }): Promise<ApoderadosPageData> {
  await assertAllowed(APODERADOS_ROLES);
  const page = normalizePage(params?.page);
  const pageSize = normalizePageSize(params?.pageSize);
  const { apoderados, total } = await getApoderadosPageRowsCached(page, pageSize);

  return {
    apoderados,
    pagination: buildPagination(total, page, pageSize),
  };
}

export async function getVinculosPageData(): Promise<VinculosPageData> {
  await assertAllowed(APODERADOS_ROLES);
  const [alumnoOptions, apoderadoOptions, vinculosRows] = await Promise.all([
    getAlumnosOptionsCached(),
    getApoderadosOptionsCached(),
    getVinculosRowsCached(),
  ]);

  const alumnoMap = new Map(alumnoOptions.map((item) => [item.value, item.label]));
  const apoderadoMap = new Map(apoderadoOptions.map((item) => [item.value, item.label]));

  const vinculos = vinculosRows.map((row: any) => ({
    id: row.id,
    alumno_id: row.alumno_id,
    alumno_nombre: alumnoMap.get(row.alumno_id) ?? "Alumno",
    apoderado_id: row.apoderado_id,
    apoderado_nombre: apoderadoMap.get(row.apoderado_id) ?? "Apoderado",
    parentesco: row.parentesco,
    es_principal: row.es_principal,
  }));

  return {
    vinculos,
    alumnoOptions,
    apoderadoOptions,
  };
}

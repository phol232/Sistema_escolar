import type { Database } from "@/lib/types/database";

export type EstadoGeneral = Database["public"]["Enums"]["estado_general"];
export type SexoTipo = Database["public"]["Enums"]["sexo_tipo"];
export type ParentescoTipo = Database["public"]["Enums"]["parentesco_tipo"];

export interface SelectOption {
  value: string;
  label: string;
  helper?: string;
}

export interface PersonaRecord {
  id: string;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string | null;
  sexo: SexoTipo | null;
  direccion: string | null;
  ubigeo: string | null;
  telefono: string | null;
  email: string | null;
  estado: EstadoGeneral;
  nombre_completo: string;
}

export interface AnioEscolarRecord {
  id: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface NivelRecord {
  id: string;
  codigo: string;
  nombre: string;
  estado: EstadoGeneral;
}

export interface GradoRecord {
  id: string;
  nivel_id: string;
  nivel_nombre: string;
  nombre: string;
  orden: number;
  estado: EstadoGeneral;
}

export interface AulaRecord {
  id: string;
  nombre: string;
  capacidad: number;
}

export interface AlumnoRecord {
  id: string;
  persona_id: string;
  persona_nombre: string;
  dni: string;
  codigo_estudiante: string;
  procedencia_colegio: string | null;
  estado: EstadoGeneral;
}

export interface DocenteRecord {
  id: string;
  persona_id: string;
  persona_nombre: string;
  dni: string;
  especialidad: string | null;
  fecha_contratacion: string | null;
  estado: EstadoGeneral;
}

export interface ApoderadoRecord {
  id: string;
  persona_id: string;
  persona_nombre: string;
  dni: string;
  ocupacion: string | null;
  estado: EstadoGeneral;
}

export interface VinculoRecord {
  id: string;
  alumno_id: string;
  alumno_nombre: string;
  apoderado_id: string;
  apoderado_nombre: string;
  parentesco: ParentescoTipo;
  es_principal: boolean;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PersonasPageData {
  personas: PersonaRecord[];
  pagination: PaginationMeta;
}

export interface AniosPageData {
  anios: AnioEscolarRecord[];
}

export interface NivelesGradosPageData {
  niveles: NivelRecord[];
  grados: GradoRecord[];
  nivelOptions: SelectOption[];
}

export interface AulasPageData {
  aulas: AulaRecord[];
}

export interface AlumnosPageData {
  alumnos: AlumnoRecord[];
  pagination: PaginationMeta;
}

export interface DocentesPageData {
  docentes: DocenteRecord[];
  pagination: PaginationMeta;
}

export interface ApoderadosPageData {
  apoderados: ApoderadoRecord[];
  pagination: PaginationMeta;
}

export interface VinculosPageData {
  vinculos: VinculoRecord[];
  alumnoOptions: SelectOption[];
  apoderadoOptions: SelectOption[];
}

export interface ActionResult {
  ok: boolean;
  message?: string;
}

import { z } from "zod";

import { personaBaseSchema } from "@/lib/validations/shared.schema";

export const estadoGeneralSchema = z.enum(["activo", "inactivo"]);

export const personaCrudSchema = personaBaseSchema.extend({
  estado: estadoGeneralSchema.default("activo"),
});

export const anioEscolarCrudSchema = z
  .object({
    anio: z.coerce.number().int().min(2020).max(2100),
    fecha_inicio: z.string().date(),
    fecha_fin: z.string().date(),
    activo: z.boolean().default(false),
  })
  .refine((values) => values.fecha_fin > values.fecha_inicio, {
    message: "La fecha fin debe ser posterior a la fecha de inicio",
    path: ["fecha_fin"],
  });

export const nivelCrudSchema = z.object({
  codigo: z.string().trim().min(2).max(3),
  nombre: z.string().trim().min(2).max(50),
  estado: estadoGeneralSchema.default("activo"),
});

export const gradoCrudSchema = z.object({
  nivel_id: z.string().uuid(),
  nombre: z.string().trim().min(2).max(50),
  orden: z.coerce.number().int().min(1).max(20),
  estado: estadoGeneralSchema.default("activo"),
});

export const aulaCrudSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  capacidad: z.coerce.number().int().min(1).max(1000),
});

export const alumnoCrudSchema = z.object({
  persona_id: z.string().uuid(),
  codigo_estudiante: z.string().trim().min(1).max(14),
  procedencia_colegio: z.string().trim().max(150).optional().or(z.literal("")),
  estado: estadoGeneralSchema.default("activo"),
});

export const docenteCrudSchema = z.object({
  persona_id: z.string().uuid(),
  especialidad: z.string().trim().max(120).optional().or(z.literal("")),
  fecha_contratacion: z.string().date().optional().or(z.literal("")),
  estado: estadoGeneralSchema.default("activo"),
});

export const apoderadoCrudSchema = z.object({
  persona_id: z.string().uuid(),
  ocupacion: z.string().trim().max(120).optional().or(z.literal("")),
  estado: estadoGeneralSchema.default("activo"),
});

export const vinculoCrudSchema = z.object({
  alumno_id: z.string().uuid(),
  apoderado_id: z.string().uuid(),
  parentesco: z.enum(["padre", "madre", "abuelo", "abuela", "tio", "tia", "hermano", "hermana", "apoderado_legal", "otro"]),
  es_principal: z.boolean().default(false),
});

export type PersonaCrudValues = z.infer<typeof personaCrudSchema>;
export type AnioEscolarCrudValues = z.infer<typeof anioEscolarCrudSchema>;
export type NivelCrudValues = z.infer<typeof nivelCrudSchema>;
export type GradoCrudValues = z.infer<typeof gradoCrudSchema>;
export type AulaCrudValues = z.infer<typeof aulaCrudSchema>;
export type AlumnoCrudValues = z.infer<typeof alumnoCrudSchema>;
export type DocenteCrudValues = z.infer<typeof docenteCrudSchema>;
export type ApoderadoCrudValues = z.infer<typeof apoderadoCrudSchema>;
export type VinculoCrudValues = z.infer<typeof vinculoCrudSchema>;

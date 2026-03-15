import { z } from "zod";

import { personaBaseSchema } from "@/lib/validations/shared.schema";

export const estadoGeneralSchema = z.enum(["activo", "inactivo"]);

export const personaCrudSchema = personaBaseSchema.extend({
  estado: estadoGeneralSchema.default("activo"),
});

export const anioEscolarCrudSchema = z
  .object({
    anio: z.coerce.number().int().min(2020, "El año debe ser mayor o igual a 2020").max(2100, "El año no puede superar 2100"),
    fecha_inicio: z.string().date("Fecha de inicio inválida"),
    fecha_fin: z.string().date("Fecha fin inválida"),
    activo: z.boolean().default(false),
  })
  .refine((values) => values.fecha_fin > values.fecha_inicio, {
    message: "La fecha fin debe ser posterior a la fecha de inicio",
    path: ["fecha_fin"],
  });

export const nivelCrudSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres (ej: PRI)")
    .max(3, "El código debe tener máximo 3 caracteres (ej: PRI)")
    .regex(/^[A-Za-z0-9]+$/, "El código solo admite letras y números")
    .transform((value) => value.toUpperCase()),
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder 50 caracteres"),
  estado: estadoGeneralSchema.default("activo"),
});

export const gradoCrudSchema = z.object({
  nivel_id: z.string().uuid("Selecciona un nivel válido"),
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder 50 caracteres"),
  orden: z.coerce.number().int().min(1, "El orden mínimo es 1").max(20, "El orden máximo es 20"),
  estado: estadoGeneralSchema.default("activo"),
});

export const aulaCrudSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(80, "El nombre no puede exceder 80 caracteres"),
  capacidad: z.coerce.number().int().min(1, "La capacidad mínima es 1").max(1000, "La capacidad máxima es 1000"),
});

export const alumnoCrudSchema = z.object({
  persona_id: z.string().uuid("Selecciona una persona válida"),
  codigo_estudiante: z.string().trim().min(1, "Ingresa el código del estudiante").max(14, "El código no puede exceder 14 caracteres"),
  procedencia_colegio: z.string().trim().max(150, "La procedencia no puede exceder 150 caracteres").optional().or(z.literal("")),
  estado: estadoGeneralSchema.default("activo"),
});

export const docenteCrudSchema = z.object({
  persona_id: z.string().uuid("Selecciona una persona válida"),
  especialidad: z.string().trim().max(120, "La especialidad no puede exceder 120 caracteres").optional().or(z.literal("")),
  fecha_contratacion: z.string().date("Fecha de contratación inválida").optional().or(z.literal("")),
  estado: estadoGeneralSchema.default("activo"),
});

export const apoderadoCrudSchema = z.object({
  persona_id: z.string().uuid("Selecciona una persona válida"),
  ocupacion: z.string().trim().max(120, "La ocupación no puede exceder 120 caracteres").optional().or(z.literal("")),
  estado: estadoGeneralSchema.default("activo"),
});

export const vinculoCrudSchema = z.object({
  alumno_id: z.string().uuid("Selecciona un alumno válido"),
  apoderado_id: z.string().uuid("Selecciona un apoderado válido"),
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

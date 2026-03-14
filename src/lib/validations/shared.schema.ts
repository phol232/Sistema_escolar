import { z } from "zod";

export const dniSchema = z
  .string()
  .trim()
  .regex(/^[0-9A-Z]{8,15}$/, "DNI o CE inválido");

export const optionalEmailSchema = z
  .string()
  .trim()
  .email("Correo inválido")
  .optional()
  .or(z.literal(""));

export const phoneSchema = z
  .string()
  .trim()
  .max(20, "El teléfono no puede superar 20 caracteres")
  .optional()
  .or(z.literal(""));

export const personaBaseSchema = z.object({
  dni: dniSchema,
  nombres: z.string().trim().min(2).max(120),
  apellido_paterno: z.string().trim().min(2).max(80),
  apellido_materno: z.string().trim().min(2).max(80),
  fecha_nacimiento: z.string().date().optional().or(z.literal("")),
  sexo: z.enum(["M", "F"]).optional().or(z.literal("")),
  direccion: z.string().trim().max(250).optional().or(z.literal("")),
  ubigeo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Ubigeo inválido")
    .optional()
    .or(z.literal("")),
  telefono: phoneSchema,
  email: optionalEmailSchema,
});

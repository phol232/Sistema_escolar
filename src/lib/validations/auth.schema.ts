import { z } from "zod";

import { dniSchema } from "@/lib/validations/shared.schema";

const appRoleSchema = z.enum([
  "super_admin",
  "director",
  "subdirector",
  "secretaria",
  "tesoreria",
  "docente",
  "tutor",
  "apoderado",
]);

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede superar 72 caracteres");

export const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: passwordSchema,
  rememberSession: z.boolean(),
});

export const recoverySchema = z.object({
  email: z.string().trim().email("Correo inválido"),
});

const registerBaseSchema = z.object({
  nombres: z.string().trim().min(2, "Ingresa tus nombres").max(120, "Máximo 120 caracteres"),
  apellidos: z
    .string()
    .trim()
    .min(3, "Ingresa tus apellidos")
    .max(160, "Máximo 160 caracteres")
    .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Ingresa apellido paterno y materno",
    }),
  dni: dniSchema,
  email: z.string().trim().email("Correo inválido"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Confirma la contraseña"),
});

export const registerSchema = registerBaseSchema.refine((values) => values.password === values.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const adminRegisterSchema = registerSchema.extend({
  role: appRoleSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RecoveryFormValues = z.infer<typeof recoverySchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type AdminRegisterFormValues = z.infer<typeof adminRegisterSchema>;

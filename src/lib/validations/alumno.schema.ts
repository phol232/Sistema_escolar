import { z } from "zod";

import { personaBaseSchema } from "@/lib/validations/shared.schema";

export const alumnoSchema = personaBaseSchema.extend({
  codigo_estudiante: z.string().trim().min(1).max(14),
  procedencia_colegio: z.string().trim().max(150).optional().or(z.literal("")),
});

export type AlumnoFormValues = z.infer<typeof alumnoSchema>;

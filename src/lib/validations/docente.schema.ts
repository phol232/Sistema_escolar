import { personaBaseSchema } from "@/lib/validations/shared.schema";
import { z } from "zod";

export const docenteSchema = personaBaseSchema.extend({
  especialidad: z.string().trim().max(120).optional().or(z.literal("")),
  fecha_contratacion: z.string().date().optional().or(z.literal("")),
});

export type DocenteFormValues = z.infer<typeof docenteSchema>;

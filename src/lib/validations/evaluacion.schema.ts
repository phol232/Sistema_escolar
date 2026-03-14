import { z } from "zod";

export const evaluacionSchema = z.object({
  bimestre_id: z.string().uuid(),
  curso_id: z.string().uuid(),
  seccion_id: z.string().uuid(),
  nombre: z.string().trim().min(3).max(120),
  peso: z.coerce.number().positive(),
  fecha_evaluacion: z.string().date(),
});

export type EvaluacionFormValues = z.infer<typeof evaluacionSchema>;

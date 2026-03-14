import { z } from "zod";

export const pensionConceptoSchema = z.object({
  concepto: z.string().trim().min(3).max(120),
  monto: z.coerce.number().nonnegative(),
  fecha_vencimiento: z.string().date(),
});

export const matriculaSchema = z.object({
  alumno_id: z.string().uuid(),
  anio_escolar_id: z.string().uuid(),
  seccion_id: z.string().uuid(),
  conceptos: z.array(pensionConceptoSchema).min(1),
});

export type MatriculaFormValues = z.infer<typeof matriculaSchema>;

import { z } from "zod";

export const pagoSchema = z.object({
  pension_id: z.string().uuid(),
  monto: z.coerce.number().positive(),
  metodo_pago: z.enum(["efectivo", "transferencia", "yape", "plin", "tarjeta"]),
});

export type PagoFormValues = z.infer<typeof pagoSchema>;

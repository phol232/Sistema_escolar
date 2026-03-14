import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { pagoSchema } from "@/lib/validations/pago.schema";

export async function POST(request: Request) {
  const user = await requireCurrentUser();

  if (!["super_admin", "director", "tesoreria"].includes(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = pagoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("registrar_pago" as never, {
    p_pension_id: parsed.data.pension_id,
    p_monto: parsed.data.monto,
    p_metodo_pago: parsed.data.metodo_pago,
  } as never);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ pagoId: data }, { status: 201 });
}

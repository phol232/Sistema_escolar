import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { matriculaSchema } from "@/lib/validations/matricula.schema";

export async function POST(request: Request) {
  const user = await requireCurrentUser();

  if (!["super_admin", "director", "secretaria"].includes(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = matriculaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("crear_matricula" as never, {
    p_alumno_id: parsed.data.alumno_id,
    p_anio_escolar_id: parsed.data.anio_escolar_id,
    p_seccion_id: parsed.data.seccion_id,
    p_conceptos: parsed.data.conceptos,
  } as never);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ matriculaId: data }, { status: 201 });
}

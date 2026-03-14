import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await requireCurrentUser();
  const { searchParams } = new URL(request.url);

  return NextResponse.json({
    message: "Base de reportes creada. Pendiente implementar PDF/Excel.",
    requestedBy: user.id,
    tipo: searchParams.get("tipo") ?? "general",
  });
}

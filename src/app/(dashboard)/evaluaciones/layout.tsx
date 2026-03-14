import { redirect } from "next/navigation";

import { isRoleAllowed, requireCurrentUser } from "@/lib/auth";
import { ROLE_GUARDS } from "@/lib/constants";

export default async function EvaluacionesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireCurrentUser();

  if (!isRoleAllowed(user.role, ROLE_GUARDS.evaluaciones)) {
    redirect("/inicio");
  }

  return children;
}

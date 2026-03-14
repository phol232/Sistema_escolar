import { redirect } from "next/navigation";
import { BadgeCheck, BookOpenCheck, CalendarCheck2, CreditCard, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/inicio");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(55,111,255,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(17,24,39,0.08),transparent_24%)]" />
      <section className="relative grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="surface-card hidden h-full min-h-[680px] w-full overflow-hidden p-7 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Plataforma escolar
              </span>
              <div className="space-y-2">
                <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-balance">
                  Clases, asistencia y pagos en un solo lugar.
                </h1>
                <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                  Cada usuario entra a su espacio y encuentra solo lo que necesita para el día a día.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-primary/10 bg-primary/[0.04]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BookOpenCheck className="h-4 w-4 text-primary" />
                    Información escolar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>Notas, cursos, asistencia y avisos.</p>
                  <p className="font-medium text-foreground">Simple y ordenado.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Acceso por perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>Alumno, familia, docente o personal.</p>
                  <p className="font-medium text-foreground">Cada uno ve su panel.</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <Users className="h-5 w-5 text-primary" />
                <p className="mt-3 text-xl font-semibold">Usuarios</p>
                <p className="mt-1 text-sm text-muted-foreground">Cada perfil tiene su vista.</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <CalendarCheck2 className="h-5 w-5 text-primary" />
                <p className="mt-3 text-xl font-semibold">Asistencia</p>
                <p className="mt-1 text-sm text-muted-foreground">Registro diario de clases.</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <p className="mt-3 text-xl font-semibold">Pagos</p>
                <p className="mt-1 text-sm text-muted-foreground">Consulta rápida de pensiones.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="text-sm font-semibold text-foreground">Aquí puedes ver</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                  Datos y avances del alumno
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                  Asistencia y cursos
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                  Pagos y avisos
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/[0.05] p-5">
              <p className="text-sm font-semibold text-foreground">Ingreso rápido</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Entra con tu cuenta y continúa desde tu panel.
              </p>
            </div>
          </div>
        </div>
        <div className="flex h-full min-h-[680px] w-full items-stretch justify-center lg:justify-stretch">{children}</div>
      </section>
    </main>
  );
}

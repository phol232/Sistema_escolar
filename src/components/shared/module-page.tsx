import { CheckCircle2, Clock4, Wrench } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ModulePageProps {
  title: string;
  description: string;
  actionLabel?: string;
  highlights?: string[];
}

export function ModulePage({ title, description, actionLabel, highlights = [] }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <PageHeader actionLabel={actionLabel} description={description} title={title} />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Detalles del módulo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              Base del módulo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ruta creada y lista para conectarse a Server Components, formularios con Zod y mutaciones server-side.
            </p>
            {highlights.length > 0 ? (
              <ul className="space-y-2">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>

        {/* Estado pendiente */}
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/80 bg-amber-50/80">
            <Clock4 className="h-6 w-6 text-amber-500" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold">En desarrollo</p>
            <p className="max-w-[200px] text-xs text-muted-foreground">
              Aquí irán las tablas, acciones y vistas del módulo cuando se implementen.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Próximamente
          </span>
        </div>
      </div>
    </div>
  );
}

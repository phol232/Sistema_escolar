import { Banknote, CalendarCheck2, CheckCircle2, Circle, TrendingUp, Users2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const metrics = [
  {
    label: "Alumnos activos",
    value: "1,284",
    hint: "Matrículas vigentes del año escolar",
    icon: Users2,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    accentColor: "from-blue-500/20",
    trend: "+12 este mes",
    trendPositive: true,
  },
  {
    label: "Asistencia hoy",
    value: "94.8%",
    hint: "Registro consolidado por sección",
    icon: CalendarCheck2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    accentColor: "from-emerald-500/20",
    trend: "+2.1% vs ayer",
    trendPositive: true,
  },
  {
    label: "Pagos del mes",
    value: "S/ 184,250",
    hint: "Cobranza acumulada en pensiones",
    icon: Banknote,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    accentColor: "from-violet-500/20",
    trend: "S/ 15,750 pendiente",
    trendPositive: false,
  },
];

const nextSteps = [
  "Conectar el dashboard a consultas server-side sobre Supabase para métricas reales.",
  "Agregar widgets en tiempo real solo para asistencia y pagos, como define la arquitectura.",
  "Montar tablas y formularios por módulo usando los schemas de Zod ya creados.",
];

const baseReady = [
  "Auth con Supabase, middleware, App Router y shell del dashboard preparados.",
  "Gestión completa de personas, alumnos, docentes, apoderados y configuración.",
  "Estructura de rutas e inicialización de utilidades para los módulos principales.",
];

export default function InicioPage() {
  return (
    <div className="space-y-6">
      {/* ── Bienvenida ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Panel de control</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Resumen del sistema escolar · Año 2025</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Sistema activo
        </span>
      </div>

      {/* ── Métricas ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="relative overflow-hidden">
              {/* Gradiente decorativo de fondo */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-60",
                  metric.accentColor,
                )}
              />
              <CardContent className="relative p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.hint}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      metric.iconBg,
                    )}
                  >
                    <Icon className={cn("h-5 w-5", metric.iconColor)} />
                  </div>
                </div>
                <div className="mt-4 border-t border-border/60 pt-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      metric.trendPositive ? "text-emerald-600" : "text-amber-600",
                    )}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {metric.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Sección inferior ── */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Próximos pasos de implementación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {nextSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Base lista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {baseReady.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-emerald-200/70 bg-emerald-50/50 px-3 py-2.5"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 opacity-60">
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Módulos académicos y tesorería pendientes.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

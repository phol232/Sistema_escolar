import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "activo" | "inactivo" | "pendiente" | "pagado" | "vencido" | "pagado_parcial";
}

const STATUS_STYLES: Record<StatusBadgeProps["status"], string> = {
  activo: "bg-emerald-100 text-emerald-700",
  inactivo: "bg-slate-100 text-slate-700",
  pendiente: "bg-amber-100 text-amber-700",
  pagado: "bg-emerald-100 text-emerald-700",
  vencido: "bg-rose-100 text-rose-700",
  pagado_parcial: "bg-sky-100 text-sky-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize", STATUS_STYLES[status])}>
      {status.replace("_", " ")}
    </span>
  );
}

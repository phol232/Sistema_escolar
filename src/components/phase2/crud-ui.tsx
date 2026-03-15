"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { FolderOpen, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input as BaseInput } from "@/components/ui/input";
import { InputShell } from "@/components/ui/input-shell";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type IconVariant = "blue" | "green" | "purple" | "amber" | "rose" | "slate" | "orange" | "emerald" | "cyan" | "indigo";

const ICON_VARIANT_CLASSES: Record<IconVariant, { bg: string; text: string }> = {
  blue:    { bg: "bg-blue-100 dark:bg-blue-950",    text: "text-blue-600 dark:text-blue-400" },
  green:   { bg: "bg-green-100 dark:bg-green-950",  text: "text-green-600 dark:text-green-400" },
  purple:  { bg: "bg-purple-100 dark:bg-purple-950",text: "text-purple-600 dark:text-purple-400" },
  amber:   { bg: "bg-amber-100 dark:bg-amber-950",  text: "text-amber-600 dark:text-amber-400" },
  rose:    { bg: "bg-rose-100 dark:bg-rose-950",    text: "text-rose-600 dark:text-rose-400" },
  slate:   { bg: "bg-slate-100 dark:bg-slate-800",  text: "text-slate-600 dark:text-slate-400" },
  orange:  { bg: "bg-orange-100 dark:bg-orange-950",text: "text-orange-600 dark:text-orange-400" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400" },
  cyan:    { bg: "bg-cyan-100 dark:bg-cyan-950",    text: "text-cyan-600 dark:text-cyan-400" },
  indigo:  { bg: "bg-indigo-100 dark:bg-indigo-950",text: "text-indigo-600 dark:text-indigo-400" },
};

export interface CrudColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  icon?: React.ElementType;
  iconVariant?: IconVariant;
}

interface CrudTableProps<T> {
  title: string;
  description: string;
  rows: T[];
  columns: CrudColumn<T>[];
  emptyTitle: string;
  emptyDescription: string;
  actionLabel?: string;
  forceTable?: boolean;
  searchPlaceholder?: string;
  getSearchText?: (row: T) => string;
  showHeaderDescription?: boolean;
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

const CARD_THRESHOLD = 6;

export function CrudTable<T>({
  title,
  description,
  rows,
  columns,
  emptyTitle,
  emptyDescription,
  actionLabel,
  forceTable = false,
  searchPlaceholder = "Buscar...",
  getSearchText,
  showHeaderDescription = false,
  onCreate,
  onEdit,
  onDelete,
}: CrudTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");

  const hasEstadoField = useMemo(
    () => rows.some((row) => typeof (row as { estado?: unknown }).estado === "string"),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const estadoRaw = (row as { estado?: unknown }).estado;
      const normalizedEstado = typeof estadoRaw === "string" ? estadoRaw.toLowerCase() : "";

      if (hasEstadoField && estadoFilter !== "todos" && normalizedEstado !== estadoFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const text =
        getSearchText?.(row) ??
        Object.values(row as Record<string, unknown>)
          .map((value) => (value == null ? "" : String(value)))
          .join(" ");

      return text.toLowerCase().includes(search);
    });
  }, [estadoFilter, getSearchText, hasEstadoField, rows, searchTerm]);

  const isEmpty = rows.length === 0;
  const isFilteredEmpty = filteredRows.length === 0;
  const hasActiveFilters = Boolean(searchTerm.trim()) || estadoFilter !== "todos";
  const useCards = !isFilteredEmpty && !forceTable && filteredRows.length <= CARD_THRESHOLD;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 border-b border-border bg-muted/20 pb-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-base">{title}</CardTitle>
              {!isEmpty ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                  {filteredRows.length}
                  {hasActiveFilters ? `/${rows.length}` : ""}
                </span>
              ) : null}
            </div>
            {showHeaderDescription ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actionLabel && onCreate ? (
            <Button className="shrink-0 gap-2" onClick={onCreate} size="sm">
              <Plus className="h-4 w-4" />
              {actionLabel}
            </Button>
          ) : null}
        </div>

        {!isEmpty ? (
          <div className={cn("grid gap-2", hasEstadoField ? "md:grid-cols-[minmax(0,1fr)_220px]" : "md:grid-cols-1")}>
            <InputShell filled={Boolean(searchTerm.trim())}>
              <Search className="h-4 w-4 text-muted-foreground" />
              <BaseInput
                className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={searchPlaceholder}
                value={searchTerm}
              />
            </InputShell>

            {hasEstadoField ? (
              <InputShell filled={estadoFilter !== "todos"}>
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <select
                  className="h-10 w-full border-0 bg-transparent px-0 text-sm outline-none"
                  onChange={(event) => setEstadoFilter(event.target.value)}
                  value={estadoFilter}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </InputShell>
            ) : null}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="p-0">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
              <p className="max-w-xs text-sm text-muted-foreground">{emptyDescription}</p>
            </div>
            {actionLabel && onCreate ? (
              <Button className="mt-1 gap-2" onClick={onCreate} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                {actionLabel}
              </Button>
            ) : null}
          </div>
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-foreground">No hay resultados con esos filtros</p>
            <p className="max-w-sm text-sm text-muted-foreground">Prueba con otra busqueda o cambia el estado.</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setEstadoFilter("todos");
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : useCards ? (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRows.map((row, index) => (
              <div
                key={index}
                className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="space-y-2">
                  {columns.map((column, colIndex) => {
                    const variant = column.iconVariant ?? "slate";
                    const variantCls = ICON_VARIANT_CLASSES[variant];
                    const Icon = column.icon;
                    return (
                      <div key={column.header} className={cn(colIndex === 0 ? "flex items-start gap-2.5" : "flex items-center gap-2")}>
                        {Icon ? (
                          <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", variantCls.bg)}>
                            <Icon className={cn("h-3.5 w-3.5", variantCls.text)} />
                          </span>
                        ) : null}
                        {colIndex === 0 ? (
                          <div className="text-sm">{column.cell(row)}</div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{column.header}:</span>
                            <span className="text-sm text-muted-foreground">{column.cell(row)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {onEdit || onDelete ? (
                  <div className="flex gap-2 border-t border-border/60 pt-3">
                    {onEdit ? (
                      <Button className="h-7 flex-1 gap-1.5 text-xs" onClick={() => onEdit(row)} size="sm" variant="outline">
                        <Pencil className="h-3 w-3" />
                        Editar
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button
                        className="h-7 flex-1 gap-1.5 border-destructive/25 text-xs text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(row)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.header}
                      className={cn(
                        "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80",
                        column.className,
                      )}
                      scope="col"
                    >
                      {column.header}
                    </th>
                  ))}
                  {onEdit || onDelete ? (
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                      Acciones
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRows.map((row, index) => (
                  <tr key={index} className="group align-top transition-colors hover:bg-muted/25">
                    {columns.map((column, colIndex) => (
                      <td
                        key={column.header}
                        className={cn(
                          "px-4 py-3.5",
                          colIndex === 0 ? "text-foreground" : "text-muted-foreground",
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                    {onEdit || onDelete ? (
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-2 opacity-50 transition-opacity group-hover:opacity-100">
                          {onEdit ? (
                            <Button className="h-8" onClick={() => onEdit(row)} size="sm" variant="outline">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}
                          {onDelete ? (
                            <Button
                              className="h-8 border-destructive/25 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => onDelete(row)}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
interface CrudModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  variant?: "modal" | "sheet";
  contentClassName?: string;
}

export function CrudModal({ open, title, description, onClose, children, variant = "modal", contentClassName }: CrudModalProps) {
  if (!open) {
    return null;
  }

  return (
    <CrudModalInner title={title} description={description} onClose={onClose} variant={variant} contentClassName={contentClassName}>
      {children}
    </CrudModalInner>
  );
}

function CrudModalInner({ title, description, onClose, children, variant = "modal", contentClassName }: Omit<CrudModalProps, "open">) {
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Detect any input interaction inside the form
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    function markDirty() {
      setIsDirty(true);
    }

    content.addEventListener("input", markDirty);
    content.addEventListener("change", markDirty);
    return () => {
      content.removeEventListener("input", markDirty);
      content.removeEventListener("change", markDirty);
    };
  }, []);

  // Body scroll lock + Escape key handler
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (showDiscardWarning) {
          setShowDiscardWarning(false);
        } else if (isDirty) {
          setShowDiscardWarning(true);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, isDirty, showDiscardWarning]);

  function handleRequestClose() {
    if (isDirty) {
      setShowDiscardWarning(true);
    } else {
      onClose();
    }
  }

  return (
    <>
      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Main modal ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <div
        className={cn(
          "fixed inset-0 z-[120] bg-black/60 backdrop-blur-[2px]",
          variant === "sheet" ? "flex items-stretch justify-end" : "flex items-center justify-center p-4",
        )}
        onClick={handleRequestClose}
      >
        <div
          className={cn(
            "border border-border bg-card shadow-2xl",
            variant === "sheet"
              ? "flex h-full w-full max-w-[34rem] flex-col rounded-none border-y-0 border-r-0"
              : "w-full max-w-md rounded-2xl",
            contentClassName,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b border-border bg-muted/20",
              variant === "sheet" ? "px-6 py-6" : "px-6 py-5",
            )}
          >
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{title}</h3>
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
            <Button
              aria-label="Cerrar modal"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={handleRequestClose}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div
            ref={contentRef}
            className={cn(variant === "sheet" ? "flex-1 overflow-y-auto p-6" : "max-h-[80vh] overflow-y-auto p-6")}
          >
            {children}
          </div>
        </div>
      </div>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Discard warning ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      {showDiscardWarning ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowDiscardWarning(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h4 className="text-base font-semibold">Ãƒâ€šÃ‚Â¿Descartar cambios?</h4>
              <p className="text-sm text-muted-foreground">Tienes cambios sin guardar. Si cierras ahora, se perderÃƒÆ’Ã‚Â¡n.</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setShowDiscardWarning(false)} variant="ghost">
                Seguir editando
              </Button>
              <Button
                className="border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  setShowDiscardWarning(false);
                  onClose();
                }}
              >
                Descartar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string; helper?: string }>;
  placeholder?: string;
}

function hasFieldValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(value);
}

interface ModalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, ModalInputProps>(({ className, value, defaultValue, ...props }, ref) => {
  const filled = hasFieldValue(value ?? defaultValue);

  return (
    <InputShell filled={filled}>
      <BaseInput
        className={cn("h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0", className)}
        defaultValue={defaultValue}
        ref={ref}
        value={value}
        {...props}
      />
    </InputShell>
  );
});
Input.displayName = "CrudInput";

export function SelectField({ options, placeholder = "Selecciona una opcion", className, ...props }: SelectFieldProps) {
  const filled = hasFieldValue(props.value ?? props.defaultValue);

  return (
    <InputShell filled={filled}>
      <select className={cn("h-10 w-full border-0 bg-transparent px-0 text-sm outline-none", className)} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.helper ? ` - ${option.helper}` : ""}
          </option>
        ))}
      </select>
    </InputShell>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, value, defaultValue, ...props }: TextAreaProps) {
  const filled = hasFieldValue(value ?? defaultValue);

  return (
    <InputShell className="items-start gap-0 py-2" filled={filled}>
      <textarea
        className={cn("min-h-24 w-full resize-y border-0 bg-transparent px-0 py-0 text-sm outline-none", className)}
        defaultValue={defaultValue}
        value={value}
        {...props}
      />
    </InputShell>
  );
}
interface BooleanFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function BooleanField({ label, checked, onChange }: BooleanFieldProps) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
/*  Submit / Danger bars                               */
/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */

interface SubmitBarProps {
  error?: string | null;
  submitLabel: string;
  isPending?: boolean;
  onCancel: () => void;
}

export function SubmitBar({ error, submitLabel, isPending, onCancel }: SubmitBarProps) {
  return (
    <div className="space-y-3 pt-4">
      {error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}

interface DangerBarProps {
  error?: string | null;
  isPending?: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DangerBar({ error, isPending, title, description, onCancel, onConfirm }: DangerBarProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-base font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          className="border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </div>
  );
}


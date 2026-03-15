"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { deleteApoderadoAction, searchApoderadoPersonaOptionsAction, upsertApoderadoAction } from "@/app/(dashboard)/phase2/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDebounce } from "@/hooks/use-debounce";
import type { ApoderadoRecord, PaginationMeta, SelectOption } from "@/lib/types/phase2";

import { Activity, Briefcase, UserCheck } from "lucide-react";

import { CrudModal, CrudTable, DangerBar, Field, Input, SelectField, SubmitBar } from "./crud-ui";

interface ApoderadosManagerProps {
  apoderados: ApoderadoRecord[];
  pagination: PaginationMeta;
}

const ESTADO_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

function toFormState(apoderado?: ApoderadoRecord) {
  return {
    persona_id: apoderado?.persona_id ?? "",
    ocupacion: apoderado?.ocupacion ?? "",
    estado: apoderado?.estado ?? "activo",
  };
}

export function ApoderadosManager({ apoderados, pagination }: ApoderadosManagerProps) {
  const router = useRouter();
  const [rows, setRows] = useState(apoderados);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApoderadoRecord | null>(null);
  const [deleting, setDeleting] = useState<ApoderadoRecord | null>(null);
  const [form, setForm] = useState(toFormState());
  const [personaQuery, setPersonaQuery] = useState("");
  const [personaOptions, setPersonaOptions] = useState<SelectOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPersonaPending, startPersonaTransition] = useTransition();
  const debouncedPersonaQuery = useDebounce(personaQuery, 250);

  useEffect(() => {
    setRows(apoderados);
  }, [apoderados]);

  const availablePersonaOptions = useMemo(() => {
    if (editing && !personaOptions.some((option) => option.value === editing.persona_id)) {
      return [
        {
          value: editing.persona_id,
          label: editing.persona_nombre,
          helper: editing.dni,
        },
        ...personaOptions,
      ];
    }

    return personaOptions;
  }, [editing, personaOptions]);

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    let cancelled = false;
    startPersonaTransition(async () => {
      const options = await searchApoderadoPersonaOptionsAction({
        query: debouncedPersonaQuery,
        includePersonaId: editing?.persona_id ?? null,
      });

      if (!cancelled) {
        setPersonaOptions(options);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedPersonaQuery, editing?.persona_id, isFormOpen]);

  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
    setPersonaOptions([]);
    setPersonaQuery("");
    setError(null);
    setForm(toFormState());
  }

  function setPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const nextUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.push(nextUrl as Route);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await upsertApoderadoAction({
        id: editing?.id ?? null,
        values: form,
      });

      if (!result.ok) {
        setError(result.message ?? "No se pudo guardar el apoderado.");
        return;
      }

      const selectedPersona = availablePersonaOptions.find((option) => option.value === form.persona_id);
      setRows((current) => {
        const optimistic: ApoderadoRecord = {
          id: editing?.id ?? `tmp-${Date.now()}`,
          persona_id: form.persona_id,
          persona_nombre: selectedPersona?.label ?? editing?.persona_nombre ?? "Persona",
          dni: selectedPersona?.helper ?? editing?.dni ?? "",
          ocupacion: form.ocupacion || null,
          estado: form.estado,
        };

        if (editing) {
          return current.map((row) => (row.id === editing.id ? optimistic : row));
        }

        return [optimistic, ...current];
      });
      closeForm();
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleting) {
      return;
    }

    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteApoderadoAction(deleting.id);

      if (!result.ok) {
        setDeleteError(result.message ?? "No se pudo eliminar el apoderado.");
        return;
      }

      setRows((current) => current.filter((row) => row.id !== deleting.id));
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <CrudTable
        actionLabel="Nuevo apoderado"
        columns={[
          {
            header: "Apoderado",
            icon: UserCheck,
            iconVariant: "blue",
            cell: (row) => (
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{row.persona_nombre}</p>
                <p>{row.dni}</p>
              </div>
            ),
          },
          {
            header: "Ocupación",
            icon: Briefcase,
            iconVariant: "purple",
            cell: (row) => row.ocupacion || "Sin ocupación",
          },
          {
            header: "Estado",
            icon: Activity,
            iconVariant: "amber",
            cell: (row) => <StatusBadge status={row.estado} />,
            className: "whitespace-nowrap",
          },
        ]}
        description="Registro familiar para responsables legales y contactos principales del alumno."
        emptyDescription="Selecciona personas por nombre para registrar apoderados sin exponer IDs."
        emptyTitle="No hay apoderados registrados"
        onCreate={() => {
          setIsFormOpen(true);
          setEditing(null);
          setPersonaOptions([]);
          setPersonaQuery("");
          setError(null);
          setForm(toFormState());
        }}
        onDelete={setDeleting}
        onEdit={(row) => {
          setIsFormOpen(true);
          setEditing(row);
          setPersonaOptions([]);
          setPersonaQuery("");
          setError(null);
          setForm(toFormState(row));
        }}
        rows={rows}
        title="Gestión de apoderados"
      />

      <CrudModal
        description="Vincula una persona por nombre y guarda la información base del apoderado."
        onClose={closeForm}
        open={isFormOpen}
        title={editing ? "Editar apoderado" : "Nuevo apoderado"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Buscar persona">
            <Input
              placeholder="DNI, nombre o apellido"
              value={personaQuery}
              onChange={(event) => setPersonaQuery(event.target.value)}
            />
          </Field>
          <Field label="Persona">
            <SelectField
              options={availablePersonaOptions}
              value={form.persona_id}
              onChange={(event) => setForm((current) => ({ ...current, persona_id: event.target.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {isPersonaPending ? "Buscando personas..." : `${availablePersonaOptions.length} opciones disponibles`}
            </p>
          </Field>
          <Field label="Estado">
            <SelectField
              options={ESTADO_OPTIONS}
              value={form.estado}
              onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as "activo" | "inactivo" }))}
            />
          </Field>
          <Field label="Ocupación">
            <Input value={form.ocupacion} onChange={(event) => setForm((current) => ({ ...current, ocupacion: event.target.value }))} />
          </Field>
          <SubmitBar error={error} isPending={isPending} onCancel={closeForm} submitLabel={editing ? "Guardar cambios" : "Crear apoderado"} />
        </form>
      </CrudModal>

      <CrudModal
        description="La eliminación puede bloquearse si el apoderado ya está vinculado a uno o más alumnos."
        onClose={() => {
          setDeleting(null);
          setDeleteError(null);
        }}
        open={Boolean(deleting)}
        title="Eliminar apoderado"
      >
        {deleting ? (
          <DangerBar
            description={`Se eliminará al apoderado ${deleting.persona_nombre}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeleting(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
            title="¿Seguro que quieres eliminar este apoderado?"
          />
        ) : null}
      </CrudModal>

      {pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} registros
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
              type="button"
            >
              Anterior
            </button>
            <button
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
              type="button"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

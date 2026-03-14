"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { deleteAlumnoAction, searchAlumnoPersonaOptionsAction, upsertAlumnoAction } from "@/app/(dashboard)/phase2/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDebounce } from "@/hooks/use-debounce";
import type { AlumnoRecord, PaginationMeta, SelectOption } from "@/lib/types/phase2";

import { Activity, GraduationCap, Hash, MapPin } from "lucide-react";

import { CrudModal, CrudTable, DangerBar, Field, Input, SelectField, SubmitBar } from "./crud-ui";

interface AlumnosManagerProps {
  alumnos: AlumnoRecord[];
  pagination: PaginationMeta;
}

const ESTADO_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

function toFormState(alumno?: AlumnoRecord) {
  return {
    persona_id: alumno?.persona_id ?? "",
    codigo_estudiante: alumno?.codigo_estudiante ?? "",
    procedencia_colegio: alumno?.procedencia_colegio ?? "",
    estado: alumno?.estado ?? "activo",
  };
}

export function AlumnosManager({ alumnos, pagination }: AlumnosManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<AlumnoRecord | null>(null);
  const [deleting, setDeleting] = useState<AlumnoRecord | null>(null);
  const [form, setForm] = useState(toFormState());
  const [personaQuery, setPersonaQuery] = useState("");
  const [personaOptions, setPersonaOptions] = useState<SelectOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPersonaPending, startPersonaTransition] = useTransition();
  const debouncedPersonaQuery = useDebounce(personaQuery, 250);

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
      const options = await searchAlumnoPersonaOptionsAction({
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
      const result = await upsertAlumnoAction({
        id: editing?.id ?? null,
        values: form,
      });

      if (!result.ok) {
        setError(result.message ?? "No se pudo guardar el alumno.");
        return;
      }

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
      const result = await deleteAlumnoAction(deleting.id);

      if (!result.ok) {
        setDeleteError(result.message ?? "No se pudo eliminar el alumno.");
        return;
      }

      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <CrudTable
        actionLabel="Nuevo alumno"
        columns={[
          {
            header: "Alumno",
            icon: GraduationCap,
            iconVariant: "blue",
            cell: (row) => (
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{row.persona_nombre}</p>
                <p>{row.dni}</p>
              </div>
            ),
          },
          {
            header: "Código",
            icon: Hash,
            iconVariant: "slate",
            cell: (row) => <span className="font-semibold text-foreground">{row.codigo_estudiante}</span>,
            className: "whitespace-nowrap",
          },
          {
            header: "Procedencia",
            icon: MapPin,
            iconVariant: "orange",
            cell: (row) => row.procedencia_colegio || "Sin colegio previo",
          },
          {
            header: "Estado",
            icon: Activity,
            iconVariant: "amber",
            cell: (row) => <StatusBadge status={row.estado} />,
            className: "whitespace-nowrap",
          },
        ]}
        description="Relaciona personas con su ficha de alumno para matrícula, asistencia y evaluaciones."
        emptyDescription="Primero registra personas y luego crea alumnos seleccionando su nombre."
        emptyTitle="No hay alumnos registrados"
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
        rows={alumnos}
        title="Gestión de alumnos"
      />

      <CrudModal
        description="Selecciona la persona por nombre y completa la ficha académica básica del alumno."
        onClose={closeForm}
        open={isFormOpen}
        title={editing ? "Editar alumno" : "Nuevo alumno"}
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
          <Field label="Código de estudiante">
            <Input value={form.codigo_estudiante} onChange={(event) => setForm((current) => ({ ...current, codigo_estudiante: event.target.value }))} />
          </Field>
          <Field label="Colegio de procedencia">
            <Input
              value={form.procedencia_colegio}
              onChange={(event) => setForm((current) => ({ ...current, procedencia_colegio: event.target.value }))}
            />
          </Field>
          <SubmitBar error={error} isPending={isPending} onCancel={closeForm} submitLabel={editing ? "Guardar cambios" : "Crear alumno"} />
        </form>
      </CrudModal>

      <CrudModal
        description="La eliminación puede bloquearse si el alumno ya tiene matrícula, notas, asistencia o vínculos familiares."
        onClose={() => {
          setDeleting(null);
          setDeleteError(null);
        }}
        open={Boolean(deleting)}
        title="Eliminar alumno"
      >
        {deleting ? (
          <DangerBar
            description={`Se eliminará al alumno ${deleting.persona_nombre}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeleting(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
            title="¿Seguro que quieres eliminar este alumno?"
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

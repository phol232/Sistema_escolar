"use client";

import { useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { deletePersonaAction, upsertPersonaAction } from "@/app/(dashboard)/phase2/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import type { PaginationMeta, PersonaRecord } from "@/lib/types/phase2";
import { buildFullName } from "@/lib/utils";

import { BooleanField, CrudModal, CrudTable, DangerBar, Field, Input, SelectField, SubmitBar, TextArea } from "./crud-ui";

interface PersonasManagerProps {
  personas: PersonaRecord[];
  pagination: PaginationMeta;
}

const SEX_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];

const ESTADO_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

function toFormState(persona?: PersonaRecord) {
  return {
    dni: persona?.dni ?? "",
    nombres: persona?.nombres ?? "",
    apellido_paterno: persona?.apellido_paterno ?? "",
    apellido_materno: persona?.apellido_materno ?? "",
    fecha_nacimiento: persona?.fecha_nacimiento ?? "",
    sexo: persona?.sexo ?? "",
    direccion: persona?.direccion ?? "",
    ubigeo: persona?.ubigeo ?? "",
    telefono: persona?.telefono ?? "",
    email: persona?.email ?? "",
    estado: persona?.estado ?? "activo",
  };
}

export function PersonasManager({ personas, pagination }: PersonasManagerProps) {
  const router = useRouter();
  const [rows, setRows] = useState(personas);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<PersonaRecord | null>(null);
  const [deleting, setDeleting] = useState<PersonaRecord | null>(null);
  const [form, setForm] = useState(toFormState());
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(personas);
  }, [personas]);

  function openCreate() {
    setIsFormOpen(true);
    setEditing(null);
    setError(null);
    setForm(toFormState());
  }

  function openEdit(persona: PersonaRecord) {
    setIsFormOpen(true);
    setEditing(persona);
    setError(null);
    setForm(toFormState(persona));
  }

  function closeModal() {
    setIsFormOpen(false);
    setEditing(null);
    setError(null);
    setForm(toFormState());
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await upsertPersonaAction({
        id: editing?.id ?? null,
        values: { ...form },
      });

      if (!result.ok) {
        setError(result.message ?? "No se pudo guardar la persona.");
        return;
      }

      setRows((current) => {
        const optimistic: PersonaRecord = {
          id: editing?.id ?? `tmp-${Date.now()}`,
          dni: form.dni,
          nombres: form.nombres,
          apellido_paterno: form.apellido_paterno,
          apellido_materno: form.apellido_materno,
          fecha_nacimiento: form.fecha_nacimiento || null,
          sexo: (form.sexo as PersonaRecord["sexo"]) || null,
          direccion: form.direccion || null,
          ubigeo: form.ubigeo || null,
          telefono: form.telefono || null,
          email: form.email || null,
          estado: form.estado,
          nombre_completo: buildFullName({
            nombres: form.nombres,
            apellido_paterno: form.apellido_paterno,
            apellido_materno: form.apellido_materno,
          }),
        };

        if (editing) {
          return current.map((row) => (row.id === editing.id ? optimistic : row));
        }

        return [optimistic, ...current];
      });
      closeModal();
      router.refresh();
    });
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

  function handleDelete() {
    if (!deleting) {
      return;
    }

    setDeleteError(null);
    startTransition(async () => {
      const result = await deletePersonaAction(deleting.id);

      if (!result.ok) {
        setDeleteError(result.message ?? "No se pudo eliminar la persona.");
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
        actionLabel="Nueva persona"
        forceTable
        columns={[
          {
            header: "Persona",
            cell: (persona) => (
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{persona.nombre_completo}</p>
                <p>{persona.dni}</p>
              </div>
            ),
          },
          {
            header: "Contacto",
            cell: (persona) => (
              <div className="space-y-1">
                <p>{persona.email || "Sin correo"}</p>
                <p>{persona.telefono || "Sin teléfono"}</p>
              </div>
            ),
          },
          {
            header: "Detalle",
            cell: (persona) => (
              <div className="space-y-1">
                <p>{persona.sexo ? `Sexo: ${persona.sexo}` : "Sin sexo"}</p>
                <p>{persona.ubigeo ? `Ubigeo: ${persona.ubigeo}` : persona.fecha_nacimiento || "Sin fecha de nacimiento"}</p>
              </div>
            ),
          },
          {
            header: "Estado",
            cell: (persona) => <StatusBadge status={persona.estado} />,
            className: "whitespace-nowrap",
          },
        ]}
        description="Base única para registrar y reutilizar personas en alumnos, docentes y apoderados."
        emptyDescription="Crea la primera persona para empezar a enlazar los demás módulos."
        emptyTitle="No hay personas registradas"
        onCreate={openCreate}
        onDelete={setDeleting}
        onEdit={openEdit}
        rows={rows}
        title="Gestión de personas"
      />

      <CrudModal
        description="Completa los datos personales que se reutilizarán en alumnos, docentes y apoderados."
        onClose={closeModal}
        open={isFormOpen}
        title={editing ? "Editar persona" : "Nueva persona"}
        variant="sheet"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="DNI o CE">
              <Input value={form.dni} onChange={(event) => setForm((current) => ({ ...current, dni: event.target.value }))} />
            </Field>
            <Field label="Estado">
              <SelectField
                options={ESTADO_OPTIONS}
                value={form.estado}
                onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as "activo" | "inactivo" }))}
              />
            </Field>
            <Field label="Nombres">
              <Input value={form.nombres} onChange={(event) => setForm((current) => ({ ...current, nombres: event.target.value }))} />
            </Field>
            <Field label="Apellido paterno">
              <Input
                value={form.apellido_paterno}
                onChange={(event) => setForm((current) => ({ ...current, apellido_paterno: event.target.value }))}
              />
            </Field>
            <Field label="Apellido materno">
              <Input
                value={form.apellido_materno}
                onChange={(event) => setForm((current) => ({ ...current, apellido_materno: event.target.value }))}
              />
            </Field>
            <Field label="Fecha de nacimiento">
              <Input
                type="date"
                value={form.fecha_nacimiento}
                onChange={(event) => setForm((current) => ({ ...current, fecha_nacimiento: event.target.value }))}
              />
            </Field>
            <Field label="Sexo">
              <SelectField
                options={SEX_OPTIONS}
                value={form.sexo}
                onChange={(event) => setForm((current) => ({ ...current, sexo: event.target.value }))}
              />
            </Field>
            <Field label="Ubigeo">
              <Input value={form.ubigeo} onChange={(event) => setForm((current) => ({ ...current, ubigeo: event.target.value }))} />
            </Field>
            <Field label="Teléfono">
              <Input value={form.telefono} onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))} />
            </Field>
            <Field label="Correo">
              <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </Field>
          </div>
          <Field label="Dirección">
            <TextArea value={form.direccion} onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))} />
          </Field>
          <SubmitBar error={error} isPending={isPending} onCancel={closeModal} submitLabel={editing ? "Guardar cambios" : "Crear persona"} />
        </form>
      </CrudModal>

      <CrudModal
        description="Esta acción intentará eliminar el registro personal y puede fallar si ya está vinculado a otro módulo."
        onClose={() => {
          setDeleting(null);
          setDeleteError(null);
        }}
        open={Boolean(deleting)}
        title="Eliminar persona"
      >
        {deleting ? (
          <DangerBar
            description={`Se eliminará a ${buildFullName(deleting)}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeleting(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
            title="¿Seguro que quieres eliminar esta persona?"
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

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteAulaAction, upsertAulaAction } from "@/app/(dashboard)/phase2/actions";
import type { AulaRecord } from "@/lib/types/phase2";

import { DoorOpen, Users } from "lucide-react";

import { CrudModal, CrudTable, DangerBar, Field, Input, SubmitBar } from "./crud-ui";

interface AulasManagerProps {
  aulas: AulaRecord[];
}

function toFormState(aula?: AulaRecord) {
  return {
    nombre: aula?.nombre ?? "",
    capacidad: aula?.capacidad.toString() ?? "",
  };
}

export function AulasManager({ aulas }: AulasManagerProps) {
  const router = useRouter();
  const [rows, setRows] = useState(aulas);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<AulaRecord | null>(null);
  const [deleting, setDeleting] = useState<AulaRecord | null>(null);
  const [form, setForm] = useState(toFormState());
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(aulas);
  }, [aulas]);

  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
    setError(null);
    setForm(toFormState());
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await upsertAulaAction({
        id: editing?.id ?? null,
        values: form,
      });

      if (!result.ok) {
        setError(result.message ?? "No se pudo guardar el aula.");
        return;
      }

      setRows((current) => {
        const parsedCapacidad = Number(form.capacidad);
        const optimistic: AulaRecord = {
          id: editing?.id ?? `tmp-${Date.now()}`,
          nombre: form.nombre.trim(),
          capacidad: Number.isFinite(parsedCapacidad) ? parsedCapacidad : 0,
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
    if (!deleting) return;

    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAulaAction(deleting.id);

      if (!result.ok) {
        setDeleteError(result.message ?? "No se pudo eliminar.");
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
        actionLabel="Nueva aula"
        columns={[
          { header: "Aula", icon: DoorOpen, iconVariant: "blue", cell: (row) => <span className="font-semibold text-foreground">{row.nombre}</span> },
          { header: "Capacidad", icon: Users, iconVariant: "cyan", cell: (row) => `${row.capacidad} estudiantes` },
        ]}
        description="Catálogo físico de aulas disponibles para secciones y matrículas."
        emptyDescription="Crea aulas con su capacidad máxima."
        emptyTitle="No hay aulas registradas"
        onCreate={() => {
          setIsFormOpen(true);
          setEditing(null);
          setError(null);
          setForm(toFormState());
        }}
        onDelete={setDeleting}
        onEdit={(row) => {
          setIsFormOpen(true);
          setEditing(row);
          setError(null);
          setForm(toFormState(row));
        }}
        rows={rows}
        title="Aulas"
      />

      <CrudModal
        description="Registra el nombre visible del aula y su capacidad máxima."
        onClose={closeForm}
        open={isFormOpen}
        title={editing ? "Editar aula" : "Nueva aula"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Nombre">
            <Input value={form.nombre} onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} />
          </Field>
          <Field label="Capacidad">
            <Input value={form.capacidad} onChange={(event) => setForm((current) => ({ ...current, capacidad: event.target.value }))} />
          </Field>
          <SubmitBar error={error} isPending={isPending} onCancel={closeForm} submitLabel={editing ? "Guardar cambios" : "Crear aula"} />
        </form>
      </CrudModal>

      <CrudModal onClose={() => setDeleting(null)} open={Boolean(deleting)} title="Eliminar aula">
        {deleting ? (
          <DangerBar
            description={`Se eliminará el aula ${deleting.nombre}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeleting(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
            title="¿Eliminar esta aula?"
          />
        ) : null}
      </CrudModal>
    </>
  );
}

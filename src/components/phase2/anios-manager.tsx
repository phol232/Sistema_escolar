"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteAnioEscolarAction, upsertAnioEscolarAction } from "@/app/(dashboard)/phase2/actions";
import type { AnioEscolarRecord } from "@/lib/types/phase2";
import { formatDate } from "@/lib/utils";

import { Calendar, CalendarCheck, CalendarX, CheckCircle2 } from "lucide-react";

import { BooleanField, CrudModal, CrudTable, DangerBar, Field, Input, SubmitBar } from "./crud-ui";

interface AniosManagerProps {
  anios: AnioEscolarRecord[];
}

function toFormState(anio?: AnioEscolarRecord) {
  return {
    anio: anio?.anio.toString() ?? "",
    fecha_inicio: anio?.fecha_inicio ?? "",
    fecha_fin: anio?.fecha_fin ?? "",
    activo: anio?.activo ?? false,
  };
}

export function AniosManager({ anios }: AniosManagerProps) {
  const router = useRouter();
  const [rows, setRows] = useState(anios);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<AnioEscolarRecord | null>(null);
  const [deleting, setDeleting] = useState<AnioEscolarRecord | null>(null);
  const [form, setForm] = useState(toFormState());
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(anios);
  }, [anios]);

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
      const result = await upsertAnioEscolarAction({
        id: editing?.id ?? null,
        values: {
          anio: form.anio,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          activo: form.activo,
        },
      });

      if (!result.ok) {
        setError(result.message ?? "No se pudo guardar el anio escolar.");
        return;
      }

      setRows((current) => {
        const parsedYear = Number(form.anio);
        const optimistic: AnioEscolarRecord = {
          id: editing?.id ?? `tmp-${Date.now()}`,
          anio: Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear(),
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          activo: form.activo,
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
      const result = await deleteAnioEscolarAction(deleting.id);

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
        actionLabel="Nuevo anio"
        columns={[
          { header: "Anio", icon: Calendar, iconVariant: "blue", cell: (row) => <span className="font-semibold text-foreground">{row.anio}</span> },
          { header: "Inicio", icon: CalendarCheck, iconVariant: "green", cell: (row) => formatDate(row.fecha_inicio) },
          { header: "Fin", icon: CalendarX, iconVariant: "rose", cell: (row) => formatDate(row.fecha_fin) },
          { header: "Activo", icon: CheckCircle2, iconVariant: "emerald", cell: (row) => (row.activo ? "Si" : "No") },
        ]}
        description="Manten el periodo escolar activo y sus fechas de referencia."
        emptyDescription="Crea el primer anio escolar para habilitar matricula, secciones y bimestres."
        emptyTitle="No hay anios escolares"
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
        title="Anios escolares"
      />

      <CrudModal
        description="Solo un anio puede quedar activo al mismo tiempo."
        onClose={closeForm}
        open={isFormOpen}
        title={editing ? "Editar anio escolar" : "Nuevo anio escolar"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Anio">
            <Input value={form.anio} onChange={(event) => setForm((current) => ({ ...current, anio: event.target.value }))} />
          </Field>
          <BooleanField checked={form.activo} label="Marcar como anio activo" onChange={(checked) => setForm((current) => ({ ...current, activo: checked }))} />
          <Field label="Fecha de inicio">
            <Input type="date" value={form.fecha_inicio} onChange={(event) => setForm((current) => ({ ...current, fecha_inicio: event.target.value }))} />
          </Field>
          <Field label="Fecha de fin">
            <Input type="date" value={form.fecha_fin} onChange={(event) => setForm((current) => ({ ...current, fecha_fin: event.target.value }))} />
          </Field>
          <SubmitBar error={error} isPending={isPending} onCancel={closeForm} submitLabel={editing ? "Guardar cambios" : "Crear anio"} />
        </form>
      </CrudModal>

      <CrudModal
        description="Si el anio tiene secciones, matriculas o bimestres relacionados, la eliminacion puede bloquearse."
        onClose={() => {
          setDeleting(null);
          setDeleteError(null);
        }}
        open={Boolean(deleting)}
        title="Eliminar anio escolar"
      >
        {deleting ? (
          <DangerBar
            description={`Se eliminara el anio ${deleting.anio}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeleting(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
            title="Seguro que quieres eliminar este anio escolar?"
          />
        ) : null}
      </CrudModal>
    </>
  );
}

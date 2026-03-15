"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteVinculoAction, upsertVinculoAction } from "@/app/(dashboard)/phase2/actions";
import type { SelectOption, VinculoRecord } from "@/lib/types/phase2";

import { GraduationCap, Heart, Star, Users } from "lucide-react";

import { BooleanField, CrudModal, CrudTable, DangerBar, Field, SelectField, SubmitBar } from "./crud-ui";

interface VinculosManagerProps {
  vinculos: VinculoRecord[];
  alumnoOptions: SelectOption[];
  apoderadoOptions: SelectOption[];
}

const PARENTESCO_OPTIONS = [
  { value: "padre", label: "Padre" },
  { value: "madre", label: "Madre" },
  { value: "abuelo", label: "Abuelo" },
  { value: "abuela", label: "Abuela" },
  { value: "tio", label: "Tio" },
  { value: "tia", label: "Tia" },
  { value: "hermano", label: "Hermano" },
  { value: "hermana", label: "Hermana" },
  { value: "apoderado_legal", label: "Apoderado legal" },
  { value: "otro", label: "Otro" },
];

function toFormState(vinculo?: VinculoRecord) {
  return {
    alumno_id: vinculo?.alumno_id ?? "",
    apoderado_id: vinculo?.apoderado_id ?? "",
    parentesco: vinculo?.parentesco ?? "padre",
    es_principal: vinculo?.es_principal ?? false,
  };
}

function parentescoLabel(value: string) {
  return PARENTESCO_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function VinculosManager({ vinculos, alumnoOptions, apoderadoOptions }: VinculosManagerProps) {
  const router = useRouter();
  const [rows, setRows] = useState(vinculos);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<VinculoRecord | null>(null);
  const [deleting, setDeleting] = useState<VinculoRecord | null>(null);
  const [form, setForm] = useState(toFormState());
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(vinculos);
  }, [vinculos]);

  const availableApoderados = useMemo(() => {
    if (!form.alumno_id) {
      return apoderadoOptions;
    }

    const linkedApoderados = new Set(rows.filter((item) => item.alumno_id === form.alumno_id).map((item) => item.apoderado_id));
    return apoderadoOptions.filter((option) => option.value === editing?.apoderado_id || !linkedApoderados.has(option.value));
  }, [apoderadoOptions, editing?.apoderado_id, form.alumno_id, rows]);

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
      const result = await upsertVinculoAction({
        id: editing?.id ?? null,
        values: form,
      });

      if (!result.ok) {
        setError(result.message ?? "No se pudo guardar la vinculacion.");
        return;
      }

      setRows((current) => {
        const optimistic: VinculoRecord = {
          id: editing?.id ?? `tmp-${Date.now()}`,
          alumno_id: form.alumno_id,
          alumno_nombre: alumnoOptions.find((item) => item.value === form.alumno_id)?.label ?? "Alumno",
          apoderado_id: form.apoderado_id,
          apoderado_nombre: apoderadoOptions.find((item) => item.value === form.apoderado_id)?.label ?? "Apoderado",
          parentesco: form.parentesco,
          es_principal: form.es_principal,
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
      const result = await deleteVinculoAction(deleting.id);

      if (!result.ok) {
        setDeleteError(result.message ?? "No se pudo eliminar la vinculacion.");
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
        actionLabel="Nueva vinculacion"
        columns={[
          {
            header: "Alumno",
            icon: GraduationCap,
            iconVariant: "blue",
            cell: (row) => <span className="font-semibold text-foreground">{row.alumno_nombre}</span>,
          },
          {
            header: "Apoderado",
            icon: Users,
            iconVariant: "indigo",
            cell: (row) => row.apoderado_nombre,
          },
          {
            header: "Parentesco",
            icon: Heart,
            iconVariant: "rose",
            cell: (row) => parentescoLabel(row.parentesco),
          },
          {
            header: "Principal",
            icon: Star,
            iconVariant: "amber",
            cell: (row) => (row.es_principal ? "Si" : "No"),
            className: "whitespace-nowrap",
          },
        ]}
        description="Relaciona alumnos con sus responsables usando selectores por nombre y parentesco visible."
        emptyDescription="Crea el primer vinculo para identificar responsables familiares por alumno."
        emptyTitle="No hay vinculos registrados"
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
        title="Vinculacion alumno-apoderado"
      />

      <CrudModal
        description="Selecciona al alumno y al apoderado por nombre. El sistema evita repetir el mismo apoderado para el mismo alumno."
        onClose={closeForm}
        open={isFormOpen}
        title={editing ? "Editar vinculo" : "Nuevo vinculo"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Alumno">
            <SelectField
              options={alumnoOptions}
              value={form.alumno_id}
              onChange={(event) => setForm((current) => ({ ...current, alumno_id: event.target.value, apoderado_id: "" }))}
            />
          </Field>
          <Field label="Apoderado">
            <SelectField
              options={availableApoderados}
              value={form.apoderado_id}
              onChange={(event) => setForm((current) => ({ ...current, apoderado_id: event.target.value }))}
            />
          </Field>
          <Field label="Parentesco">
            <SelectField
              options={PARENTESCO_OPTIONS}
              value={form.parentesco}
              onChange={(event) => setForm((current) => ({ ...current, parentesco: event.target.value as typeof form.parentesco }))}
            />
          </Field>
          <BooleanField
            checked={form.es_principal}
            label="Marcar como responsable principal"
            onChange={(checked) => setForm((current) => ({ ...current, es_principal: checked }))}
          />
          <SubmitBar error={error} isPending={isPending} onCancel={closeForm} submitLabel={editing ? "Guardar cambios" : "Crear vinculo"} />
        </form>
      </CrudModal>

      <CrudModal
        description="Se quitara la relacion entre el alumno y el apoderado seleccionado."
        onClose={() => {
          setDeleting(null);
          setDeleteError(null);
        }}
        open={Boolean(deleting)}
        title="Eliminar vinculo"
      >
        {deleting ? (
          <DangerBar
            description={`Se desvinculara a ${deleting.apoderado_nombre} de ${deleting.alumno_nombre}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeleting(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
            title="Seguro que quieres eliminar este vinculo?"
          />
        ) : null}
      </CrudModal>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteGradoAction, deleteNivelAction, upsertGradoAction, upsertNivelAction } from "@/app/(dashboard)/phase2/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import type { GradoRecord, NivelRecord, SelectOption } from "@/lib/types/phase2";

import { Activity, BookOpen, GraduationCap, Hash, Layers, ListOrdered } from "lucide-react";

import { CrudModal, CrudTable, DangerBar, Field, Input, SelectField, SubmitBar } from "./crud-ui";

interface NivelesGradosManagerProps {
  niveles: NivelRecord[];
  grados: GradoRecord[];
  nivelOptions: SelectOption[];
}

const ESTADO_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

function toNivelForm(nivel?: NivelRecord) {
  return {
    codigo: nivel?.codigo ?? "",
    nombre: nivel?.nombre ?? "",
    estado: nivel?.estado ?? "activo",
  };
}

function toGradoForm(grado?: GradoRecord) {
  return {
    nivel_id: grado?.nivel_id ?? "",
    nombre: grado?.nombre ?? "",
    orden: grado?.orden.toString() ?? "1",
    estado: grado?.estado ?? "activo",
  };
}

export function NivelesGradosManager({ niveles, grados, nivelOptions }: NivelesGradosManagerProps) {
  const router = useRouter();
  const [nivelOpen, setNivelOpen] = useState(false);
  const [gradoOpen, setGradoOpen] = useState(false);
  const [editingNivel, setEditingNivel] = useState<NivelRecord | null>(null);
  const [editingGrado, setEditingGrado] = useState<GradoRecord | null>(null);
  const [deletingNivel, setDeletingNivel] = useState<NivelRecord | null>(null);
  const [deletingGrado, setDeletingGrado] = useState<GradoRecord | null>(null);
  const [nivelForm, setNivelForm] = useState(toNivelForm());
  const [gradoForm, setGradoForm] = useState(toGradoForm());
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function closeNivel() {
    setNivelOpen(false);
    setEditingNivel(null);
    setError(null);
    setNivelForm(toNivelForm());
  }

  function closeGrado() {
    setGradoOpen(false);
    setEditingGrado(null);
    setError(null);
    setGradoForm(toGradoForm());
  }

  function submitNivel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await upsertNivelAction({
        id: editingNivel?.id ?? null,
        values: nivelForm,
      });

      if (!result.ok) {
        setError(result.message ?? "No se pudo guardar el nivel.");
        return;
      }

      closeNivel();
      router.refresh();
    });
  }

  function submitGrado(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await upsertGradoAction({
        id: editingGrado?.id ?? null,
        values: gradoForm,
      });

      if (!result.ok) {
        setError(result.message ?? "No se pudo guardar el grado.");
        return;
      }

      closeGrado();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <CrudTable
        actionLabel="Nuevo nivel"
        columns={[
          { header: "Código", icon: Hash, iconVariant: "slate", cell: (row) => <span className="font-semibold text-foreground">{row.codigo}</span> },
          { header: "Nombre", icon: BookOpen, iconVariant: "blue", cell: (row) => row.nombre },
          { header: "Estado", icon: Activity, iconVariant: "amber", cell: (row) => <StatusBadge status={row.estado} /> },
        ]}
        description="Catálogo base para primaria, secundaria y futuros niveles."
        emptyDescription="Crea niveles para poder registrar grados."
        emptyTitle="No hay niveles"
        onCreate={() => {
          setNivelOpen(true);
          setEditingNivel(null);
          setError(null);
          setNivelForm(toNivelForm());
        }}
        onDelete={setDeletingNivel}
        onEdit={(nivel) => {
          setNivelOpen(true);
          setEditingNivel(nivel);
          setError(null);
          setNivelForm(toNivelForm(nivel));
        }}
        rows={niveles}
        title="Niveles"
      />

      <CrudTable
        actionLabel="Nuevo grado"
        columns={[
          { header: "Grado", icon: GraduationCap, iconVariant: "blue", cell: (row) => <span className="font-semibold text-foreground">{row.nombre}</span> },
          { header: "Nivel", icon: Layers, iconVariant: "purple", cell: (row) => row.nivel_nombre },
          { header: "Orden", icon: ListOrdered, iconVariant: "slate", cell: (row) => row.orden.toString() },
          { header: "Estado", icon: Activity, iconVariant: "amber", cell: (row) => <StatusBadge status={row.estado} /> },
        ]}
        description="Ordena los grados dentro de cada nivel para mantener una estructura escolar consistente."
        emptyDescription="Crea grados después de registrar al menos un nivel."
        emptyTitle="No hay grados"
        onCreate={() => {
          setGradoOpen(true);
          setEditingGrado(null);
          setError(null);
          setGradoForm(toGradoForm());
        }}
        onDelete={setDeletingGrado}
        onEdit={(grado) => {
          setGradoOpen(true);
          setEditingGrado(grado);
          setError(null);
          setGradoForm(toGradoForm(grado));
        }}
        rows={grados}
        title="Grados"
      />

      <CrudModal
        description="Define el código y nombre visible del nivel."
        onClose={closeNivel}
        open={nivelOpen}
        title={editingNivel ? "Editar nivel" : "Nuevo nivel"}
      >
        <form className="space-y-4" onSubmit={submitNivel}>
          <Field label="Código">
            <Input value={nivelForm.codigo} onChange={(event) => setNivelForm((current) => ({ ...current, codigo: event.target.value }))} />
          </Field>
          <Field label="Estado">
            <SelectField
              options={ESTADO_OPTIONS}
              value={nivelForm.estado}
              onChange={(event) => setNivelForm((current) => ({ ...current, estado: event.target.value as "activo" | "inactivo" }))}
            />
          </Field>
          <Field label="Nombre">
            <Input value={nivelForm.nombre} onChange={(event) => setNivelForm((current) => ({ ...current, nombre: event.target.value }))} />
          </Field>
          <SubmitBar error={error} isPending={isPending} onCancel={closeNivel} submitLabel={editingNivel ? "Guardar cambios" : "Crear nivel"} />
        </form>
      </CrudModal>

      <CrudModal
        description="Selecciona un nivel por nombre y define el orden que tendrá dentro de ese nivel."
        onClose={closeGrado}
        open={gradoOpen}
        title={editingGrado ? "Editar grado" : "Nuevo grado"}
      >
        <form className="space-y-4" onSubmit={submitGrado}>
          <Field label="Nivel">
            <SelectField
              options={nivelOptions}
              value={gradoForm.nivel_id}
              onChange={(event) => setGradoForm((current) => ({ ...current, nivel_id: event.target.value }))}
            />
          </Field>
          <Field label="Estado">
            <SelectField
              options={ESTADO_OPTIONS}
              value={gradoForm.estado}
              onChange={(event) => setGradoForm((current) => ({ ...current, estado: event.target.value as "activo" | "inactivo" }))}
            />
          </Field>
          <Field label="Nombre">
            <Input value={gradoForm.nombre} onChange={(event) => setGradoForm((current) => ({ ...current, nombre: event.target.value }))} />
          </Field>
          <Field label="Orden">
            <Input value={gradoForm.orden} onChange={(event) => setGradoForm((current) => ({ ...current, orden: event.target.value }))} />
          </Field>
          <SubmitBar error={error} isPending={isPending} onCancel={closeGrado} submitLabel={editingGrado ? "Guardar cambios" : "Crear grado"} />
        </form>
      </CrudModal>

      <CrudModal onClose={() => setDeletingNivel(null)} open={Boolean(deletingNivel)} title="Eliminar nivel">
        {deletingNivel ? (
          <DangerBar
            description={`Se eliminará el nivel ${deletingNivel.nombre}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeletingNivel(null);
              setDeleteError(null);
            }}
            onConfirm={() => {
              setDeleteError(null);
              startTransition(async () => {
                const result = await deleteNivelAction(deletingNivel.id);

                if (!result.ok) {
                  setDeleteError(result.message ?? "No se pudo eliminar.");
                  return;
                }

                setDeletingNivel(null);
                router.refresh();
              });
            }}
            title="¿Eliminar este nivel?"
          />
        ) : null}
      </CrudModal>

      <CrudModal onClose={() => setDeletingGrado(null)} open={Boolean(deletingGrado)} title="Eliminar grado">
        {deletingGrado ? (
          <DangerBar
            description={`Se eliminará el grado ${deletingGrado.nombre}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeletingGrado(null);
              setDeleteError(null);
            }}
            onConfirm={() => {
              setDeleteError(null);
              startTransition(async () => {
                const result = await deleteGradoAction(deletingGrado.id);

                if (!result.ok) {
                  setDeleteError(result.message ?? "No se pudo eliminar.");
                  return;
                }

                setDeletingGrado(null);
                router.refresh();
              });
            }}
            title="¿Eliminar este grado?"
          />
        ) : null}
      </CrudModal>
    </div>
  );
}

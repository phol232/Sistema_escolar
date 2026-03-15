"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, GraduationCap, Plus, Trash2 } from "lucide-react";

import {
  deleteAnioEscolarAction,
  deleteGradoAction,
  deleteNivelAction,
  upsertAnioEscolarAction,
  upsertGradoAction,
  upsertNivelAction,
} from "@/app/(dashboard)/phase2/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnioEscolarRecord, GradoRecord, NivelRecord, SelectOption } from "@/lib/types/phase2";
import { formatDate } from "@/lib/utils";

import { BooleanField, CrudModal, DangerBar, Field, Input, SelectField, SubmitBar } from "./crud-ui";

interface NivelesGradosManagerProps {
  anios: AnioEscolarRecord[];
  niveles: NivelRecord[];
  grados: GradoRecord[];
  nivelOptions: SelectOption[];
}

const ESTADO_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

function toAnioForm(anio?: AnioEscolarRecord) {
  return {
    anio: anio?.anio.toString() ?? "",
    fecha_inicio: anio?.fecha_inicio ?? "",
    fecha_fin: anio?.fecha_fin ?? "",
    activo: anio?.activo ?? false,
  };
}

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

export function NivelesGradosManager({ anios, niveles, grados, nivelOptions }: NivelesGradosManagerProps) {
  const router = useRouter();
  const [localAnios, setLocalAnios] = useState(anios);
  const [localNiveles, setLocalNiveles] = useState(niveles);
  const [localNivelOptions, setLocalNivelOptions] = useState(nivelOptions);
  const [localGrados, setLocalGrados] = useState(grados);

  const [manageAniosOpen, setManageAniosOpen] = useState(false);
  const [manageNivelesOpen, setManageNivelesOpen] = useState(false);
  const [gradoFormOpen, setGradoFormOpen] = useState(false);
  const [anioFormOpen, setAnioFormOpen] = useState(false);
  const [nivelFormOpen, setNivelFormOpen] = useState(false);

  const [editingGrado, setEditingGrado] = useState<GradoRecord | null>(null);
  const [editingAnio, setEditingAnio] = useState<AnioEscolarRecord | null>(null);
  const [editingNivel, setEditingNivel] = useState<NivelRecord | null>(null);

  const [deletingGrado, setDeletingGrado] = useState<GradoRecord | null>(null);
  const [deletingAnio, setDeletingAnio] = useState<AnioEscolarRecord | null>(null);
  const [deletingNivel, setDeletingNivel] = useState<NivelRecord | null>(null);

  const [gradoForm, setGradoForm] = useState(toGradoForm());
  const [anioForm, setAnioForm] = useState(toAnioForm());
  const [nivelForm, setNivelForm] = useState(toNivelForm());

  const [gradoError, setGradoError] = useState<string | null>(null);
  const [anioError, setAnioError] = useState<string | null>(null);
  const [nivelError, setNivelError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [gradoSearch, setGradoSearch] = useState("");
  const [gradoEstadoFilter, setGradoEstadoFilter] = useState("todos");
  const [gradoNivelFilter, setGradoNivelFilter] = useState("todos");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalAnios(anios);
    setLocalNiveles(niveles);
    setLocalNivelOptions(nivelOptions);
    setLocalGrados(grados);
  }, [anios, niveles, grados, nivelOptions]);

  const sortedGrados = useMemo(
    () =>
      [...localGrados].sort((left, right) => {
        if (left.nivel_nombre === right.nivel_nombre) {
          return left.orden - right.orden;
        }
        return left.nivel_nombre.localeCompare(right.nivel_nombre);
      }),
    [localGrados],
  );

  const sortedAnios = useMemo(() => [...localAnios].sort((left, right) => right.anio - left.anio), [localAnios]);
  const sortedNiveles = useMemo(() => [...localNiveles].sort((left, right) => left.nombre.localeCompare(right.nombre)), [localNiveles]);
  const nivelFilterOptions = useMemo(
    () => [{ value: "todos", label: "Todos los niveles" }, ...sortedNiveles.map((nivel) => ({ value: nivel.id, label: nivel.nombre }))],
    [sortedNiveles],
  );
  const estadoFilterOptions = useMemo(
    () => [
      { value: "todos", label: "Todos los estados" },
      { value: "activo", label: "Activos" },
      { value: "inactivo", label: "Inactivos" },
    ],
    [],
  );
  const filteredGrados = useMemo(() => {
    const search = gradoSearch.trim().toLowerCase();

    return sortedGrados.filter((grado) => {
      if (gradoEstadoFilter !== "todos" && grado.estado !== gradoEstadoFilter) {
        return false;
      }

      if (gradoNivelFilter !== "todos" && grado.nivel_id !== gradoNivelFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const text = `${grado.nivel_nombre} ${grado.nombre} ${grado.orden}`.toLowerCase();
      return text.includes(search);
    });
  }, [gradoEstadoFilter, gradoNivelFilter, gradoSearch, sortedGrados]);

  function closeGradoForm() {
    setGradoFormOpen(false);
    setEditingGrado(null);
    setGradoError(null);
    setGradoForm(toGradoForm());
  }

  function closeAnioForm() {
    setAnioFormOpen(false);
    setEditingAnio(null);
    setAnioError(null);
    setAnioForm(toAnioForm());
  }

  function closeNivelForm() {
    setNivelFormOpen(false);
    setEditingNivel(null);
    setNivelError(null);
    setNivelForm(toNivelForm());
  }

  function submitGrado(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGradoError(null);

    if (localNivelOptions.length === 0) {
      setGradoError("Primero registra un nivel para poder crear grados.");
      return;
    }

    startTransition(async () => {
      const result = await upsertGradoAction({
        id: editingGrado?.id ?? null,
        values: gradoForm,
      });

      if (!result.ok) {
        setGradoError(result.message ?? "No se pudo guardar el grado.");
        return;
      }

      const parsedOrden = Number(gradoForm.orden);
      const nivelNombre = localNivelOptions.find((item) => item.value === gradoForm.nivel_id)?.label ?? "Nivel";
      const optimistic: GradoRecord = {
        id: editingGrado?.id ?? `tmp-${Date.now()}`,
        nivel_id: gradoForm.nivel_id,
        nivel_nombre: nivelNombre,
        nombre: gradoForm.nombre,
        orden: Number.isFinite(parsedOrden) ? parsedOrden : 1,
        estado: gradoForm.estado as GradoRecord["estado"],
      };

      setLocalGrados((current) => {
        if (editingGrado) {
          return current.map((row) => (row.id === editingGrado.id ? optimistic : row));
        }
        return [optimistic, ...current];
      });

      closeGradoForm();
      router.refresh();
    });
  }

  function submitAnio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnioError(null);

    startTransition(async () => {
      const result = await upsertAnioEscolarAction({
        id: editingAnio?.id ?? null,
        values: anioForm,
      });

      if (!result.ok) {
        setAnioError(result.message ?? "No se pudo guardar el ano escolar.");
        return;
      }

      const parsedYear = Number(anioForm.anio);
      const optimistic: AnioEscolarRecord = {
        id: editingAnio?.id ?? `tmp-${Date.now()}`,
        anio: Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear(),
        fecha_inicio: anioForm.fecha_inicio,
        fecha_fin: anioForm.fecha_fin,
        activo: anioForm.activo,
      };

      setLocalAnios((current) => {
        let updated = current;
        if (editingAnio) {
          updated = current.map((row) => (row.id === editingAnio.id ? optimistic : row));
        } else {
          updated = [optimistic, ...current];
        }

        if (optimistic.activo) {
          return updated.map((row) => (row.id === optimistic.id ? row : { ...row, activo: false }));
        }

        return updated;
      });

      closeAnioForm();
      router.refresh();
    });
  }

  function submitNivel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNivelError(null);

    startTransition(async () => {
      const result = await upsertNivelAction({
        id: editingNivel?.id ?? null,
        values: nivelForm,
      });

      if (!result.ok) {
        setNivelError(result.message ?? "No se pudo guardar el nivel.");
        return;
      }

      const optimisticId = editingNivel?.id ?? `tmp-${Date.now()}`;
      const optimistic: NivelRecord = {
        id: optimisticId,
        codigo: nivelForm.codigo,
        nombre: nivelForm.nombre,
        estado: nivelForm.estado as NivelRecord["estado"],
      };

      setLocalNiveles((current) => {
        if (editingNivel) {
          return current.map((row) => (row.id === editingNivel.id ? optimistic : row));
        }
        return [optimistic, ...current];
      });

      setLocalNivelOptions((current) => {
        const option = {
          value: optimisticId,
          label: nivelForm.nombre,
          helper: nivelForm.codigo,
        };

        if (editingNivel) {
          return current.map((item) => (item.value === editingNivel.id ? option : item));
        }

        return [option, ...current];
      });

      if (editingNivel) {
        setLocalGrados((current) =>
          current.map((row) => (row.nivel_id === editingNivel.id ? { ...row, nivel_nombre: optimistic.nombre } : row)),
        );
      }

      closeNivelForm();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-primary" />
              Grados
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setManageAniosOpen(true)} type="button" variant="outline">
                Gestionar anios
              </Button>
              <Button onClick={() => setManageNivelesOpen(true)} type="button" variant="outline">
                Gestionar niveles
              </Button>
              <Button
                className="gap-2"
                onClick={() => {
                  setEditingGrado(null);
                  setGradoForm(toGradoForm());
                  setGradoError(null);
                  setGradoFormOpen(true);
                }}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Nuevo grado
              </Button>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_220px]">
            <Input
              placeholder="Buscar grado o nivel"
              value={gradoSearch}
              onChange={(event) => setGradoSearch(event.target.value)}
            />
            <SelectField
              options={nivelFilterOptions}
              value={gradoNivelFilter}
              onChange={(event) => setGradoNivelFilter(event.target.value)}
            />
            <SelectField
              options={estadoFilterOptions}
              value={gradoEstadoFilter}
              onChange={(event) => setGradoEstadoFilter(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {sortedGrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No hay grados registrados.
            </div>
          ) : filteredGrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No hay resultados con esos filtros.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredGrados.map((grado) => (
                <div key={grado.id} className="rounded-xl border border-border bg-card p-4 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{grado.nivel_nombre}</p>
                      <p className="text-base font-semibold text-foreground">{grado.nombre}</p>
                    </div>
                    <StatusBadge status={grado.estado} />
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">Orden: {grado.orden}</div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        setEditingGrado(grado);
                        setGradoForm(toGradoForm(grado));
                        setGradoError(null);
                        setGradoFormOpen(true);
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setDeleteError(null);
                        setDeletingGrado(grado);
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CrudModal
        description="Selecciona nivel, nombre, orden y estado."
        onClose={closeGradoForm}
        open={gradoFormOpen}
        title={editingGrado ? "Editar grado" : "Nuevo grado"}
      >
        <form className="space-y-4" onSubmit={submitGrado}>
          <Field label="Nivel">
            <SelectField
              options={localNivelOptions}
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
          <SubmitBar error={gradoError} isPending={isPending} onCancel={closeGradoForm} submitLabel={editingGrado ? "Guardar cambios" : "Crear grado"} />
        </form>
      </CrudModal>

      <CrudModal
        description="Listado de aÃƒÂ±os con acciones de crear, editar y eliminar."
        onClose={() => {
          setManageAniosOpen(false);
          closeAnioForm();
        }}
        open={manageAniosOpen}
        title="Gestion de aÃƒÂ±os"
        variant="sheet"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={() => {
                setEditingAnio(null);
                setAnioForm(toAnioForm());
                setAnioError(null);
                setAnioFormOpen(true);
              }}
              size="sm"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Nuevo aÃƒÂ±o
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Anio</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Inicio</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Fin</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Activo</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedAnios.map((anio) => (
                  <tr key={anio.id}>
                    <td className="px-3 py-2 font-medium">{anio.anio}</td>
                    <td className="px-3 py-2">{formatDate(anio.fecha_inicio)}</td>
                    <td className="px-3 py-2">{formatDate(anio.fecha_fin)}</td>
                    <td className="px-3 py-2">{anio.activo ? "Si" : "No"}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            setEditingAnio(anio);
                            setAnioForm(toAnioForm(anio));
                            setAnioError(null);
                            setAnioFormOpen(true);
                          }}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingAnio(anio);
                          }}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedAnios.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                      No hay aÃƒÂ±os registrados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </CrudModal>

      <CrudModal
        description="Listado de niveles con acciones de crear, editar y eliminar."
        onClose={() => {
          setManageNivelesOpen(false);
          closeNivelForm();
        }}
        open={manageNivelesOpen}
        title="Gestion de niveles"
        variant="sheet"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={() => {
                setEditingNivel(null);
                setNivelForm(toNivelForm());
                setNivelError(null);
                setNivelFormOpen(true);
              }}
              size="sm"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Nuevo nivel
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Codigo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Nombre</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Estado</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedNiveles.map((nivel) => (
                  <tr key={nivel.id}>
                    <td className="px-3 py-2 font-medium">{nivel.codigo}</td>
                    <td className="px-3 py-2">{nivel.nombre}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={nivel.estado} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            setEditingNivel(nivel);
                            setNivelForm(toNivelForm(nivel));
                            setNivelError(null);
                            setNivelFormOpen(true);
                          }}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingNivel(nivel);
                          }}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedNiveles.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={4}>
                      No hay niveles registrados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </CrudModal>

      <CrudModal
        description="Completa los datos del aÃƒÂ±o escolar."
        onClose={closeAnioForm}
        open={anioFormOpen}
        title={editingAnio ? "Editar aÃƒÂ±o" : "Nuevo aÃƒÂ±o"}
      >
        <form className="space-y-4" onSubmit={submitAnio}>
          <Field label="Anio">
            <Input value={anioForm.anio} onChange={(event) => setAnioForm((current) => ({ ...current, anio: event.target.value }))} />
          </Field>
          <BooleanField
            checked={anioForm.activo}
            label="Marcar como aÃƒÂ±o activo"
            onChange={(checked) => setAnioForm((current) => ({ ...current, activo: checked }))}
          />
          <Field label="Fecha de inicio">
            <Input
              type="date"
              value={anioForm.fecha_inicio}
              onChange={(event) => setAnioForm((current) => ({ ...current, fecha_inicio: event.target.value }))}
            />
          </Field>
          <Field label="Fecha de fin">
            <Input
              type="date"
              value={anioForm.fecha_fin}
              onChange={(event) => setAnioForm((current) => ({ ...current, fecha_fin: event.target.value }))}
            />
          </Field>
          <SubmitBar error={anioError} isPending={isPending} onCancel={closeAnioForm} submitLabel={editingAnio ? "Guardar cambios" : "Crear anio"} />
        </form>
      </CrudModal>

      <CrudModal
        description="Completa los datos del nivel."
        onClose={closeNivelForm}
        open={nivelFormOpen}
        title={editingNivel ? "Editar nivel" : "Nuevo nivel"}
      >
        <form className="space-y-4" onSubmit={submitNivel}>
          <Field label="Codigo">
            <Input
              maxLength={3}
              placeholder="PRI"
              value={nivelForm.codigo}
              onChange={(event) =>
                setNivelForm((current) => ({
                  ...current,
                  codigo: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                }))
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">Usa un codigo corto de 2 a 3 caracteres (ej: PRI, SEC).</p>
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
          <SubmitBar error={nivelError} isPending={isPending} onCancel={closeNivelForm} submitLabel={editingNivel ? "Guardar cambios" : "Crear nivel"} />
        </form>
      </CrudModal>

      <CrudModal onClose={() => setDeletingGrado(null)} open={Boolean(deletingGrado)} title="Eliminar grado">
        {deletingGrado ? (
          <DangerBar
            description={`Se eliminara el grado ${deletingGrado.nombre}.`}
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

                setLocalGrados((current) => current.filter((row) => row.id !== deletingGrado.id));
                setDeletingGrado(null);
                router.refresh();
              });
            }}
            title="Seguro que quieres eliminar este grado?"
          />
        ) : null}
      </CrudModal>

      <CrudModal onClose={() => setDeletingAnio(null)} open={Boolean(deletingAnio)} title="Eliminar aÃƒÂ±o">
        {deletingAnio ? (
          <DangerBar
            description={`Se eliminara el aÃƒÂ±o ${deletingAnio.anio}.`}
            error={deleteError}
            isPending={isPending}
            onCancel={() => {
              setDeletingAnio(null);
              setDeleteError(null);
            }}
            onConfirm={() => {
              setDeleteError(null);
              startTransition(async () => {
                const result = await deleteAnioEscolarAction(deletingAnio.id);
                if (!result.ok) {
                  setDeleteError(result.message ?? "No se pudo eliminar.");
                  return;
                }

                setLocalAnios((current) => current.filter((row) => row.id !== deletingAnio.id));
                setDeletingAnio(null);
                router.refresh();
              });
            }}
            title="Seguro que quieres eliminar este aÃƒÂ±o?"
          />
        ) : null}
      </CrudModal>

      <CrudModal onClose={() => setDeletingNivel(null)} open={Boolean(deletingNivel)} title="Eliminar nivel">
        {deletingNivel ? (
          <DangerBar
            description={`Se eliminara el nivel ${deletingNivel.nombre}.`}
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

                setLocalNiveles((current) => current.filter((row) => row.id !== deletingNivel.id));
                setLocalNivelOptions((current) => current.filter((item) => item.value !== deletingNivel.id));
                setLocalGrados((current) => current.filter((row) => row.nivel_id !== deletingNivel.id));
                setDeletingNivel(null);
                router.refresh();
              });
            }}
            title="Seguro que quieres eliminar este nivel?"
          />
        ) : null}
      </CrudModal>
    </div>
  );
}

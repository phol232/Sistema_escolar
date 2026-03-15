"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, IdCard, LockKeyhole, Mail, Plus, ShieldCheck, UserRound, Users } from "lucide-react";
import { useForm } from "react-hook-form";

import { registerUserByAdminAction } from "@/app/(dashboard)/configuracion/usuarios/actions";
import { CrudModal } from "@/components/phase2/crud-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputShell } from "@/components/ui/input-shell";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/constants";
import { adminRegisterSchema, type AdminRegisterFormValues } from "@/lib/validations/auth.schema";

export interface AdminUserRow {
  id: string;
  fullName: string;
  dni: string;
  email: string;
  role: string;
  username: string;
  estado: string;
  createdAt: string;
}

interface AdminUserRegisterFormProps {
  users: AdminUserRow[];
}

export function AdminUserRegisterForm({ users }: AdminUserRegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localUsers, setLocalUsers] = useState(users);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const form = useForm<AdminRegisterFormValues>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      dni: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "super_admin",
    },
  });

  function openCreateModal() {
    setServerError(null);
    setServerSuccess(null);
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    setIsCreateOpen(false);
    setServerError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    form.reset({
      nombres: "",
      apellidos: "",
      dni: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: form.getValues("role") ?? "super_admin",
    });
  }

  function onSubmit(values: AdminRegisterFormValues) {
    setServerError(null);
    setServerSuccess(null);

    startTransition(async () => {
      const result = await registerUserByAdminAction(values);

      if (!result.ok) {
        setServerError(result.message ?? "No se pudo crear el usuario.");
        return;
      }

      const fullName = `${values.nombres.trim()} ${values.apellidos.trim()}`.trim();
      const usernameBase = values.email.split("@")[0]?.toLowerCase() ?? "usuario";
      setLocalUsers((current) => [
        {
          id: `tmp-${Date.now()}`,
          fullName,
          dni: values.dni,
          email: values.email.toLowerCase(),
          role: values.role,
          username: usernameBase,
          estado: "activo",
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);

      setServerSuccess(result.message ?? "Usuario creado correctamente.");
      closeCreateModal();
      router.refresh();
    });
  }

  const sortedUsers = useMemo(
    () =>
      [...localUsers].sort((left, right) => {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }),
    [localUsers],
  );
  const filteredUsers = useMemo(() => {
    const query = usersSearch.trim().toLowerCase();
    if (!query) {
      return sortedUsers;
    }

    return sortedUsers.filter((user) => {
      const text = `${user.fullName} ${user.dni} ${user.email} ${user.username} ${user.role} ${user.estado}`.toLowerCase();
      return text.includes(query);
    });
  }, [sortedUsers, usersSearch]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Solo super_admin
              </span>
              <CardTitle>Gestion de usuarios</CardTitle>
            </div>
            <Button className="gap-2" onClick={openCreateModal} type="button">
              <Plus className="h-4 w-4" />
              Nuevo usuario
            </Button>
          </div>
        </CardHeader>
        {serverSuccess ? (
          <CardContent className="pt-0">
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {serverSuccess}
            </p>
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Usuarios registrados
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {filteredUsers.length}
              {usersSearch.trim() ? `/${sortedUsers.length}` : ""}
            </span>
          </div>
          <InputShell filled={Boolean(usersSearch.trim())}>
            <Input
              className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              onChange={(event) => setUsersSearch(event.target.value)}
              placeholder="Buscar por nombre, dni, correo o rol"
              value={usersSearch}
            />
          </InputShell>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">Nombre</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">DNI</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">Correo</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">Rol</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">Username</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="align-top hover:bg-muted/20">
                  <td className="px-4 py-3.5 font-medium text-foreground">{user.fullName}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{user.dni}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{user.username}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium">
                      {user.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={6}>
                    No hay usuarios registrados todavia.
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={6}>
                    No hay resultados con ese filtro.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <CrudModal
        description="Crea usuario en auth.users y sincroniza personas + usuarios."
        onClose={closeCreateModal}
        open={isCreateOpen}
        title="Registrar nuevo usuario"
        variant="sheet"
      >
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="nombres"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Nombres</FormLabel>
                    <FormControl>
                      <InputShell filled={Boolean(field.value)}>
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <Input className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" placeholder="Nombres" {...field} />
                      </InputShell>
                    </FormControl>
                    {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellidos"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <InputShell filled={Boolean(field.value)}>
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <Input
                          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                          placeholder="Apellido paterno y materno"
                          {...field}
                        />
                      </InputShell>
                    </FormControl>
                    {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="dni"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl>
                      <InputShell filled={Boolean(field.value)}>
                        <IdCard className="h-4 w-4 text-muted-foreground" />
                        <Input
                          className="h-10 border-0 bg-transparent px-0 uppercase shadow-none focus-visible:ring-0"
                          maxLength={15}
                          placeholder="12345678"
                          {...field}
                        />
                      </InputShell>
                    </FormControl>
                    {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <InputShell filled={Boolean(field.value)}>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                          placeholder="correo@colegio.edu.pe"
                          type="email"
                          {...field}
                        />
                      </InputShell>
                    </FormControl>
                    {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Contrasena</FormLabel>
                    <FormControl>
                      <InputShell filled={Boolean(field.value)}>
                        <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                        <Input
                          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                          placeholder="********"
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          onClick={() => setShowPassword((current) => !current)}
                          type="button"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </InputShell>
                    </FormControl>
                    {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Confirmar contrasena</FormLabel>
                    <FormControl>
                      <InputShell filled={Boolean(field.value)}>
                        <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                        <Input
                          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                          placeholder="********"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          aria-label={showConfirmPassword ? "Ocultar confirmacion" : "Mostrar confirmacion"}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          type="button"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </InputShell>
                    </FormControl>
                    {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <FormControl>
                      <InputShell filled={Boolean(field.value)}>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <select className="h-10 w-full border-0 bg-transparent px-0 text-sm outline-none" onChange={field.onChange} value={field.value}>
                          {ALL_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </InputShell>
                    </FormControl>
                    {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                  </FormItem>
                )}
              />
            </div>

            {serverError ? <FormMessage>{serverError}</FormMessage> : null}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button onClick={closeCreateModal} type="button" variant="outline">
                Cancelar
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Creando usuario..." : "Crear usuario"}
              </Button>
            </div>
          </form>
        </Form>
      </CrudModal>
    </div>
  );
}

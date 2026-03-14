"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, IdCard, LockKeyhole, Mail, ShieldCheck, UserRound, Users } from "lucide-react";
import { useForm } from "react-hook-form";

import { registerUserByAdminAction } from "@/app/(dashboard)/configuracion/usuarios/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  function onSubmit(values: AdminRegisterFormValues) {
    setServerError(null);
    setServerSuccess(null);

    startTransition(async () => {
      const result = await registerUserByAdminAction(values);

      if (!result.ok) {
        setServerError(result.message ?? "No se pudo crear el usuario.");
        return;
      }

      setServerSuccess(result.message ?? "Usuario creado correctamente.");
      form.reset({
        nombres: "",
        apellidos: "",
        dni: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: values.role,
      });
      router.refresh();
    });
  }

  const authInputShellClass =
    "flex items-center gap-3 rounded-lg border border-input bg-card px-3 shadow-xs transition-colors focus-within:border-primary/40 focus-within:bg-primary/[0.06] focus-within:ring-4 focus-within:ring-ring/15 data-[filled=true]:border-primary/20 data-[filled=true]:bg-primary/[0.06]";

  const sortedUsers = useMemo(
    () =>
      [...users].sort((left, right) => {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }),
    [users],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Solo super_admin
          </span>
          <CardTitle>Registrar nuevo usuario</CardTitle>
          <CardDescription>
            Crea usuario en `auth.users` y registra sus datos en `personas` + `usuarios`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nombres"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <div className={authInputShellClass} data-filled={Boolean(field.value)}>
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          <Input
                            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                            placeholder="Nombres"
                            {...field}
                          />
                        </div>
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
                        <div className={authInputShellClass} data-filled={Boolean(field.value)}>
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          <Input
                            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                            placeholder="Apellido paterno y materno"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                        <div className={authInputShellClass} data-filled={Boolean(field.value)}>
                          <IdCard className="h-4 w-4 text-muted-foreground" />
                          <Input
                            className="h-10 border-0 bg-transparent px-0 uppercase shadow-none focus-visible:ring-0"
                            maxLength={15}
                            placeholder="12345678"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Correo</FormLabel>
                      <FormControl>
                        <div className={authInputShellClass} data-filled={Boolean(field.value)}>
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input
                            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                            placeholder="correo@colegio.edu.pe"
                            type="email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className={authInputShellClass} data-filled={Boolean(field.value)}>
                          <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                          <Input
                            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                            placeholder="********"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            onClick={() => setShowPassword((current) => !current)}
                            type="button"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <div className={authInputShellClass} data-filled={Boolean(field.value)}>
                          <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                          <Input
                            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                            placeholder="********"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            onClick={() => setShowConfirmPassword((current) => !current)}
                            type="button"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                        <div className={authInputShellClass} data-filled>
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          <select
                            className="h-10 w-full border-0 bg-transparent px-0 text-sm outline-none"
                            onChange={field.onChange}
                            value={field.value}
                          >
                            {ALL_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </FormControl>
                      {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                    </FormItem>
                  )}
                />
              </div>

              {serverError ? <FormMessage>{serverError}</FormMessage> : null}
              {serverSuccess ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {serverSuccess}
                </p>
              ) : null}

              <Button className="w-full md:w-auto" disabled={isPending} type="submit">
                {isPending ? "Creando usuario..." : "Crear usuario"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Usuarios registrados
          </CardTitle>
          <CardDescription>Total: {users.length}</CardDescription>
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
              {sortedUsers.map((user) => (
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
                    No hay usuarios registrados todavía.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

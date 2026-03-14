"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, IdCard, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";

import { registerAction } from "@/app/(auth)/register/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type RegisterFormValues, registerSchema } from "@/lib/validations/auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      dni: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    startTransition(async () => {
      const result = await registerAction(values);

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      router.replace((result.redirectTo ?? "/inicio") as Route);
      router.refresh();
    });
  }

  const authInputShellClass =
    "flex items-center gap-3 rounded-lg border border-input bg-card px-3 shadow-xs transition-colors focus-within:border-primary/40 focus-within:bg-primary/[0.06] focus-within:ring-4 focus-within:ring-ring/15 data-[filled=true]:border-primary/20 data-[filled=true]:bg-primary/[0.06]";

  return (
    <Card className="h-full min-h-[680px] w-full border-border bg-card shadow-lg">
      <CardHeader className="space-y-3 border-b border-border pb-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Crear cuenta
          </span>
          <span className="hidden rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
            Supabase Auth
          </span>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">Registro de usuario</CardTitle>
          <CardDescription className="max-w-md text-sm leading-6">
            Completa tus datos para crear tu acceso al sistema escolar.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
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
                          autoComplete="given-name"
                          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                          placeholder="Juan Carlos"
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
                          autoComplete="family-name"
                          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                          placeholder="Pérez Gómez"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                          autoComplete="off"
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
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <div className={authInputShellClass} data-filled={Boolean(field.value)}>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          autoComplete="email"
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

            <div className="grid gap-4 sm:grid-cols-2">
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
                          autoComplete="new-password"
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
                          autoComplete="new-password"
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
            </div>

            {serverError ? <FormMessage>{serverError}</FormMessage> : null}

            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
              Al registrarte se crea tu usuario en Auth y en las tablas `personas` + `usuarios`.
            </div>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col items-start gap-3 border-t border-border pt-5 text-sm">
        <p className="text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={"/login" as Route}>
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

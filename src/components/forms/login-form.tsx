"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BadgeCheck, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { loginAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputShell } from "@/components/ui/input-shell";
import { cn } from "@/lib/utils";
import { type LoginFormValues, loginSchema } from "@/lib/validations/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberSession: true,
    },
  });

  function onSubmit(values: LoginFormValues) {
    setServerError(null);

    startTransition(async () => {
      const result = await loginAction(values);

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      router.replace(result.redirectTo as Route);
      router.refresh();
    });
  }

  const isRegistered = searchParams.get("registered") === "1";

  return (
    <Card className="h-full min-h-[680px] w-full border-border bg-card shadow-lg">
      <CardHeader className="space-y-3 border-b border-border pb-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Acceso al sistema
          </span>
          <span className="hidden rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
            Colegio
          </span>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription className="max-w-md text-sm leading-6">
            Ingresa con tu cuenta para continuar.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {isRegistered ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Cuenta creada correctamente. Inicia sesión para continuar.
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Alumno
          </span>
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Familia
          </span>
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Docente
          </span>
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Personal
          </span>
        </div>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                        autoComplete="email"
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
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <InputShell filled={Boolean(field.value)}>
                      <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                      <Input
                        autoComplete="current-password"
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
                    </InputShell>
                  </FormControl>
                  {fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rememberSession"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      checked={field.value}
                      className={cn(
                        "h-4 w-4 rounded-sm border border-input text-primary accent-[var(--primary)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
                      )}
                      onChange={(event) => field.onChange(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-sm text-foreground">Mantener sesión activa</span>
                  </label>
                  <Link
                    className="text-sm font-medium text-primary underline-offset-4 transition hover:text-primary/80 hover:underline"
                    href="/recuperar"
                  >
                    Recuperar contraseña
                  </Link>
                </FormItem>
              )}
            />
            {serverError ? <FormMessage>{serverError}</FormMessage> : null}
            <div className="grid gap-3">
              <Button className="w-full" disabled={isPending} type="submit">
                {isPending ? "Validando acceso..." : "Entrar al sistema"}
              </Button>
            </div>
            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold">Si no puedes ingresar</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                  Revisa tu correo y contraseña.
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                  Si el problema sigue, pide ayuda en el colegio.
                </li>
              </ul>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={"/register" as Route}>
                Regístrate
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="mt-auto border-t border-border pt-5">
        <Button asChild className="w-full border-violet-600 bg-violet-600 text-white hover:bg-violet-700 hover:text-white" type="button">
          <Link href="https://wankoraep.com/" rel="noreferrer" target="_blank">
            Desarrollado por WANKORAEP
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

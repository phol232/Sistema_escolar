"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center px-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Ocurrió un error inesperado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Reintenta la acción. Si el problema continúa, revisa la configuración de Supabase.</p>
            <Button onClick={reset}>Intentar nuevamente</Button>
          </CardContent>
        </Card>
      </body>
    </html>
  );
}

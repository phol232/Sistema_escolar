import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Página no encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">La ruta solicitada no existe o aún no fue implementada.</p>
          <Button asChild>
            <Link href="/inicio">Ir al dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

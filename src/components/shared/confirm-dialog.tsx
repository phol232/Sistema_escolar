"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <Button variant="outline" onClick={() => setIsVisible(true)}>
        Abrir confirmación
      </Button>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" onClick={() => setIsVisible(false)}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            onConfirm?.();
            setIsVisible(false);
          }}
        >
          {confirmLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}

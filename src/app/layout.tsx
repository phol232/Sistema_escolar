import type { Metadata } from "next";

import "@/styles/globals.css";

import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Plataforma de gestión escolar para matrícula, asistencia, evaluaciones, tesorería y configuración.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-font="inter" data-theme-preset="soft-pop" lang="es">
      <body>{children}</body>
    </html>
  );
}

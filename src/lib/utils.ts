import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  value: Date | string,
  locale = "es-PE",
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
  },
) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatCurrency(value: number, currency = "PEN", locale = "es-PE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildFullName(parts: {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
}) {
  return [parts.nombres, parts.apellido_paterno, parts.apellido_materno].filter(Boolean).join(" ");
}

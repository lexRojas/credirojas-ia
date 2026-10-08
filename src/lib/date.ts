export type DateOnly = string; // YYYY-MM-DD

export const BUSINESS_TIME_ZONE = "America/Costa_Rica";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnly(value: string): boolean {
  return DATE_ONLY_PATTERN.test(value);
}

export function todayCR(date = new Date()): DateOnly {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("No se pudo calcular la fecha de negocio");
  }

  return `${year}-${month}-${day}`;
}

export function toDateOnly(date: Date): DateOnly {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value: DateOnly): Date {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Fecha inválida: ${value}`);
  }

  return new Date(year, month - 1, day);
}

export function formatDateOnly(value?: DateOnly | null): string {
  if (!value) return "";
  if (!isDateOnly(value)) return value;

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function addMonthsDateOnly(value: DateOnly, months: number): DateOnly {
  const date = parseDateOnly(value);
  date.setMonth(date.getMonth() + months);

  return toDateOnly(date);
}

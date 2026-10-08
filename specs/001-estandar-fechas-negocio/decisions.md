# Decisions

## 2026-10-08 - Formato canónico de fechas de negocio

Contexto: La mayoría de fechas de negocio están como `String` en Prisma y se comparan por rango.

Decisión: Usar `YYYY-MM-DD` como formato canónico para fechas de negocio y obtener “hoy” con zona `America/Costa_Rica`.

Consecuencia: No se requiere migración Prisma. Los nuevos cambios deben usar helpers de `src/lib/date.ts` y evitar `toISOString()` para fechas de negocio.

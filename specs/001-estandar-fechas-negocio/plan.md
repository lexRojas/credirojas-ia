# Plan: Estándar de fechas de negocio

## Diseño técnico

- Crear `src/lib/date.ts` con helpers para `DateOnly` (`YYYY-MM-DD`).
- Usar `Intl.DateTimeFormat` con `America/Costa_Rica` para obtener “hoy” de negocio.
- Formatear `YYYY-MM-DD` separando año, mes y día sin construir `new Date(fecha)`.
- Convertir `Date` a `YYYY-MM-DD` usando partes locales, no UTC.

## Archivos a modificar

- `src/lib/date.ts`: nuevo helper centralizado.
- `src/lib/calculos.ts`: evitar `toISOString()` en fechas proyectadas.
- Pantallas/actions con generación directa de fecha actual de negocio.
- `docs/constitution.md`, `AGENTS.md`, `MEMORY.md`: documentar regla.

## Validaciones

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build` si se va a publicar a rama productiva.

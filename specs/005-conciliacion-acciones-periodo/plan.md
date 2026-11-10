# Plan: Conciliación de acciones por periodo y mes

## Estado

Approved

## Diseño técnico

Se extenderán los parámetros internos de `obtenerResumenPeriodo` con filtros contables opcionales para acciones. La agregación de acciones sumará cantidad y monto con esos filtros, mientras las demás agregaciones conservarán el rango de fechas. La pantalla enviará filtros explícitos para YTD y cada mes.

## Archivos a modificar

- `src/app/api/dashboard/actions.ts`
  - Agregar parámetros opcionales `periodoAcciones` y `mesAcciones`.
  - Construir un `Prisma.AccionWhereInput` independiente del rango de fechas.
  - Aceptar meses con y sin cero inicial.
  - Usar el mismo agregado para cantidad y monto de acciones.

- `src/app/(home)/home/administrador/conciliacion/page.tsx`
  - Determinar el año actual con `todayCR()`.
  - Enviar solo periodo para YTD.
  - Enviar periodo y mes para cada columna mensual.
  - Mantener ALL sin filtros contables de acciones.

## Impacto en datos

- No hay cambios de esquema ni migraciones.
- No se modifican datos históricos.
- El resultado de conciliación puede cambiar para registros cuya fecha no coincida con periodo y mes.

## Validaciones

```bash
npm run lint
npx tsc --noEmit
npm run build
```

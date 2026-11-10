# Plan: Mantenimiento de Acciones

## Estado

Approved

## Diseño técnico preliminar

Se reutilizará la ruta y el modelo `Accion` existentes. La pantalla actual será reemplazada por un flujo de selección de un socio activo, filtrado local de sus acciones y operaciones de edición y eliminación respaldadas por server actions. No se requieren cambios de esquema ni migraciones.

## Archivos probables a modificar

- `src/components/Menu.tsx`
  - Renombrar `Ver Acciones x Socio` a `Mantenimiento de Acciones`.

- `src/app/(home)/home/socios/estado_acciones/page.tsx`
  - Sustituir la vista actual.
  - Incorporar selector buscable de un socio activo.
  - Mostrar tabla, filtros, totales filtrados y estados vacíos.
  - Incorporar modal de edición y modal de confirmación de eliminación.

- `src/app/api/acciones/actions.ts`
  - Consultar las acciones de un socio activo seleccionado.
  - Actualizar una acción por `idAccion` con validación server-side.
  - Consultar el valor vigente de una acción para recalcular el monto.
  - Eliminar una acción por `idAccion`.

- `src/types/types.ts`
  - Ajustar o reutilizar tipos de acciones y respuestas si resulta necesario.

## Flujo de datos propuesto

1. Cargar socios activos con la consulta existente o una consulta mínima especializada.
2. Seleccionar un socio y consultar sus acciones ordenadas por `fecha` descendente y luego por `idAccion` descendente.
3. Aplicar en cliente los filtros de periodo, mes y rango de fechas sobre las acciones del socio seleccionado.
4. Abrir el modal de edición con una copia del registro.
5. Derivar periodo y mes coherentes con `fecha` y validar la entrada tanto en cliente como en servidor.
6. Obtener el valor vigente de una acción y calcular `monto_colones = cantidadAcciones × valorAccion`.
7. Actualizar únicamente el registro identificado por `idAccion` y refrescar los datos del socio.
8. Para eliminar, confirmar en un modal y borrar únicamente el registro identificado.

## Reglas técnicas clave

- No editar `idAccion` ni `socioId`.
- Usar `YYYY-MM-DD` para fecha y evitar conversiones UTC.
- Interpretar `periodo` como el año de cuatro dígitos de `fecha` y `mes` como el número de mes sin relleno, en consistencia con la captura actual.
- Exigir `cantidadAcciones` entera y mayor que cero.
- Recalcular el monto con la variable vigente de monto por acción, actualmente consultada mediante la variable de configuración `4`.
- Repetir todas las validaciones críticas en la server action.
- Usar `updateMany`/verificación de resultado o una consulta previa para detectar una acción inexistente sin afectar otro registro.
- Deshabilitar botones durante operaciones asíncronas.
- Aplicar los filtros en conjunto y usar límites inclusivos para fechas.
- Conservar después del filtrado el orden de la acción más reciente a la más antigua, usando `idAccion` descendente para desempatar fechas iguales.
- Limpiar o revalidar filtros al cambiar de socio.

## Impacto en datos

- No requiere migración Prisma.
- Las ediciones modifican registros históricos de `accion`.
- Las eliminaciones son permanentes y aprovechan el comportamiento normal del modelo existente.
- No se agrega auditoría ni recuperación de registros eliminados.

## Riesgos

- Recalcular con el valor vigente puede cambiar el monto histórico respecto al valor usado cuando se creó la acción; este comportamiento fue solicitado para la edición.
- Editar o eliminar acciones puede modificar conciliación, dividendos y capacidad crediticia derivados de esos registros.
- Una fecha válida para la acción debe existir en `Calendario` debido a la relación actual del modelo.
- Debe evitarse que una respuesta asíncrona de un socio anterior reemplace los datos del socio actualmente seleccionado.

## Validaciones requeridas al implementar

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Pendientes antes de implementar

- Aprobar `spec.md` y este plan técnico.

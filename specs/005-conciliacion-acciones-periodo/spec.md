# Spec: Conciliación de acciones por periodo y mes

## Estado

Implemented

## Contexto

La conciliación calcula actualmente `Acciones pagadas` y `Monto total de acciones` filtrando los registros de `Accion` por `fecha`. El criterio de negocio debe usar los campos `periodo` y `mes`, que identifican el periodo contable al que corresponde cada pago.

## Alcance

### Incluye

- Calcular `Acciones pagadas` como la suma de `cantidadAcciones` filtrada por periodo y mes.
- Calcular `Monto total de acciones` como la suma de `monto_colones` filtrada por periodo y mes.
- Para columnas mensuales, filtrar por el periodo actual y el mes de la columna.
- Para YTD, filtrar por el periodo actual sin restringir el mes.
- Para ALL, incluir todos los registros de acciones sin restringir periodo ni mes, incluidos registros con valores nulos.
- Aceptar meses históricos almacenados como `"1"` o `"01"` para enero, y de forma equivalente hasta septiembre.
- Hacer que `periodo` y `mes` prevalezcan sobre `fecha` cuando los valores sean inconsistentes.
- Mantener por fecha los filtros de todos los demás conceptos de conciliación.
- Usar el año de negocio de Costa Rica para determinar el periodo actual.

### No incluye

- Corregir o normalizar datos históricos.
- Cambiar el modelo Prisma o crear migraciones.
- Cambiar la fórmula de `saldoRestante`; esta utilizará naturalmente el nuevo `montoAcciones`.
- Cambiar el significado de `accionesPagadas`, que continúa siendo la suma de unidades y no el conteo de registros.
- Cambiar cálculos de socios, préstamos, pagos, dividendos, ajustes, desafiliaciones o incobrables.

## Requisitos funcionales EARS

- El sistema debe calcular `accionesPagadas` sumando `cantidadAcciones` de los registros que coincidan con el filtro contable de acciones.
- El sistema debe calcular `montoAcciones` sumando `monto_colones` de los registros que coincidan con el filtro contable de acciones.
- Cuando se calcula una columna mensual, el sistema debe filtrar acciones por el periodo actual y el mes de esa columna.
- Cuando se calcula YTD, el sistema debe filtrar acciones únicamente por el periodo actual.
- Cuando se calcula ALL, el sistema debe incluir todas las acciones, aunque `periodo` o `mes` sean nulos.
- Cuando el mes solicitado esté entre enero y septiembre, el sistema debe aceptar tanto el formato sin cero inicial como el formato con cero inicial.
- Si `fecha` no coincide con `periodo` o `mes`, entonces el sistema debe clasificar la acción usando `periodo` y `mes`.
- El sistema debe continuar filtrando por fecha todos los conceptos de conciliación distintos de acciones.
- El sistema debe determinar el periodo actual usando la fecha de negocio de Costa Rica.

## Requisitos no funcionales

- La implementación debe usar Prisma sin consultas SQL manuales.
- La implementación no debe modificar el esquema de base de datos.
- El cambio debe mantener el contrato de respuesta actual de `obtenerResumenPeriodo`.

## Criterios de aceptación

- Octubre y noviembre muestran las sumas correspondientes a sus campos `periodo` y `mes`, independientemente de `fecha`.
- `Acciones pagadas` y `Monto total de acciones` usan exactamente el mismo conjunto de registros.
- YTD incluye todas las acciones del periodo actual.
- ALL incluye todas las acciones históricas, incluidas las que tengan periodo o mes nulo.
- Los demás valores de conciliación conservan su filtro por fecha.
- `saldoRestante` usa el nuevo valor de `montoAcciones` sin alterar su fórmula.
- `npm run lint`, `npx tsc --noEmit` y `npm run build` finalizan correctamente.

## Casos límite

- Acción con periodo o mes nulo.
- Mes almacenado con y sin cero inicial.
- Fecha distinta del periodo o mes contable.
- Periodos futuros incluidos en ALL pero no en YTD.
- Igual número de registros con distinta suma de `cantidadAcciones`.
- Periodo actual sin acciones.

## Preguntas abiertas

No hay preguntas abiertas. El usuario aprobó explícitamente las decisiones de formato, prevalencia y alcance de ALL.

# Decisions

## 2026-11-10 - Implementación completada

Decisión: Marcar la spec como `Implemented` después de aprobar lint, TypeScript y build.

Consecuencia: El cambio queda listo para prueba funcional con datos reales antes de publicar.

## 2026-11-10 - Criterio contable de acciones

Decisión: `accionesPagadas` y `montoAcciones` se filtran por `periodo` y `mes`, no por `fecha`.

Consecuencia: Ambos valores usan el mismo conjunto de acciones y `saldoRestante` recibe el nuevo monto.

## 2026-11-10 - Semántica YTD y ALL

Decisión: YTD filtra por el periodo actual; ALL no filtra periodo ni mes e incluye valores nulos.

Consecuencia: ALL conserva su significado histórico completo.

## 2026-11-10 - Formato de mes

Decisión: Aceptar meses de enero a septiembre con y sin cero inicial.

Consecuencia: La consulta tolera formatos históricos sin modificar los datos.

## 2026-11-10 - Inconsistencias con fecha

Decisión: `periodo` y `mes` prevalecen sobre `fecha` para los cálculos de acciones.

Consecuencia: Una acción se contabiliza en la columna contable indicada por esos campos.

## 2026-11-10 - Documentación operativa

Decisión: No modificar `AGENTS.md` ni `MEMORY.md`.

Consecuencia: La regla específica queda documentada en esta spec sin ampliar la guía global del repositorio.

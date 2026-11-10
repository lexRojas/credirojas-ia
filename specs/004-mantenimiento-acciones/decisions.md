# Decisions

## 2026-11-10 - Implementación completada

Contexto: Se implementó el alcance aprobado y se ejecutaron las validaciones técnicas requeridas.

Decisión: Marcar la spec como `Implemented` y registrar las evidencias autorizadas por el usuario.

Consecuencia: La funcionalidad queda lista para prueba funcional con datos reales y posterior publicación.

## 2026-11-10 - Aprobación de implementación

Contexto: El usuario revisó el alcance, solicitó el orden descendente por fecha y aprobó expresamente la especificación y el plan.

Decisión: Cambiar `spec.md` y `plan.md` a estado `Approved` y proceder con la implementación.

Consecuencia: Se puede modificar código únicamente dentro del alcance documentado.

## 2026-11-10 - Spec inicial

Contexto: La vista de acciones por socio debe convertirse en una pantalla de mantenimiento con edición, eliminación y filtros.

Decisión: Crear la spec `004-mantenimiento-acciones` en estado `Draft` y conservar la ruta actual.

Consecuencia: La implementación queda limitada al alcance aprobado en esta spec.

## 2026-11-10 - Selección de socio

Contexto: La solicitud podía interpretarse como selección de uno o varios socios simultáneamente.

Decisión: Permitir seleccionar un solo socio activo a la vez mediante una lista buscable al inicio de la pantalla.

Consecuencia: La pantalla muestra una sola tabla de acciones y evita mezclar operaciones entre socios.

## 2026-11-10 - Recálculo de monto

Contexto: Al cambiar la cantidad de acciones debía definirse si el monto se editaría independientemente.

Decisión: Recalcular el monto usando la cantidad editada multiplicada por el valor vigente configurado para una acción.

Consecuencia: El monto no se mantiene como un valor independiente durante la edición y puede diferir del valor histórico previo.

## 2026-11-10 - Coherencia temporal

Contexto: El modelo conserva `periodo`, `mes` y `fecha` en campos separados.

Decisión: Exigir que periodo y mes correspondan al año y mes de la fecha antes de actualizar.

Consecuencia: La edición debe validar esta regla en cliente y servidor.

## 2026-11-10 - Eliminación

Contexto: Se solicitó eliminar acciones con confirmación y el modelo no dispone de borrado lógico.

Decisión: Realizar eliminación permanente por `idAccion` después de una confirmación modal explícita.

Consecuencia: No habrá recuperación ni historial dentro de esta funcionalidad.

## 2026-11-10 - Sin cambios de datos

Contexto: Los campos y relaciones necesarios ya existen en el modelo `Accion`.

Decisión: No modificar `prisma/schema.prisma` ni crear migraciones.

Consecuencia: El cambio se limita a menú, interfaz, tipos y server actions.

## 2026-11-10 - Orden de las acciones

Contexto: La consulta debe facilitar la revisión de los pagos más recientes.

Decisión: Mostrar las acciones ordenadas por `fecha` descendente, desde la más reciente hasta la más antigua; para acciones con la misma fecha, usar `idAccion` descendente como desempate.

Consecuencia: La consulta y el filtrado deben conservar ese orden determinista.

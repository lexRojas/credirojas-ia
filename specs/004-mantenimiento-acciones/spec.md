# Spec: Mantenimiento de Acciones

## Estado

Implemented

## Contexto

La opción actual `Acciones -> Ver Acciones x Socio` presenta los estados de acciones, pero no permite corregir ni eliminar registros. Se requiere sustituir esa vista por una pantalla de mantenimiento que permita seleccionar un socio activo, consultar sus acciones, filtrarlas y administrar cada registro.

## Alcance

### Incluye

- Renombrar la opción de menú `Ver Acciones x Socio` a `Mantenimiento de Acciones` conservando la ruta `/home/socios/estado_acciones`.
- Mostrar al inicio de la pantalla una lista buscable de socios activos.
- Permitir seleccionar un solo socio a la vez.
- Mostrar todas las acciones registradas para el socio seleccionado.
- Ordenar las acciones del socio desde la fecha más reciente hasta la más antigua.
- Mostrar las columnas `Id Acción`, `Periodo`, `Mes`, `Fecha`, `Cantidad de acciones`, `Monto` y `Acciones`.
- Mostrar en la columna `Acciones` las operaciones `Editar` y `Eliminar`.
- Permitir filtrar las acciones por periodo, mes y rango inclusivo de fechas.
- Editar una acción mediante una ventana modal.
- Mantener `idAccion` y `socioId` como campos llave no editables.
- Validar que periodo y mes correspondan al año y mes de la fecha.
- Recalcular el monto a partir de la cantidad de acciones y el valor vigente configurado para una acción.
- Eliminar una acción únicamente después de una confirmación modal.
- Actualizar la tabla después de editar o eliminar sin recargar manualmente la página.

### No incluye

- Crear acciones nuevas desde esta pantalla.
- Seleccionar o desplegar varios socios simultáneamente.
- Cambiar el modelo Prisma o crear migraciones.
- Mantener historial o auditoría de ediciones y eliminaciones.
- Cambiar la pantalla `Acciones -> Asignar Acciones`.
- Cambiar el cálculo de conciliación, dividendos o capacidad crediticia.
- Conservar las funciones actuales de envío por correo o exportación XLS de la pantalla sustituida.

## Requisitos funcionales EARS

### Ubiquitous

- El sistema debe mostrar la opción `Mantenimiento de Acciones` dentro del menú `Acciones`.
- El sistema debe conservar para esa opción la ruta `/home/socios/estado_acciones`.
- El sistema debe listar únicamente socios cuyo `estadoSocio` sea `ACTIVO`.
- El sistema debe permitir mantener un solo socio seleccionado a la vez.
- El sistema debe mostrar para cada acción `idAccion`, `periodo`, `mes`, `fecha`, `cantidadAcciones` y `monto_colones`.
- El sistema debe ordenar las acciones por el campo `fecha` de forma descendente, desde la más reciente hasta la más antigua.
- El sistema debe tratar `idAccion` y `socioId` como campos llave no editables.
- El sistema debe manejar las fechas de negocio como texto `YYYY-MM-DD`.
- El sistema debe aplicar conjuntamente los filtros que tengan un valor informado.

### Event-driven

- Cuando el usuario abre `Acciones -> Mantenimiento de Acciones`, el sistema debe mostrar al inicio una lista buscable de socios activos.
- Cuando el usuario selecciona un socio, el sistema debe mostrar todas las acciones asociadas a ese socio.
- Cuando dos acciones tengan la misma fecha, el sistema debe mostrarlas con `idAccion` descendente como criterio secundario para mantener un orden determinista.
- Cuando el usuario informa un periodo, el sistema debe mostrar únicamente las acciones cuyo campo `periodo` coincida con el valor seleccionado.
- Cuando el usuario informa un mes, el sistema debe mostrar únicamente las acciones cuyo campo `mes` coincida con el valor seleccionado.
- Cuando el usuario informa una fecha desde, el sistema debe mostrar únicamente acciones con fecha mayor o igual a esa fecha.
- Cuando el usuario informa una fecha hasta, el sistema debe mostrar únicamente acciones con fecha menor o igual a esa fecha.
- Cuando el usuario presiona `Editar`, el sistema debe abrir una ventana modal con los datos de la acción seleccionada.
- Cuando el usuario modifica la cantidad de acciones, el sistema debe recalcular el monto como `cantidadAcciones × valor vigente de una acción`.
- Cuando el usuario guarda una edición válida, el sistema debe actualizar la acción identificada por `idAccion`, cerrar el modal y refrescar la tabla.
- Cuando el usuario presiona `Eliminar`, el sistema debe abrir una ventana modal que identifique la acción y solicite confirmación.
- Cuando el usuario confirma la eliminación, el sistema debe eliminar la acción identificada por `idAccion`, cerrar el modal y refrescar la tabla.
- Cuando el usuario cancela una edición o eliminación, el sistema debe cerrar el modal sin modificar datos.

### State-driven

- Mientras no haya un socio seleccionado, el sistema no debe mostrar acciones de otro socio y debe indicar que se seleccione uno.
- Mientras una edición o eliminación está en proceso, el sistema debe impedir envíos repetidos de la misma operación.
- Mientras existan filtros activos, los totales y filas visibles deben corresponder al conjunto filtrado.

### Unwanted behavior

- Si el periodo no coincide con el año de la fecha, entonces el sistema debe bloquear la actualización y mostrar un mensaje de validación.
- Si el mes no coincide con el mes de la fecha, entonces el sistema debe bloquear la actualización y mostrar un mensaje de validación.
- Si la cantidad de acciones no es un entero mayor que cero, entonces el sistema debe bloquear la actualización y mostrar un mensaje de validación.
- Si la fecha desde es posterior a la fecha hasta, entonces el sistema debe informar que el rango es inválido y no debe mostrar resultados engañosos.
- Si la acción no existe al intentar editarla o eliminarla, entonces el sistema debe mostrar un error y no debe modificar otros registros.
- Si ocurre un error al actualizar o eliminar, entonces el sistema debe conservar el modal o estado necesario para informar el error y volver a intentar.
- Si el valor vigente de una acción no está disponible o no es válido, entonces el sistema debe bloquear la actualización para evitar guardar un monto incorrecto.

## Requisitos no funcionales

- La actualización y eliminación deben ejecutarse mediante server actions y Prisma.
- Las server actions deben validar nuevamente los datos recibidos; no deben confiar únicamente en la validación del navegador.
- La eliminación debe limitarse al `idAccion` confirmado por el usuario.
- Los montos deben mostrarse con formato de colones costarricenses.
- La interfaz debe ser utilizable en pantallas pequeñas mediante contenedores con desplazamiento horizontal cuando sea necesario.
- La implementación debe mantener las convenciones visuales y de notificaciones existentes.

## Criterios de aceptación

- El menú muestra `Acciones -> Mantenimiento de Acciones` y abre la ruta existente.
- La pantalla muestra una lista buscable compuesta únicamente por socios activos.
- Solo puede seleccionarse un socio a la vez.
- Al seleccionar un socio se muestran todas sus acciones con las siete columnas solicitadas.
- Las acciones aparecen ordenadas por `fecha` descendente y, para fechas iguales, por `idAccion` descendente.
- Los filtros de periodo, mes, fecha desde y fecha hasta funcionan individualmente y en combinación.
- El modal de edición no permite cambiar `idAccion` ni `socioId`.
- El modal permite modificar periodo, mes, fecha y cantidad de acciones.
- Al cambiar la cantidad se recalcula el monto usando el valor vigente de una acción.
- No se guarda una combinación de periodo, mes y fecha incoherente.
- Una edición válida persiste y se refleja inmediatamente en la tabla.
- La eliminación exige confirmación modal y solo elimina después de confirmarla.
- Cancelar cualquiera de los dos modales no modifica datos.
- `npm run lint`, `npx tsc --noEmit` y `npm run build` finalizan correctamente.

## Casos límite

- No existen socios activos.
- El socio seleccionado no tiene acciones.
- Los filtros no producen resultados.
- Solo se informa uno de los extremos del rango de fechas.
- Se informa una fecha desde posterior a la fecha hasta.
- La acción fue eliminada por otra operación antes de confirmar la edición o eliminación.
- La cantidad editada es cero, negativa, decimal o no numérica.
- El periodo o mes almacenado originalmente es nulo.
- El periodo o mes editado no coincide con la fecha.
- El valor vigente configurado para una acción no existe, es cero o es negativo.

## Preguntas abiertas

No hay preguntas abiertas de negocio por ahora.

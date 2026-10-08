# Spec: Desafiliar Socio

## Estado

Approved

## Contexto

El sistema administra socios, acciones, préstamos, pagos, dividendos, reportes y conciliación. Se requiere agregar en el menú `Socios -> Desafiliar` una capacidad para desafiliar un socio sin eliminarlo físicamente de la base de datos.

La desafiliación debe inactivar al socio, liquidar o registrar sus saldos según corresponda, conservar trazabilidad histórica y ajustar reportes administrativos como conciliación.

## Alcance

### Incluye

- Agregar opción de menú `Socios -> Desafiliar`.
- Crear pantalla de desafiliación de socio.
- Permitir acceso solo a usuarios con `rolId = 2` pertenecientes a la Junta Directiva.
- Seleccionar un socio activo y mostrar datos financieros separados:
  - monto por créditos pendientes;
  - ahorros acumulados;
  - dividendos a cancelar;
  - saldo pendiente a entregar al socio o beneficiarios.
- Inactivar el socio para que no aparezca en reportes operativos, listados de abonos, préstamos u otros procesos de socios activos.
- Impedir acceso por login a socios desafiliados.
- Evitar que el socio aparezca como pendiente de pagar cuota ordinaria después de la desafiliación.
- Registrar pagos o abonos sobre préstamos pendientes usando los montos acumulados a favor del socio.
- Registrar pagos incobrables cuando existan saldos de préstamo que no puedan cubrirse con los montos a favor del socio.
- Crear tabla de incobrables con datos descriptivos del caso.
- Crear tabla de desafiliaciones con datos de salida, montos, beneficiarios y pagos.
- Solicitar motivo de salida: `Renuncia`, `Expulsion` o `Fallecimiento`.
- Si el motivo es `Expulsion`, solicitar una justificación obligatoria.
- Si el motivo es `Fallecimiento`, solicitar nombre, cédula y monto asignado de una o más personas beneficiarias.
- Generar comprobante o reporte descargable de la desafiliación.
- Generar el comprobante usando el flujo existente de reportes con Carbone.
- Ajustar conciliación administrativa para mostrar:
  - línea `Pagos por desafiliación`, restando montos pagados a socios o beneficiarios;
  - línea `Pagos incobrables`, restando el saldo final.

### No incluye

- Eliminar físicamente socios ni registros históricos.
- Reafiliar socios desafiliados.
- Cambiar reglas históricas de cálculo de acciones o dividendos fuera del proceso de desafiliación.
- Definir un proceso de aprobación multiusuario para desafiliaciones, salvo que se agregue en otra spec.

## Requisitos funcionales EARS

### Ubiquitous

- El sistema debe conservar físicamente el registro del socio desafiliado y sus relaciones históricas.
- El sistema debe representar la desafiliación mediante un campo explícito de estado del socio y una fecha de salida, no mediante eliminación física.
- El sistema debe impedir que un socio desafiliado aparezca en listados operativos de socios activos.
- El sistema debe impedir que un socio desafiliado acceda mediante login.
- El sistema debe conservar trazabilidad de montos calculados, pagos aplicados, saldos incobrables y beneficiarios.
- El sistema debe manejar fechas de desafiliación como `YYYY-MM-DD` usando el estándar de fechas de negocio del proyecto.
- El sistema debe calcular créditos pendientes incluyendo saldo capital, interés ordinario e interés moratorio al día de la desafiliación.
- El sistema debe calcular y obtener los dividendos a cancelar usando la acción `setDividendosPeriodo`.
- El sistema debe bloquear la desafiliación si `setDividendosPeriodo` no puede calcular dividendos para el periodo.

### Event-driven

- Cuando un usuario autorizado abre `Socios -> Desafiliar`, el sistema debe mostrar una pantalla para buscar y seleccionar un socio activo.
- Cuando un usuario con `rolId` distinto de `2` intenta acceder a `Socios -> Desafiliar`, el sistema debe impedir el acceso.
- Cuando el usuario selecciona un socio activo, el sistema debe mostrar en campos separados el monto por créditos pendientes, ahorros acumulados, dividendos a cancelar y saldo estimado a entregar.
- Cuando el usuario selecciona motivo `Expulsion`, el sistema debe solicitar una justificación obligatoria.
- Cuando el usuario selecciona motivo `Fallecimiento`, el sistema debe solicitar una o más personas beneficiarias con nombre, cédula y monto asignado.
- Cuando el usuario confirma una desafiliación, el sistema debe registrar la desafiliación con fecha de salida, motivo, montos calculados, monto pagado y beneficiarios cuando aplique.
- Cuando el monto acumulado a favor del socio sea suficiente para cancelar préstamos pendientes, el sistema debe generar registros de pago para cada préstamo cancelado.
- Cuando el monto acumulado a favor del socio no sea suficiente para cancelar todos los préstamos pendientes, el sistema debe aplicar el monto disponible a préstamos ordenados de menor saldo a mayor saldo.
- Cuando el sistema aplique un pago parcial por desafiliación, el sistema debe cancelar primero intereses y luego amortizar capital con el remanente disponible.
- Cuando queden saldos de préstamo no cubiertos por el monto disponible, el sistema debe registrar esos saldos con un nuevo enum/tipo distinguible como `PAGO INCOBRABLE` y crear registros en la tabla de incobrables.
- Cuando la desafiliación finaliza correctamente, el sistema debe inactivar el socio y mostrar confirmación al usuario.
- Cuando la desafiliación finaliza correctamente, el sistema debe generar un comprobante o reporte descargable usando el flujo existente de Carbone.
- Si el `REPORT_ID` del comprobante de desafiliación no está configurado, entonces el sistema debe bloquear la generación del comprobante y mostrar un mensaje de configuración pendiente.
- Cuando se consulte conciliación administrativa, el sistema debe mostrar una línea `Pagos por desafiliación` que reste los montos pagados a socios o beneficiarios.
- Cuando se consulte conciliación administrativa, el sistema debe mostrar una línea `Pagos incobrables` que reste el saldo final.

### State-driven

- Mientras un socio esté desafiliado, el sistema debe excluirlo de listados para crear abonos, préstamos, acciones, solicitudes u otros procesos de socios activos.
- Mientras un socio esté desafiliado, el sistema debe excluirlo de reportes operativos que representen socios activos.
- Mientras un socio esté desafiliado, el sistema debe permitir consultar sus datos históricos donde aplique.
- Mientras un socio esté desafiliado, el sistema debe mantenerlo visible en reportes históricos y auditorías.
- Mientras una desafiliación tenga beneficiarios, el total de montos asignados a beneficiarios debe coincidir con el saldo disponible a pagar por la desafiliación.

### Unwanted behavior

- Si el usuario intenta desafiliar un socio inexistente, entonces el sistema debe mostrar un error y no debe modificar datos.
- Si el usuario intenta desafiliar un socio ya desafiliado, entonces el sistema debe informar que el socio ya está inactivo y no debe duplicar registros.
- Si el motivo es `Fallecimiento` y faltan beneficiarios, entonces el sistema debe bloquear la confirmación y mostrar los campos requeridos.
- Si el motivo es `Expulsion` y falta justificación, entonces el sistema debe bloquear la confirmación y mostrar el campo requerido.
- Si la suma de montos de beneficiarios no coincide con el saldo disponible a pagar, entonces el sistema debe bloquear la confirmación.
- Si ocurre un error durante pagos, incobrables o registro de desafiliación, entonces el sistema debe revertir la operación completa y conservar el estado anterior del socio.

## Requisitos no funcionales

- La operación de desafiliación debe ser transaccional.
- La operación no debe borrar datos históricos.
- La implementación debe usar Prisma migrations para nuevas tablas o campos.
- La pantalla debe usar el estándar de fechas `YYYY-MM-DD` del proyecto.
- La conciliación debe mantener trazabilidad de los montos descontados por desafiliación e incobrables.
- El flujo debe respetar rutas protegidas y permisos existentes.
- El flujo debe validar autorización con `rolId = 2` para usuarios de Junta Directiva.

## Modelo de datos propuesto

### `Socio`

Agregar un campo explícito de estado para usar como bandera en otras partes del sistema.

Campos mínimos sugeridos:

- `estadoSocio`, con valores como `ACTIVO` y `DESAFILIADO`.
- `fechaSalida` se mantiene como fecha de salida en formato `YYYY-MM-DD`.

Nombres aprobados:

```prisma
enum EstadoSocio {
  ACTIVO
  DESAFILIADO
}
```

El estado por defecto debe ser `ACTIVO`.

### Motivo de salida

Nombres aprobados:

```prisma
enum MotivoSalida {
  RENUNCIA
  EXPULSION
  FALLECIMIENTO
}
```

### Enum/tipo de pago

Agregar un nuevo enum/tipo para distinguir `PAGO INCOBRABLE` en reportes. El nombre técnico final queda a definir en el plan técnico, pero debe ser distinguible del pago ordinario y adicional.

Nombre aprobado para agregar al enum actual:

```prisma
enum TipoCuota {
  ORDINARIA
  ADICIONAL
  INCOBRABLE
}
```

### Tabla `desafiliaciones`

Campos mínimos sugeridos:

- `idDesafiliacion`
- `socioId`
- `fechaSalida`
- `motivoSalida`
- `justificacionSalida`
- `fechaSalida`, editable por el usuario con valor por defecto `todayCR()`.
- `montoAcciones`
- `montoDividendos`
- `montoPrestamos`
- `montoInteresOrdinario`
- `montoInteresMoratorio`
- `saldoPagado`
- `saldoIncobrable`
- `comprobanteUrl` o identificador de reporte generado
- `observacion`
- `createdAt`

### Tabla `desafiliacionBeneficiarios`

Campos mínimos sugeridos:

- `idBeneficiario`
- `desafiliacionId`
- `nombre`
- `cedula`
- `montoPagado`

### Tabla `incobrables`

Campos mínimos sugeridos:

- `idIncobrable`
- `socioId`
- `prestamoId`
- `desafiliacionId`
- `fecha`
- `monto`
- `motivo`
- `detalle`
- `createdAt`

## Criterios de aceptación

- Existe la opción de menú `Socios -> Desafiliar`.
- La pantalla permite seleccionar solo socios activos.
- Al seleccionar un socio, se muestran por separado créditos pendientes, ahorros acumulados, dividendos a cancelar y saldo pendiente a entregar.
- La pantalla solicita motivo de salida.
- La pantalla permite elegir fecha de salida con valor por defecto `todayCR()`.
- Si el motivo es `Expulsion`, la pantalla exige justificación.
- Si el motivo es `Fallecimiento`, la pantalla solicita uno o más beneficiarios y valida que los montos coincidan con el saldo disponible.
- Confirmar la desafiliación inactiva al socio y registra fecha de salida.
- El socio desafiliado no puede iniciar sesión.
- El socio desafiliado no aparece en listados operativos de socios activos.
- Los préstamos cubiertos se cancelan mediante pagos registrados.
- Los préstamos se priorizan de menor saldo a mayor saldo cuando el monto disponible no alcanza para todos.
- Los préstamos parcialmente cubiertos reciben abonos con el monto disponible, cancelando primero intereses y luego amortizando capital.
- Los saldos no cubiertos se registran como `PAGO INCOBRABLE` y en la tabla de incobrables.
- El comprobante o reporte descargable de desafiliación se genera correctamente con Carbone.
- La tabla de desafiliaciones conserva todos los datos requeridos.
- La conciliación muestra `Pagos por desafiliación` y `Pagos incobrables` como líneas separadas que restan al saldo final.
- `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan correctamente.

## Casos límite

- Socio sin préstamos pendientes.
- Socio con un préstamo totalmente cubierto por ahorros y dividendos.
- Socio con varios préstamos y monto insuficiente para cubrir todos.
- Socio con dividendos cero.
- Socio con ahorros cero.
- Motivo `Fallecimiento` con múltiples beneficiarios.
- Beneficiarios con suma mayor o menor al saldo disponible.
- Error de base de datos durante pagos o incobrables.
- Intento de login posterior a la desafiliación.

## Preguntas abiertas

- ¿Cuál será el identificador o plantilla de reporte Carbone para el comprobante descargable de desafiliación? Actualmente no existe; debe configurarse antes de validar la generación real del comprobante.

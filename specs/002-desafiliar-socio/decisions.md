# Decisions

## 2026-10-08 - Indicador de socio desafiliado

Contexto: El modelo `Socio` ya tiene `fechaSalida`, pero no hay campo explícito de estado.

Decisión: Agregar un campo explícito de estado del socio que sirva como bandera o indicador para otras partes del programa. Mantener `fechaSalida` como fecha de salida.

Consecuencia: La implementación requiere migración Prisma y los filtros de socios activos deben usar el nuevo estado. El enum debe llamarse `EstadoSocio` con valores `ACTIVO` y `DESAFILIADO`; el valor por defecto debe ser `ACTIVO`.

## 2026-10-08 - Priorización de préstamos

Contexto: Cuando el monto a favor del socio no cubre todos los préstamos, se debe priorizar cuáles cancelar y cuáles dejar como incobrables.

Decisión: Pagar préstamos desde menor saldo hacia mayor saldo.

Consecuencia: La regla impacta pagos, saldos, incobrables y conciliación.

## 2026-10-08 - Pago incobrable

Contexto: El pago especial `PAGO INCOBRABLE` debe distinguirse en reportes.

Decisión: Agregar `INCOBRABLE` al enum actual `TipoCuota` para identificar `PAGO INCOBRABLE`.

Consecuencia: La implementación requiere migración Prisma y ajustes en reportes/conciliación.

## 2026-10-08 - Créditos pendientes

Contexto: La pantalla de desafiliación debe mostrar montos por créditos pendientes.

Decisión: Los créditos pendientes incluyen saldo capital, interés ordinario e interés moratorio al día de desafiliación. Estos montos deben calcularse usando `calcularProximaCuota`.

Consecuencia: El cálculo debe usar la fecha de desafiliación y las reglas existentes de intereses.

## 2026-10-08 - Dividendos a cancelar

Contexto: Debe calcularse el monto de dividendos a cancelar.

Decisión: Usar la action `setDividendosPeriodo` como método para calcular y obtener dividendos. Si no puede calcular dividendos para el periodo, la desafiliación debe bloquearse.

Consecuencia: Queda pendiente decidir qué hacer si no existen dividendos guardados para el periodo.

## 2026-10-08 - Usuarios autorizados

Contexto: La desafiliación es una operación sensible.

Decisión: Solo usuarios con `rolId = 2`, pertenecientes a Junta Directiva, pueden desafiliar socios.

Consecuencia: La pantalla y la server action deben validar autorización.

## 2026-10-08 - Comprobante de desafiliación

Contexto: Se requiere evidencia descargable de la operación.

Decisión: Generar comprobante o reporte descargable de la desafiliación usando el flujo existente de Carbone.

Consecuencia: Queda pendiente definir plantilla o identificador del reporte Carbone. Mientras no exista `REPORT_ID`, la implementación debe dejar la integración preparada y bloquear la generación real del comprobante con un mensaje de configuración pendiente.

## 2026-10-08 - Justificación de expulsión

Contexto: El motivo `Expulsion` requiere una razón formal.

Decisión: El motivo `Expulsion` debe requerir texto obligatorio de justificación.

Consecuencia: La UI y validación server-side deben bloquear la confirmación si falta justificación.

## 2026-10-08 - Motivos de salida

Contexto: La salida debe clasificarse de forma consistente.

Decisión: Usar enum `MotivoSalida` con valores `RENUNCIA`, `EXPULSION` y `FALLECIMIENTO`.

Consecuencia: La implementación requiere migración Prisma y validación de UI/server.

## 2026-10-08 - Pago parcial antes de incobrable

Contexto: Cuando el monto disponible no alcanza para cancelar un préstamo completo, se debe definir cómo aplicar el pago parcial.

Decisión: Aplicar el monto disponible como pago parcial, cancelando primero intereses y luego amortizando capital. El saldo restante se registra en la tabla de incobrables.

Consecuencia: La lógica de desafiliación debe desglosar intereses/capital antes de crear incobrables.

## 2026-10-08 - Beneficiarios

Contexto: En caso de fallecimiento se debe pagar a beneficiarios.

Decisión: Permitir uno o más beneficiarios.

Consecuencia: La UI debe soportar lista dinámica de beneficiarios y validar que el total coincida con el saldo disponible.

## 2026-10-08 - Reportes activos vs históricos

Contexto: Un socio desafiliado no debe aparecer en reportes operativos, pero no se debe perder historia.

Decisión: Excluir socios desafiliados de reportes activos y mantenerlos visibles en reportes históricos y auditorías.

Consecuencia: Los reportes deben distinguir contexto operativo vs histórico.

## 2026-10-08 - Fecha de salida

Contexto: La fecha de salida puede necesitar control manual.

Decisión: Permitir seleccionar fecha de salida con valor por defecto `todayCR()`.

Consecuencia: La pantalla debe incluir input de fecha `YYYY-MM-DD` y validar el estándar de fechas de negocio.

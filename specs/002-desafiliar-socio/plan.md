# Plan: Desafiliar Socio

## Estado

Approved

## Diseño técnico preliminar

La implementación requiere cambios de datos, server actions, pantallas, reportes y conciliación. Este plan técnico fue aprobado por el usuario antes de implementar.

## Decisiones aplicadas

- Agregar campo explícito de estado del socio como bandera global del sistema.
- Mantener `fechaSalida` como fecha de salida en formato `YYYY-MM-DD`.
- Priorizar préstamos de menor saldo a mayor saldo.
- Crear nuevo enum/tipo para distinguir `PAGO INCOBRABLE` en reportes.
- Calcular créditos pendientes con saldo capital, interés ordinario e interés moratorio al día de desafiliación.
- Calcular y obtener dividendos a cancelar mediante `setDividendosPeriodo`.
- Bloquear la desafiliación si `setDividendosPeriodo` no puede calcular dividendos para el periodo.
- Autorizar el flujo solo para usuarios con `rolId = 2`.
- Generar comprobante o reporte descargable de desafiliación usando el flujo existente de Carbone.
- Requerir justificación cuando el motivo sea `Expulsion`.
- Permitir fecha de salida editable con valor por defecto `todayCR()`.
- Aplicar pagos parciales cancelando primero intereses y luego amortizando capital; registrar el saldo no cubierto como incobrable.

## Archivos probables a modificar

- `prisma/schema.prisma`
  - Agregar campo explícito de estado en `Socio`.
  - Agregar enum `EstadoSocio` con `ACTIVO` y `DESAFILIADO`; estado por defecto `ACTIVO`.
  - Agregar enum `MotivoSalida` con `RENUNCIA`, `EXPULSION` y `FALLECIMIENTO`.
  - Agregar `INCOBRABLE` al enum `TipoCuota`.
  - Agregar tablas de desafiliaciones, beneficiarios e incobrables.

- `prisma/migrations/*`
  - Crear migración formal para producción.

- `src/components/Menu.tsx`
  - Agregar opción `Socios -> Desafiliar`.

- `src/app/(home)/home/socios/desafiliar/page.tsx`
  - Crear pantalla de selección, cálculo, beneficiarios, motivo, justificación y confirmación.

- `src/app/api/socio/actions.ts`
  - Agregar acción de desafiliación.
  - Asegurar que listados operativos excluyan socios desafiliados.

- `src/app/api/abonos/actions.ts`
  - Reutilizar o extender registro de pagos/abonos.

- `src/app/api/prestamo/actions.ts`
  - Consultar saldos de préstamos, calcular intereses al día con `calcularProximaCuota`, ordenar préstamos de menor a mayor saldo y aplicar pagos o incobrables.
  - Para pagos parciales, aplicar primero a intereses y luego a capital; el saldo no cubierto se registra como incobrable.

- `src/app/api/dividendos/actions.ts`
  - Calcular y obtener dividendos a cancelar usando `setDividendosPeriodo`.

- `src/app/api/dashboard/actions.ts`
  - Ajustar conciliación para pagos por desafiliación e incobrables.

- `src/app/api/usuarios/actions.ts`
  - Bloquear login de socios con estado desafiliado.

- `src/lib/report.ts` y/o `src/app/api/reportes/route.ts`
  - Generar comprobante o reporte descargable de desafiliación con Carbone.
  - Preparar la integración para recibir un `REPORT_ID` pendiente de definir.
  - Bloquear la generación real del comprobante si el `REPORT_ID` no está configurado.

- `src/lib/date.ts`
  - Usar `todayCR()` para fecha de salida y registros de negocio.

- `src/lib/zod-schemas.ts`
  - Agregar validaciones de formulario si aplica.

## Impacto en datos

- Requiere migración Prisma.
- No elimina socios ni históricos.
- Agrega registros auditable de desafiliación e incobrables.
- Agrega estado explícito de socio.
- Agrega nuevo tipo/enum para `PAGO INCOBRABLE`.
- Mantiene socios desafiliados en reportes históricos y auditorías, pero los excluye de reportes operativos de socios activos.

## Riesgos

- La desafiliación debe bloquearse si `setDividendosPeriodo` no puede calcular datos del periodo esperado.
- Inconsistencia si pagos, incobrables y desafiliación no se ejecutan en una única transacción.
- Reportes activos podrían seguir incluyendo socios desafiliados si no se centraliza el filtro.
- Login podría seguir habilitado si solo se actualiza la pantalla y no la validación de credenciales.
- El reporte descargable requiere confirmar plantilla o identificador de reporte.

## Validaciones requeridas

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Pendientes de configuración posterior

- Confirmar plantilla o identificador de reporte Carbone para comprobante de desafiliación; por ahora no existe y debe quedar como configuración pendiente.

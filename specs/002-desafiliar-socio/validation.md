# Validation

## Requisitos validados

- [x] El socio se inactiva sin eliminarse físicamente.
- [x] El socio desafiliado no aparece en listados operativos.
- [x] El socio desafiliado no puede iniciar sesión.
- [x] La pantalla muestra créditos pendientes, ahorros, dividendos y saldo a entregar.
- [x] La operación registra desafiliación con fecha, motivo y montos.
- [x] La fecha de salida es editable y por defecto usa `todayCR()`.
- [x] La operación se bloquea si `setDividendosPeriodo` no puede calcular dividendos del periodo.
- [x] La operación registra beneficiarios y montos cuando el motivo es fallecimiento.
- [x] La suma de beneficiarios coincide con el saldo disponible.
- [x] La operación exige justificación cuando el motivo es `Expulsion`.
- [x] Solo usuarios con `rolId = 2` pueden desafiliar socios.
- [ ] El comprobante descargable se genera correctamente.
- [ ] El comprobante se genera usando el flujo existente de Carbone.
- [x] Si falta `REPORT_ID`, la generación del comprobante se bloquea con mensaje de configuración pendiente.
- [x] Los préstamos cubiertos quedan pagados.
- [x] Los préstamos se aplican en orden de menor saldo a mayor saldo.
- [x] Los pagos parciales cancelan primero intereses y luego amortizan capital.
- [x] Los saldos no cubiertos quedan como `PAGO INCOBRABLE` y en tabla de incobrables.
- [x] Conciliación muestra `Pagos por desafiliación`.
- [x] Conciliación muestra `Pagos incobrables`.

## Comandos

- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [x] `npm run build`

## Resultado

Implementación validada localmente. Queda pendiente configurar el `REPORT_ID` de Carbone para validar la generación real del comprobante descargable.

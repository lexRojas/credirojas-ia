# Decisions

## 2026-10-09 - Spec inicial

Contexto: Se requiere mantener una lista de beneficiarios por socio para usarla especialmente en desafiliaciones por fallecimiento.

Decisión: Crear la spec `003-beneficiarios-socio` en estado `Draft`, sin tocar código de la app.

Consecuencia: La implementación queda bloqueada hasta aprobar alcance, resolver preguntas abiertas y aprobar plan técnico.

## 2026-10-09 - Tipos de beneficiario iniciales

Contexto: El usuario solicitó dos tipos de beneficiarios.

Decisión: Usar tipos `ORDINARIO` y `CONTINGENTE`.

Consecuencia: La implementación probablemente requiere un enum Prisma `TipoBeneficiario`.

## 2026-10-09 - Permisos

Contexto: La asignación de beneficiarios es una operación sensible.

Decisión: Solo usuarios con `rolId = 2`, Junta Directiva, podrán asignar beneficiarios a socios.

Consecuencia: La UI y las server actions deben validar autorización.

## 2026-10-09 - Porcentajes por tipo

Contexto: Se debe definir si las distribuciones menores a 100% son válidas.

Decisión: No se permiten sumas menores a 100%. Los beneficiarios de cada tipo deben sumar exactamente 100% antes de guardar; si suman menos, el sistema debe advertir y bloquear el guardado.

Consecuencia: La implementación debe validar suma exacta por `socioId + tipoBeneficiario`.

## 2026-10-09 - Distribución en fallecimiento

Contexto: La desafiliación por fallecimiento debe usar beneficiarios previamente asignados y mantener los cálculos financieros ya establecidos.

Decisión: La pantalla debe mostrar beneficiarios ordinarios y contingentes en grupos separados. Cada beneficiario debe tener un check de disponibilidad. Los ordinarios disponibles reciben monto según su porcentaje previamente definido sobre el saldo disponible calculado por desafiliación. Si los ordinarios disponibles no distribuyen el 100%, se pueden marcar contingentes disponibles para distribuir el saldo restante. No puede quedar saldo sin distribuir.

Consecuencia: La implementación debe calcular distribución a partir del saldo disponible existente y bloquear confirmación si queda saldo pendiente.

## 2026-10-09 - Cédula repetida

Contexto: Una persona puede ser beneficiaria en más de un contexto.

Decisión: Se permite repetir la misma cédula como beneficiario en tipos distintos para el mismo socio y como beneficiario de uno o varios socios.

Consecuencia: No debe existir una restricción única global por cédula en beneficiarios.

## 2026-10-09 - Duplicado exacto por grupo

Contexto: Aunque una cédula puede repetirse entre tipos y entre socios, se debe evitar duplicación accidental dentro del mismo grupo.

Decisión: Bloquear duplicado exacto de la misma cédula para el mismo socio y mismo tipo de beneficiario.

Consecuencia: El modelo puede usar una restricción única compuesta por `socioId + tipoBeneficiario + cedula`, sin impedir que la misma cédula exista en otro tipo o con otro socio.

## 2026-10-09 - Parentescos

Contexto: Se propuso una lista usual de parentescos.

Decisión: La lista sugerida de parentescos es aceptada.

Consecuencia: La implementación puede usar la lista propuesta en `spec.md`.

## 2026-10-09 - Historial de beneficiarios

Contexto: Se consultó si debe conservarse historial de cambios.

Decisión: No conservar historial de cambios; mantener solo la lista vigente.

Consecuencia: La implementación no debe crear tabla de auditoría o versionado para beneficiarios en esta spec.

## 2026-10-09 - Porcentaje mínimo de beneficiario

Contexto: Un beneficiario con porcentaje menor o igual a 0% no participa realmente en la distribución.

Decisión: No permitir porcentajes de distribución menores o iguales a 0% en ningún tipo de beneficiario.

Consecuencia: La validación debe exigir porcentaje mayor que 0 y menor o igual que 100 para beneficiarios ordinarios y contingentes.

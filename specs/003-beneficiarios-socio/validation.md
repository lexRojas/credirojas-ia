# Validation

## Requisitos validados

- [x] Existe opción de menú `Socios -> Asignacion de Beneficiarios`.
- [x] Solo usuarios con `rolId = 2` pueden administrar beneficiarios.
- [x] Un socio puede tener uno o más beneficiarios.
- [x] Cada beneficiario tiene cédula, nombre completo, parentesco, tipo y porcentaje.
- [x] Existen tipos `ORDINARIO` y `CONTINGENTE`.
- [x] El primer beneficiario de cada tipo recibe 100% por defecto.
- [x] La suma de porcentajes por tipo debe ser exactamente 100% antes de guardar.
- [x] El sistema bloquea beneficiarios con porcentaje menor o igual a 0%.
- [x] La pantalla de desafiliación muestra beneficiarios al seleccionar fallecimiento.
- [x] La desafiliación por fallecimiento se bloquea si no hay beneficiarios asignados.
- [x] La pantalla de desafiliación muestra ordinarios y contingentes en grupos separados.
- [x] La pantalla de desafiliación permite marcar beneficiarios disponibles.
- [x] La distribución por fallecimiento usa primero ordinarios disponibles y luego contingentes disponibles para saldo restante.
- [x] La desafiliación por fallecimiento se bloquea si queda saldo sin distribuir.
- [x] Se permite repetir cédula entre tipos y entre socios.
- [x] Se bloquea duplicado exacto por socio, tipo y cédula.
- [x] No se conserva historial de cambios de beneficiarios.

## Comandos

- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [x] `npm run build`

## Resultado

Implementación completada y validada localmente con lint, TypeScript y build. Pendiente de prueba funcional por el usuario y despliegue/publicación.

# Spec: Beneficiarios por Socio

## Estado

Implemented

## Contexto

El sistema administra socios, acciones, préstamos, dividendos y desafiliaciones. Actualmente se requiere registrar de forma anticipada los beneficiarios asociados a cada socio para que, en caso de fallecimiento, el proceso de desafiliación use esa información ya definida.

La funcionalidad debe permitir a usuarios autorizados de Junta Directiva administrar beneficiarios ordinarios y contingentes por socio, con distribución porcentual del beneficio y validaciones para que los porcentajes sumen exactamente 100% por tipo de beneficiario antes de guardar.

## Alcance

### Incluye

- Crear una lista de beneficiarios asociada a cada socio.
- Permitir que un socio tenga uno o más beneficiarios.
- Clasificar beneficiarios por tipo:
  - `ORDINARIO`.
  - `CONTINGENTE`.
- Capturar por beneficiario:
  - número de cédula;
  - nombre completo;
  - parentesco;
  - tipo de beneficiario;
  - porcentaje de beneficio.
- Usar una lista de parentescos con valores usuales.
- Agregar una opción de menú `Socios -> Asignacion de Beneficiarios`.
- Permitir que solo usuarios con `rolId = 2` / Junta Directiva asignen beneficiarios.
- Validar que los beneficiarios de un mismo tipo sumen exactamente 100% antes de guardar.
- Asignar automáticamente 100% cuando se agrega un único beneficiario de un tipo.
- Mostrar en `Socios -> Desafiliar`, cuando el motivo sea fallecimiento, los beneficiarios previamente asignados al socio.
- Impedir la desafiliación por fallecimiento si el socio no tiene beneficiarios asignados.
- En desafiliación por fallecimiento, presentar beneficiarios ordinarios y contingentes en grupos separados.
- En desafiliación por fallecimiento, permitir marcar con un check si cada beneficiario está disponible para recibir el monto.
- En desafiliación por fallecimiento, distribuir primero entre beneficiarios ordinarios disponibles y permitir contingentes disponibles solo para cubrir saldo no distribuido por ordinarios.
- Impedir que quede saldo sin distribuir en una desafiliación por fallecimiento.

### No incluye

- Cambiar reglas financieras de cálculo de saldos, dividendos, préstamos o incobrables.
- Cambiar el flujo de desafiliación por motivos distintos de fallecimiento.
- Crear flujos de aprobación multiusuario para cambios de beneficiarios.
- Generar reportes o comprobantes nuevos de beneficiarios, salvo que otra spec lo solicite.
- Definir reglas legales fuera de los campos y validaciones solicitadas.
- Conservar historial de cambios de beneficiarios; solo se mantiene la lista vigente.

## Requisitos funcionales EARS

### Ubiquitous

- El sistema debe almacenar beneficiarios relacionados con un socio existente.
- El sistema debe permitir que cada socio tenga uno o más beneficiarios.
- El sistema debe clasificar cada beneficiario como `ORDINARIO` o `CONTINGENTE`.
- El sistema debe almacenar para cada beneficiario número de cédula, nombre completo, parentesco, tipo de beneficiario y porcentaje de beneficio.
- El sistema debe restringir la administración de beneficiarios a usuarios con `rolId = 2`.
- El sistema debe impedir porcentajes de beneficio menores o iguales a 0% para cualquier tipo de beneficiario.
- El sistema debe validar que la suma de porcentajes de beneficiarios de un mismo tipo sea exactamente 100% antes de guardar.
- El sistema debe permitir que una misma cédula exista como beneficiaria en tipos distintos para el mismo socio.
- El sistema debe permitir que una misma cédula exista como beneficiaria de uno o varios socios.
- El sistema debe impedir duplicados exactos de la misma cédula dentro del mismo socio y mismo tipo de beneficiario.
- El sistema debe mantener solo la lista vigente de beneficiarios, sin historial de cambios.

### Event-driven

- Cuando un usuario autorizado abre `Socios -> Asignacion de Beneficiarios`, el sistema debe mostrar una pantalla para seleccionar un socio y administrar sus beneficiarios.
- Cuando el usuario agrega el primer beneficiario de un tipo para un socio, el sistema debe asignar por defecto 100% como porcentaje de beneficio para ese tipo.
- Cuando el usuario agrega más de un beneficiario del mismo tipo, el sistema debe exigir que la distribución porcentual sume exactamente 100% antes de guardar.
- Cuando el usuario selecciona parentesco de un beneficiario, el sistema debe mostrar una lista de parentescos usuales.
- Cuando el usuario guarda beneficiarios, el sistema debe validar los datos requeridos y persistir la lista asociada al socio.
- Cuando el usuario intenta guardar beneficiarios de un tipo con suma menor a 100%, el sistema debe advertirlo y bloquear el guardado hasta completar 100%.
- Cuando el usuario intenta guardar un beneficiario con porcentaje menor o igual a 0%, el sistema debe bloquear el guardado y mostrar un error de validación.
- Cuando un usuario con `rolId` distinto de `2` intenta acceder a `Socios -> Asignacion de Beneficiarios`, el sistema debe impedir el acceso.
- Cuando en `Socios -> Desafiliar` se selecciona motivo `FALLECIMIENTO`, el sistema debe mostrar los beneficiarios previamente asignados al socio en dos grupos: ordinarios y contingentes.
- Cuando en `Socios -> Desafiliar` se selecciona motivo `FALLECIMIENTO`, el sistema debe mostrar un check por beneficiario para indicar si está disponible para recibir el monto.
- Cuando en `Socios -> Desafiliar` el usuario marca un beneficiario ordinario como disponible, el sistema debe asignarle el monto según su porcentaje previamente definido y el saldo disponible calculado por el proceso de desafiliación.
- Cuando los beneficiarios ordinarios disponibles no distribuyen el 100% del saldo disponible, el sistema debe permitir marcar beneficiarios contingentes disponibles para distribuir el saldo restante según sus porcentajes previamente definidos.
- Cuando en `Socios -> Desafiliar` se confirma una desafiliación por fallecimiento, el sistema debe impedir la confirmación si queda saldo sin distribuir.

### State-driven

- Mientras un socio no tenga beneficiarios asignados, el sistema debe impedir su desafiliación por motivo `FALLECIMIENTO`.
- Mientras un socio tenga beneficiarios ordinarios asignados, el sistema debe permitir consultarlos y editarlos desde la pantalla de asignación de beneficiarios.
- Mientras un socio tenga beneficiarios contingentes asignados, el sistema debe permitir consultarlos y editarlos desde la pantalla de asignación de beneficiarios.

### Unwanted behavior

- Si falta número de cédula, nombre completo, parentesco, tipo o porcentaje, entonces el sistema debe bloquear el guardado y mostrar el campo requerido.
- Si la suma de porcentajes de beneficiarios de un mismo tipo supera 100%, entonces el sistema debe bloquear el guardado y mostrar un error de validación.
- Si la suma de porcentajes de beneficiarios de un mismo tipo es menor a 100%, entonces el sistema debe advertirlo y bloquear el guardado hasta completar 100%.
- Si el usuario intenta guardar un porcentaje menor o igual que 0 o mayor que 100 para un beneficiario, entonces el sistema debe bloquear el guardado.
- Si el usuario intenta repetir la misma cédula dentro del mismo socio y mismo tipo de beneficiario, entonces el sistema debe bloquear el guardado e indicar que el beneficiario ya existe en ese grupo.
- Si el usuario intenta desafiliar por fallecimiento a un socio sin beneficiarios asignados, entonces el sistema debe bloquear la confirmación e indicar que primero deben asignarse beneficiarios.
- Si el usuario intenta confirmar una desafiliación por fallecimiento con saldo disponible sin distribuir, entonces el sistema debe bloquear la confirmación.
- Si el usuario intenta administrar beneficiarios de un socio inexistente, entonces el sistema debe mostrar un error y no debe modificar datos.

## Requisitos no funcionales

- La implementación debe usar Prisma migrations si requiere nuevas tablas, campos o enums.
- La funcionalidad no debe eliminar datos históricos del socio.
- La pantalla debe respetar las rutas protegidas y permisos existentes.
- La validación de permisos debe realizarse en UI y server-side.
- La integración con desafiliación debe mantenerse dentro del alcance aprobado y no debe cambiar reglas financieras existentes.
- La integración con desafiliación debe reutilizar el saldo disponible ya calculado por el proceso de desafiliación.

## Modelo de datos propuesto

### Tabla `socioBeneficiarios`

Campos mínimos sugeridos:

- `idBeneficiario`
- `socioId`
- `cedula`
- `nombreCompleto`
- `parentesco`
- `tipoBeneficiario`
- `porcentajeBeneficio`
- `createdAt`
- `updatedAt`

### Enum `TipoBeneficiario`

Valores sugeridos:

```prisma
enum TipoBeneficiario {
  ORDINARIO
  CONTINGENTE
}
```

### Parentescos sugeridos

La implementación debe definir una lista de valores usuales, por ejemplo:

- Cónyuge
- Hijo/a
- Padre
- Madre
- Hermano/a
- Abuelo/a
- Nieto/a
- Tío/a
- Sobrino/a
- Primo/a
- Otro

## Criterios de aceptación

- Existe la opción de menú `Socios -> Asignacion de Beneficiarios`.
- Solo usuarios con `rolId = 2` pueden acceder y guardar beneficiarios.
- La pantalla permite seleccionar un socio.
- La pantalla permite agregar uno o más beneficiarios por socio.
- Cada beneficiario exige cédula, nombre completo, parentesco, tipo y porcentaje.
- El primer beneficiario de cada tipo recibe 100% por defecto.
- La suma de porcentajes por tipo de beneficiario no puede superar 100%.
- La suma de porcentajes por tipo de beneficiario debe ser exactamente 100% antes de guardar.
- Los beneficiarios quedan persistidos y asociados al socio correcto.
- No se permite duplicar la misma cédula dentro del mismo socio y mismo tipo de beneficiario.
- En `Socios -> Desafiliar`, al seleccionar fallecimiento, se muestran los beneficiarios previamente asignados en grupos ordinarios y contingentes.
- En `Socios -> Desafiliar`, al marcar beneficiarios disponibles, se calcula la distribución según porcentajes previamente definidos y saldo disponible.
- En `Socios -> Desafiliar`, si el socio no tiene beneficiarios asignados, no procede la desafiliación por fallecimiento.
- En `Socios -> Desafiliar`, no se permite confirmar fallecimiento si queda saldo sin distribuir.
- `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan correctamente cuando se implemente código.

## Casos límite

- Socio con un único beneficiario ordinario.
- Socio con múltiples beneficiarios ordinarios que suman 100%.
- Intento de guardar múltiples beneficiarios ordinarios que suman menos de 100%.
- Socio con beneficiarios ordinarios y contingentes.
- Socio con un único beneficiario ordinario y un único beneficiario contingente, ambos con 100% automático para su tipo.
- Intento de guardar beneficiarios de un mismo tipo con suma mayor a 100%.
- Intento de desafiliación por fallecimiento sin beneficiarios asignados.
- Desafiliación por fallecimiento con algunos beneficiarios ordinarios no disponibles y uso de beneficiarios contingentes para cubrir saldo restante.
- Desafiliación por fallecimiento con saldo disponible sin distribuir.
- Misma cédula registrada como beneficiaria en varios socios.
- Misma cédula registrada como beneficiaria ordinaria y contingente del mismo socio.
- Intento de repetir la misma cédula dos veces como beneficiaria ordinaria del mismo socio.
- Usuario no autorizado intentando acceder a la pantalla de asignación.

## Preguntas abiertas

No hay preguntas abiertas de negocio por ahora.

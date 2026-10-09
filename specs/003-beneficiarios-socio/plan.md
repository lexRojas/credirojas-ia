# Plan: Beneficiarios por Socio

## Estado

Approved

## Diseño técnico preliminar

La implementación requiere cambios de datos, server actions, pantalla de administración de beneficiarios, opción de menú e integración con la pantalla de desafiliación por fallecimiento. Este plan técnico fue aprobado por el usuario antes de implementar.

## Archivos probables a modificar

- `prisma/schema.prisma`
  - Agregar enum `TipoBeneficiario`.
  - Agregar modelo `SocioBeneficiario` relacionado con `Socio`.

- `prisma/migrations/*`
  - Crear migración formal para producción.

- `src/components/Menu.tsx`
  - Agregar opción `Socios -> Asignacion de Beneficiarios`.

- `src/app/(home)/home/socios/beneficiarios/page.tsx`
  - Crear pantalla para seleccionar socio y administrar beneficiarios.

- `src/app/api/socio/actions.ts` o nuevo `src/app/api/beneficiarios/actions.ts`
  - Crear acciones para consultar, guardar y validar beneficiarios por socio.
  - Validar autorización `rolId = 2` server-side.

- `src/app/(home)/home/socios/desafiliar/page.tsx`
  - Mostrar beneficiarios previamente asignados cuando el motivo sea `FALLECIMIENTO`.
  - Bloquear la desafiliación por fallecimiento si no hay beneficiarios asignados.

- `src/app/api/socio/actions.ts`
  - Ajustar la acción transaccional de desafiliación para usar beneficiarios previamente asignados cuando el motivo sea `FALLECIMIENTO`.
  - Reutilizar el saldo disponible ya calculado por el proceso de desafiliación.

## Modelo de datos preliminar

```prisma
enum TipoBeneficiario {
  ORDINARIO
  CONTINGENTE
}

model SocioBeneficiario {
  idBeneficiario      Int              @id @default(autoincrement())
  socioId             Int
  cedula              String
  nombreCompleto      String
  parentesco          String
  tipoBeneficiario    TipoBeneficiario
  porcentajeBeneficio Float            @db.Float
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  socio               Socio            @relation(fields: [socioId], references: [idSocio], onDelete: Cascade, onUpdate: Cascade)

  @@unique([socioId, tipoBeneficiario, cedula])
  @@index([socioId])
  @@index([tipoBeneficiario])
  @@map("socioBeneficiarios")
}
```

## Reglas técnicas clave

- Validar `rolId = 2` en pantalla y server action.
- Validar campos requeridos por beneficiario.
- Validar porcentaje mayor que `0` y menor o igual que `100`.
- Validar suma exacta `100` por `socioId + tipoBeneficiario` antes de guardar.
- Asignar `100` por defecto cuando se agrega el primer beneficiario de un tipo.
- En desafiliación por fallecimiento, cargar beneficiarios del socio antes de confirmar.
- En desafiliación por fallecimiento, bloquear confirmación si no hay beneficiarios asignados.
- En desafiliación por fallecimiento, mostrar beneficiarios ordinarios y contingentes en grupos separados.
- En desafiliación por fallecimiento, permitir marcar beneficiarios disponibles con un check.
- En desafiliación por fallecimiento, distribuir primero entre ordinarios disponibles según porcentajes ya definidos.
- En desafiliación por fallecimiento, permitir contingentes disponibles para distribuir el saldo no cubierto por ordinarios disponibles.
- En desafiliación por fallecimiento, bloquear confirmación si queda saldo sin distribuir.
- Permitir cédulas repetidas entre tipos y entre socios; no imponer unicidad global por cédula.
- Bloquear duplicados exactos por `socioId + tipoBeneficiario + cedula`.
- Mantener solo lista vigente de beneficiarios, sin historial de cambios.

## Impacto en datos

- Requiere migración Prisma.
- No modifica datos históricos existentes.
- Agrega una tabla nueva relacionada con socios.
- La relación con `Socio` debe conservar integridad referencial.

## Riesgos

- La distribución en fallecimiento debe recalcular montos correctamente cuando algunos beneficiarios ordinarios no estén disponibles.
- Debe evitarse confirmar una desafiliación por fallecimiento si queda saldo sin distribuir.
- La integración con desafiliación debe evitar duplicar captura manual de beneficiarios cuando ya existan beneficiarios vigentes.

## Validaciones requeridas al implementar

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Pendientes antes de implementar

- Crear migración Prisma formal durante implementación.
- Ejecutar validaciones estándar después de implementar.

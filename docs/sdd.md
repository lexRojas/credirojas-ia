# SDD

SDD en este proyecto significa trabajar desde una especificación antes de tocar código. Cada funcionalidad nueva debe iniciar en `specs/NNN-nombre-corto/` y mantenerse dentro de su alcance aprobado.

## Estructura de una spec

```text
specs/
  001-nombre-corto/
    spec.md
    plan.md
    tasks.md
    decisions.md
    validation.md
```

Reglas:

- `NNN` usa tres dígitos consecutivos.
- `nombre-corto` usa kebab-case.
- Una carpeta por funcionalidad o cambio relevante.
- Antes de implementar, leer `docs/constitution.md`, `AGENTS.md`, `MEMORY.md` y la spec activa.
- No implementar requisitos que no estén en `spec.md` o no estén aprobados por el usuario.

## Flujo

1. Crear spec con requisitos EARS en `spec.md`.
2. Revisar y aprobar alcance.
3. Crear/ajustar `plan.md` con diseño técnico, archivos e impacto.
4. Desglosar ejecución en `tasks.md`.
5. Implementar solo lo aprobado.
6. Registrar decisiones relevantes en `decisions.md`.
7. Validar y documentar resultados en `validation.md`.

## Plantilla mínima de `spec.md`

```md
# Spec: Nombre

## Estado

Draft | Approved | Implemented | Validated

## Contexto

...

## Alcance

### Incluye
- ...

### No incluye
- ...

## Requisitos funcionales EARS
- Cuando ..., el sistema debe ...

## Requisitos no funcionales
- ...

## Criterios de aceptación
- ...

## Casos límite
- ...

## Preguntas abiertas
- ...
```

## Validaciones estándar

Antes de publicar cambios de código en `main`, `master` o `prod`:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Para documentación pura, el build puede omitirse con aprobación explícita.

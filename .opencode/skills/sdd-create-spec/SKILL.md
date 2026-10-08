---
name: SDD Create Spec
description: Crear una nueva especificación SDD en specs/NNN-nombre-corto con requisitos EARS
---

## Objetivo

Usar esta skill cuando el usuario pida crear o iniciar una nueva especificación.

## Flujo

1. Leer `docs/constitution.md`, `docs/sdd.md`, `docs/ears.md`, `AGENTS.md` y `MEMORY.md`.
2. Revisar `specs/` para calcular el siguiente `NNN` de tres dígitos.
3. Proponer un nombre `kebab-case` corto y crear `specs/NNN-nombre-corto/` solo tras confirmar si hay ambigüedad.
4. Crear `spec.md`, `plan.md`, `tasks.md`, `decisions.md` y `validation.md`.
5. Escribir requisitos en formato EARS cuando aplique.
6. Mantener estado inicial como `Draft` salvo aprobación explícita del usuario.

## Reglas

- No tocar código de la app al crear una spec.
- No inventar requisitos; marcar dudas en `Preguntas abiertas`.
- Una spec debe cubrir una sola funcionalidad o cambio relevante.

---
name: SDD Implement
description: Implementar una spec SDD aprobada sin ampliar alcance
---

## Objetivo

Usar esta skill para implementar una spec aprobada en `specs/NNN-nombre-corto/`.

## Flujo

1. Leer `docs/constitution.md`, `AGENTS.md`, `MEMORY.md`, `spec.md`, `plan.md` y `tasks.md`.
2. Confirmar que el usuario aprobó implementar.
3. Modificar solo archivos necesarios según `plan.md`.
4. Ejecutar validaciones aplicables: `npm run lint`, `npx tsc --noEmit` y, antes de publicar ramas productivas, `npm run build`.
5. Reportar tareas completadas y brechas contra la spec.

## Reglas

- No implementar requisitos ausentes en la spec.
- No modificar `.env` ni imprimir secretos.
- No usar comandos destructivos de Git.

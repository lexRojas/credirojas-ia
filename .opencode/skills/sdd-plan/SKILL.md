---
name: SDD Plan
description: Convertir una spec aprobada en plan técnico antes de tocar código
---

## Objetivo

Usar esta skill cuando exista una spec y el usuario pida planificar implementación.

## Flujo

1. Leer `docs/constitution.md`, `docs/sdd.md`, `AGENTS.md`, `MEMORY.md` y la carpeta `specs/NNN-nombre-corto/` indicada.
2. Verificar que `spec.md` tenga alcance claro; si sigue en `Draft`, pedir aprobación antes de implementar.
3. Proponer archivos a modificar, diseño técnico, impacto en datos, riesgos y validaciones.
4. Actualizar o proponer contenido para `plan.md` y `tasks.md`.

## Reglas

- No tocar código durante planificación.
- No incluir trabajo fuera de `spec.md`.
- Si hay cambio en Prisma, exigir migración en `prisma/migrations/`.

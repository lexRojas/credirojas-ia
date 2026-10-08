---
name: SDD Validate
description: Validar una implementación contra su spec SDD y registrar evidencias
---

## Objetivo

Usar esta skill para comparar cambios contra una spec y validar que los requisitos EARS se cumplieron.

## Flujo

1. Leer `docs/constitution.md`, `docs/sdd.md`, `spec.md`, `tasks.md` y `validation.md`.
2. Revisar diff y archivos modificados.
3. Mapear cada requisito EARS a evidencia o brecha.
4. Ejecutar o proponer `npm run lint`, `npx tsc --noEmit` y `npm run build` según el tipo de cambio.
5. Actualizar `validation.md` solo si el usuario autoriza registrar evidencia.

## Reglas

- No corregir código durante validación salvo que el usuario lo pida explícitamente.
- No marcar una spec como validada si hay brechas abiertas.

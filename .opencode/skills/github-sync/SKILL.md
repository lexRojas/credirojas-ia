---
name: GitHub Sync
description: Publicar cambios del repositorio en GitHub con validaciones y confirmaciones seguras
---

## Objetivo

Usar esta skill cuando el usuario pida subir, publicar, sincronizar o preparar cambios para GitHub.

## Flujo obligatorio

1. Leer `AGENTS.md` y `MEMORY.md` si no están cargados en la sesión.
2. Revisar el estado con `git status --short` y la rama actual con `git branch --show-current`.
3. Revisar cambios relevantes con `git diff` y, si hay staged changes, `git diff --cached`.
4. Confirmar que no se van a subir secretos ni artefactos generados: `.env*`, `.next/`, `node_modules/`, `*.tsbuildinfo`, `next-env.d.ts`, `/src/generated/prisma`.
5. Antes de publicar en `main`, `master` o `prod`, ejecutar o proponer estas validaciones:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`
6. Si hay cambios en `prisma/schema.prisma`, verificar que exista una migración nueva en `prisma/migrations/`; producción usa `npx prisma migrate deploy`, no `db push`.
7. Mostrar al usuario un resumen breve de archivos cambiados, validaciones realizadas y rama destino.
8. Pedir confirmación explícita antes de `git add`, `git commit` o `git push`.
9. Para `git commit`, sugerir un mensaje claro y corto, pero permitir que el usuario lo cambie.
10. Antes de `git push` a `main`, `master` o `prod`, recordar que `.github/workflows/production.yml` aplicará migraciones Prisma con `secrets.DATABASE_URL_PROD` y que Vercel puede desplegar por integración GitHub↔Vercel.

## Reglas

- No usar `git reset --hard`, `git checkout --` ni comandos destructivos salvo petición explícita del usuario.
- No leer, imprimir ni modificar `.env`.
- No modificar lockfiles que no sean `package-lock.json`; este proyecto usa npm.
- Si el remoto o la autenticación GitHub fallan, explicar el bloqueo y sugerir configurar `gh auth login`, SSH o Git Credential Manager.

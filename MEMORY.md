# MEMORY.md

## Preferencias del usuario
- Responder en español por defecto.
- Preguntar antes de hacer cambios ambiguos o decisiones estructurales que el repositorio no resuelva.
- Mantener la guía del repo compacta y evitar relleno genérico.

## Memoria del proyecto
- Esta es una app Next.js App Router para CrediRojas.
- Las instrucciones operativas para agentes están en `AGENTS.md`; léelo para comandos, estructura, detalles de Prisma/env y cautelas sobre archivos generados.
- Hay un workflow de producción en `.github/workflows/production.yml` que aplica migraciones Prisma en pushes a `main`, `master` o `prod` usando `secrets.DATABASE_URL_PROD`.
- El deploy de Vercel no está definido en el workflow; asumir integración automática GitHub↔Vercel salvo que el usuario indique otro flujo.
- El repositorio ya está subido a GitHub y desplegado en Vercel; usar `github-sync` o `/git/publish` para publicar cambios con validaciones y confirmaciones.
- El proyecto adoptó SDD con specs en `specs/NNN-nombre-corto/` y requisitos EARS documentados en `docs/sdd.md` y `docs/ears.md`.
- Las fechas de negocio usan `YYYY-MM-DD` sin hora; usar `src/lib/date.ts` (`todayCR`, `formatDateOnly`, `parseDateOnly`) y evitar `toISOString()` para fechas de negocio.
- Mantén este archivo para contexto persistente y preferencias que no pertenezcan como instrucciones técnicas directas en `AGENTS.md`.

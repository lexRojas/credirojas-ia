# constitution.md

## Propósito del proyecto

CrediRojas es una aplicación web Next.js App Router para administrar procesos financieros internos: socios, acciones, préstamos, pagos, solicitudes, votaciones, dividendos, reportes y notificaciones.

El proyecto debe priorizar estabilidad, seguridad de datos, trazabilidad de cambios y despliegues controlados.

## Principios técnicos

### 1. npm es el gestor oficial

- Usar `npm` como gestor de paquetes.
- Mantener `package-lock.json`.
- No generar lockfiles de pnpm, yarn o bun salvo decisión explícita del usuario.
- En CI usar `npm ci`.

### 2. Next.js App Router como arquitectura principal

- La aplicación vive bajo `src/app`.
- El alias `@/*` apunta a `src/*`.
- Las páginas protegidas están bajo `/home/*`.
- `src/app/api/*/actions.ts` contiene server actions importadas por componentes/páginas.
- Solo los archivos `route.ts` son endpoints HTTP reales.

### 3. Prisma y MySQL son la fuente de datos

- El esquema vive en `prisma/schema.prisma`.
- La base usa MySQL mediante `DATABASE_URL`.
- Cambios de modelo deben acompañarse de migraciones en `prisma/migrations/`.
- Producción aplica migraciones con `npx prisma migrate deploy`.
- No usar `prisma db push` para producción.

### 4. Seguridad y secretos

- No imprimir, modificar ni versionar `.env`.
- Variables críticas:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NEXT_PUBLIC_APP_URL`
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `CARBONE_API_KEY`
  - `DATABASE_URL_PROD` en GitHub Secrets
- El middleware valida `access_token` con `JWT_SECRET`.

### 4.1. Fechas de negocio

- Las fechas de negocio se almacenan y transportan como `string` en formato `YYYY-MM-DD`.
- No usar `DateTime` para fechas sin hora, como pagos, acciones, préstamos, solicitudes, ingreso/salida de socio, dividendos o calendario.
- Usar `DateTime` solo para instantes técnicos con hora real: expiración de tokens, `createdAt`, logs, cron y auditoría técnica.
- No usar `new Date().toISOString().split("T")[0]` para fechas de negocio porque depende de UTC.
- Para “hoy” de negocio, usar `todayCR()` desde `src/lib/date.ts`, que calcula la fecha local de Costa Rica (`America/Costa_Rica`).
- Para mostrar fechas, usar `formatDateOnly()` desde `src/lib/date.ts` o formatear desde el string `YYYY-MM-DD` sin reinterpretarlo como UTC.
- Los inputs `type="date"` deben recibir y devolver `YYYY-MM-DD`.

### 5. Verificación antes de publicar

Antes de subir cambios a `main`, `master` o `prod`, ejecutar:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Si el cambio es solo documentación, puede omitirse build con aprobación explícita.

### 6. GitHub y producción

- `.github/workflows/production.yml` corre en pushes a `main`, `master` y `prod`.
- El workflow aplica migraciones Prisma contra `secrets.DATABASE_URL_PROD`.
- Vercel despliega por integración GitHub↔Vercel, no por un paso explícito del workflow.
- Antes de hacer push a ramas productivas, confirmar impacto en base de datos y despliegue.

### 7. Publicación con OpenCode

- Para publicar cambios usar `@github-sync` o `/git/publish`.
- `git push` debe requerir confirmación.
- Revisar `git status`, `git diff` y archivos staged antes de commit.
- No subir artefactos generados:
  - `.next/`
  - `node_modules/`
  - `*.tsbuildinfo`
  - `next-env.d.ts`
  - `/src/generated/prisma`

### 8. Estilos y frontend

- Tailwind usa configuración v4 mediante `@import "tailwindcss"` en `src/styles/globals.css`.
- No existe `tailwind.config.*`.
- Mantener cambios visuales localizados en componentes o CSS existente salvo que se justifique una reorganización.

### 9. Documentación operativa

- `AGENTS.md` contiene instrucciones prácticas para agentes.
- `MEMORY.md` contiene contexto persistente y preferencias.
- Actualizar esos archivos solo cuando cambien comandos, arquitectura, despliegue, convenciones o decisiones duraderas.

## Reglas de cambio

Todo cambio debe cumplir al menos una de estas condiciones:

- Corrige un error real.
- Agrega una funcionalidad solicitada.
- Mejora seguridad, mantenibilidad o despliegue.
- Actualiza documentación operativa relevante.

Evitar cambios cosméticos, refactors amplios o reorganizaciones sin objetivo claro.

## Decisiones pendientes

- Definir si el flujo productivo oficial usa solo `main` o también `master`/`prod`.
- Confirmar si Vercel debe seguir desplegando automáticamente desde GitHub o si se agregará deploy explícito al workflow.
- Definir política formal para versionado visible de la app.

# AGENTS.md

- Leer también `MEMORY.md` para contexto persistente del proyecto y preferencias del usuario.
- Leer `docs/constitution.md` para principios del proyecto, reglas de cambio y criterios antes de publicar.
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.

## Comandos
- `npm run dev` inicia Next.js con Turbopack en el puerto 3000.
- `npm run build` ejecuta `prisma generate` antes de `next build --turbopack`; úsalo después de cambios en Prisma, pero las migraciones productivas las aplica GitHub Actions con `npx prisma migrate deploy`.
- `npm run lint` es la única verificación en scripts y falla con advertencias (`eslint . --ext .js,.ts,.jsx,.tsx --max-warnings=0`).
- No hay script de tests configurado; para verificar solo TypeScript ejecuta `npx tsc --noEmit`.
- Usa npm como gestor de paquetes; conserva `package-lock.json` y no regeneres lockfiles de pnpm/yarn/bun salvo que el usuario lo pida.

## GitHub Actions y producción
- `.github/workflows/production.yml` corre en pushes a `master`, `main` y `prod`, y también manualmente con `workflow_dispatch`.
- Ese workflow usa Node 20, instala dependencias con `npm ci` y ejecuta `npx prisma migrate deploy` contra `secrets.DATABASE_URL_PROD`.
- Antes de cambiar `prisma/schema.prisma`, genera y versiona la migración en `prisma/migrations/`; producción no usa `db push`.
- Antes de hacer push a `main`, `master` o `prod`, valida al menos `npm run lint`, `npx tsc --noEmit` y `npm run build`.
- No renombres ni elimines `DATABASE_URL_PROD` sin actualizar el workflow y los secretos de GitHub.
- El workflow no despliega Vercel explícitamente; si Vercel despliega, depende de la integración GitHub↔Vercel.
- Para publicar cambios usa la skill `github-sync` o el comando `/git/publish`; ambos deben pedir confirmación antes de `git add`, `git commit` y `git push`.
- `opencode.jsonc` permite inspección Git básica sin preguntar, pero deja `git add`, `git commit` y `git push` en modo confirmación.

## SDD y especificaciones
- Toda funcionalidad nueva debe tener una spec activa en `specs/NNN-nombre-corto/`.
- Usa EARS para requisitos verificables; guía en `docs/ears.md` y flujo en `docs/sdd.md`.
- Cada spec debe incluir `spec.md`, `plan.md`, `tasks.md`, `decisions.md` y `validation.md`.
- No implementes requisitos que no estén en la spec aprobada.
- Usa `/sdd/spec`, `/sdd/plan`, `/sdd/implement`, `/sdd/validate` y `/sdd/review-ears` para el flujo SDD.

## Estructura de la app
- Es una app Next.js App Router bajo `src/app`; `@/*` apunta a `src/*`.
- `src/app/(home)/layout.tsx` es un layout cliente que envuelve páginas `/home/*` con el sidebar y cierra sesión tras 10 minutos de inactividad borrando `access_token`.
- `src/middleware.ts` protege `/home/:path*`, `/socios/:path*` y `/prestamos/:path*` validando la cookie `access_token` con `JWT_SECRET`; fuerza runtime Node.
- Los archivos `src/app/api/*/actions.ts` son server actions importadas directamente por páginas/componentes, no endpoints HTTP. Los endpoints reales son solo archivos `route.ts`.

## Datos y servicios externos
- Prisma usa MySQL vía `DATABASE_URL`; el esquema está en `prisma/schema.prisma` y el cliente compartido en `src/lib/prisma.ts`.
- Variables de entorno usadas por el código: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `EMAIL_USER`, `EMAIL_PASS` y `CARBONE_API_KEY`.
- Los flujos de correo usan Nodemailer/Gmail con credenciales del entorno; los reportes se generan con Carbone desde `src/app/api/reportes/route.ts`.
- No imprimas ni modifiques `.env`; está ignorado y puede contener credenciales reales.

## Fechas
- Las fechas de negocio se manejan como `string` `YYYY-MM-DD`; no uses `DateTime` salvo instantes técnicos con hora real.
- No uses `toISOString().split("T")[0]` para fechas de negocio; usa `todayCR()` de `src/lib/date.ts`.
- No formatees `YYYY-MM-DD` con `new Date(fecha)` para mostrarlo; usa `formatDateOnly()` para evitar desplazamientos por zona horaria.
- Los inputs `type="date"` deben recibir y devolver `YYYY-MM-DD`.

## Estilos y archivos generados
- Tailwind usa estilo v4: `src/styles/globals.css` importa `tailwindcss`, con `@tailwindcss/postcss` en `postcss.config.mjs`; no existe `tailwind.config.*`.
- Trata `.next/`, `node_modules/`, `*.tsbuildinfo`, `next-env.d.ts` y `/src/generated/prisma` como artefactos generados/ignorados.
- `src/app/test/` está ignorado por git; evita poner ahí cambios duraderos de la app.

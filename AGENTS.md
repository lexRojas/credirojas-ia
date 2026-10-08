# AGENTS.md

- Leer también `MEMORY.md` para contexto persistente del proyecto y preferencias del usuario.

## Comandos
- `npm run dev` inicia Next.js con Turbopack en el puerto 3000.
- `npm run build` ejecuta `prisma generate` antes de `next build --turbopack`; úsalo después de cambios en el esquema de Prisma.
- `npm run lint` es la única verificación en scripts y falla con advertencias (`eslint . --ext .js,.ts,.jsx,.tsx --max-warnings=0`).
- No hay script de tests configurado; para verificar solo TypeScript ejecuta `npx tsc --noEmit`.
- Existen `package-lock.json` y `pnpm-lock.yaml`; no cambies de gestor de paquetes ni reescribas lockfiles salvo que el usuario lo pida.

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

## Estilos y archivos generados
- Tailwind usa estilo v4: `src/styles/globals.css` importa `tailwindcss`, con `@tailwindcss/postcss` en `postcss.config.mjs`; no existe `tailwind.config.*`.
- Trata `.next/`, `node_modules/`, `*.tsbuildinfo`, `next-env.d.ts` y `/src/generated/prisma` como artefactos generados/ignorados.
- `src/app/test/` está ignorado por git; evita poner ahí cambios duraderos de la app.

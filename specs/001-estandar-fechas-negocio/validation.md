# Validation

## Requisitos validados

- [x] Existe helper centralizado para fechas de negocio.
- [x] Las reglas están documentadas.
- [x] Los usos migrados no dependen de UTC para `YYYY-MM-DD`.

## Comandos

- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [x] `npm run build`

## Resultado

`npm run lint`, `npx tsc --noEmit` y `npm run build` pasaron correctamente. El primer build falló por bloqueo del DLL de Prisma causado por procesos `next dev`; se cerraron procesos Node del proyecto y el build posterior fue exitoso.

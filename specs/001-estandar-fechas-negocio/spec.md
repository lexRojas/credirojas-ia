# Spec: Estándar de fechas de negocio

## Estado

Approved

## Contexto

La aplicación maneja muchas fechas de negocio como pagos, acciones, préstamos, solicitudes, dividendos, calendario e ingreso/salida de socios. En la base de datos la mayoría de estas fechas están modeladas como `String` y se comparan por rango en formato `YYYY-MM-DD`.

Actualmente existen varias formas de generar y mostrar fechas (`toISOString`, `toLocaleDateString("en-CA")`, `toLocaleDateString("es-CR")` y `new Date(fecha)`), lo que puede causar desplazamientos por zona horaria.

## Alcance

### Incluye

- Definir una regla general del proyecto para fechas de negocio.
- Crear helper centralizado para fechas de solo día.
- Migrar usos seguros de generación/formateo de fecha de negocio al helper.
- Documentar la regla en guías operativas del proyecto.

### No incluye

- Cambiar tipos Prisma existentes.
- Migrar datos históricos.
- Corregir todos los usos de fechas en una sola entrega si requieren validación funcional amplia.

## Requisitos funcionales EARS

- El sistema debe almacenar y transportar fechas de negocio como `string` en formato `YYYY-MM-DD`.
- El sistema debe usar `DateTime` solo para instantes técnicos con hora real, como tokens, `createdAt`, cron y auditoría técnica.
- Cuando el sistema necesite la fecha actual para una operación de negocio, el sistema debe obtenerla en la zona `America/Costa_Rica`.
- Si una fecha `YYYY-MM-DD` se muestra en pantalla, entonces el sistema debe formatearla sin reinterpretarla como UTC.
- Cuando el sistema calcule fechas de cuotas o meses, el sistema debe devolver el resultado como `YYYY-MM-DD` sin usar `toISOString()` para fechas de negocio.

## Requisitos no funcionales

- El helper debe funcionar en cliente y servidor.
- La implementación no debe modificar `.env` ni secretos.
- Los cambios deben conservar compatibilidad con inputs HTML `type="date"`.

## Criterios de aceptación

- Existe un helper centralizado para fechas de negocio.
- `docs/constitution.md`, `AGENTS.md` y `MEMORY.md` describen la regla general.
- Los usos directos más seguros de “hoy” de negocio usan el helper.
- `npm run lint` y `npx tsc --noEmit` pasan correctamente.

## Casos límite

- Servidor en zona horaria distinta a Costa Rica.
- Navegador en zona horaria distinta a Costa Rica.
- Fechas de negocio cercanas a medianoche UTC.
- Valores vacíos o nulos en campos opcionales.

## Preguntas abiertas

- Si una pantalla requiere un formato visual distinto a `DD/MM/YYYY`, debe definirse en una spec específica.

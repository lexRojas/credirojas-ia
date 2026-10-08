# EARS

EARS ayuda a escribir requisitos claros, verificables y menos ambiguos. En este proyecto pueden escribirse en español manteniendo la estructura del patrón.

## Patrones

### Ubiquitous

Comportamiento siempre válido.

```md
- El sistema debe <respuesta verificable>.
```

### Event-driven

Respuesta ante un evento.

```md
- Cuando <evento>, el sistema debe <respuesta verificable>.
```

### State-driven

Comportamiento durante un estado.

```md
- Mientras <estado>, el sistema debe <respuesta verificable>.
```

### Unwanted behavior

Respuesta ante error o condición no deseada.

```md
- Si <condición no deseada>, entonces el sistema debe <respuesta verificable>.
```

### Optional feature

Comportamiento cuando una capacidad está habilitada.

```md
- Donde <funcionalidad esté habilitada>, el sistema debe <respuesta verificable>.
```

## Reglas de calidad

- Evitar palabras vagas como “rápido”, “fácil”, “correcto” o “mejor” sin criterio medible.
- Cada requisito debe poder validarse con una revisión, prueba manual o comando.
- Separar requisitos funcionales, no funcionales y criterios de aceptación.
- No mezclar varias obligaciones en un solo requisito si pueden fallar por separado.

## Ejemplo

```md
- Cuando el usuario envía credenciales válidas, el sistema debe crear la cookie `access_token` y redirigir a `/home`.
- Si el token JWT es inválido, entonces el sistema debe redirigir al usuario a `/`.
```

export function guardarEnLocalStorage<T>(clave: string, valor: T): void {
  // Convertir el valor a una cadena JSON (en caso de ser objeto o array)
  const valorGuardado = JSON.stringify(valor);

  // Guardar en el localStorage usando la clave proporcionada
  localStorage.setItem(clave, valorGuardado);
}

export function obtenerDeLocalStorage<T>(clave: string): T | null {
  // Obtener el valor del localStorage usando la clave
  const valorGuardado = localStorage.getItem(clave);

  // Si el valor existe, parsearlo de vuelta a su tipo original (si es necesario)
  return valorGuardado ? (JSON.parse(valorGuardado) as T) : null;
}

export const generateReport = async <T>(REPORT_ID: string, data: T) => {
  const datosReporte = {
    REPORT_ID: REPORT_ID,
    data: data,
  };


  const response = await fetch(`/api/reportes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosReporte),
  });

  const mblob = await response.blob();

  // Crear una URL temporal para el blob recibido
  const url = window.URL.createObjectURL(mblob);
  // Crear un elemento <a> para iniciar la descarga
  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte.pdf"; // Nombre del archivo a descargar
  document.body.appendChild(a);
  a.click();
  // Limpiar: remover el elemento y liberar la URL creada
  a.remove();
  window.URL.revokeObjectURL(url);
};

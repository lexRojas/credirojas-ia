import * as XLSX from "xlsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function jsonToExcel(jsonData: any[], fileName: string): void {
  // Crear un libro de trabajo (workbook)
  const wb = XLSX.utils.book_new();

  // Convertir el JSON a una hoja de Excel (worksheet)
  const ws = XLSX.utils.json_to_sheet(jsonData);

  // Añadir la hoja al libro de trabajo
  XLSX.utils.book_append_sheet(wb, ws, "Datos");

  // Generar el archivo Excel y forzar la descarga
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

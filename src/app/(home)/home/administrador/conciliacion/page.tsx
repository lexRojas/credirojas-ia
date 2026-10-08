'use client'

import { obtenerResumenPeriodo } from "@/app/api/dashboard/actions";
import { toDateOnly } from "@/lib/date";
import { useEffect, useMemo, useState } from "react";

interface Conciliacion {
  periodo: { inicio: string; fin: string };
  totales: {
    cantidadSocios: number;
    montoAcciones: number;
    accionesPagadas: number;
    montoPrestamos: number;
    capitalPagado: number;
    interesesOrdinarios: number;
    interesesMoratorios: number;
    saldoRestante: number;
    interesesTotales: number;
    dividendos: number;
    dividendos_pagados: number;
    totalAjustes: number;
  };
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const obtenerFechasAnioActual = (): { inicio: string; fin: string } => {
  const fechaActual = new Date();
  const inicio = new Date(fechaActual.getFullYear(), 0, 1);
  const fin = new Date(fechaActual.getFullYear(), 11, 31);
  return {
    inicio: toDateOnly(inicio),
    fin: toDateOnly(fin)
  };
};

const obtenerPrimerUltimoDiaMes = (mes: number): { primerDia: string; ultimoDia: string } => {
  const fechaActual = new Date();
  const anioActual = fechaActual.getFullYear();
  const primerDia = new Date(anioActual, mes - 1, 1);
  const ultimoDia = new Date(anioActual, mes, 0);
  return {
    primerDia: toDateOnly(primerDia),
    ultimoDia: toDateOnly(ultimoDia)
  };
};

const Page = () => {
  const [conciliacionYTD, setConciliacionYTD] = useState<Conciliacion | null>(null);
  const [conciliacionALL, setConciliacionALL] = useState<Conciliacion | null>(null);
  const [conciliacionesMensuales, setConciliacionesMensuales] = useState<(Conciliacion | null)[]>(Array(12).fill(null));
  const [cargando, setCargando] = useState(true);

  const fmtCRC = useMemo(
    () => new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }),
    []
  );

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);

        // Cargar YTD
        const { inicio, fin } = obtenerFechasAnioActual();
        const ytdPromise = obtenerResumenPeriodo({ inicio, fin });
        const longTimePromise = obtenerResumenPeriodo();

        // Cargar 12 meses en paralelo
        const mensualesPromises = Array.from({ length: 12 }, (_, i) => {
          const { primerDia, ultimoDia } = obtenerPrimerUltimoDiaMes(i + 1);
          return obtenerResumenPeriodo({ inicio: primerDia, fin: ultimoDia });
        });

        const [all, ytd, ...mensuales] = await Promise.all([longTimePromise, ytdPromise, ...mensualesPromises]);

        setConciliacionALL(all as Conciliacion);
        setConciliacionYTD(ytd as Conciliacion);
        setConciliacionesMensuales(mensuales as Conciliacion[]);
      } catch (e) {
        console.error("Error cargando conciliaciones:", e);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  if (cargando || !conciliacionYTD || !conciliacionALL) {
    return <div>Cargando...</div>;
  }

  // Reemplaza tus helpers por estos:
  const dashIfZero = (v?: number, fmt?: (n: number) => string) =>
    typeof v === "number" ? (v === 0 ? "-" : (fmt ? fmt(v) : String(v))) : "-";

  const celdaEntero = (v?: number) => dashIfZero(v, (n) => n.toString());
  const celdaDosDec = (v?: number) => dashIfZero(v, (n) => n.toFixed(2));
  const celdaCRC = (v?: number) => dashIfZero(v, (n) => fmtCRC.format(n));


  return (
    <div className="max-w-full overflow-x-auto">
      <h1 className="font-bold p-2">
        CONCILIACIÓN PERIODO ({conciliacionYTD.periodo.inicio} - {conciliacionYTD.periodo.fin})
      </h1>
      <hr />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr className="border-2 bg-blue-300">
            <th style={{ border: "1px solid #000000", padding: "8px", textAlign: "left", whiteSpace: "nowrap" }}>
              Concepto
            </th>
            <th style={{ border: "1px solid #000000", padding: "8px", textAlign: "right", whiteSpace: "nowrap" }}>
              Valor ALL
            </th>

            <th style={{ border: "1px solid #000000", padding: "8px", textAlign: "right", whiteSpace: "nowrap" }}>
              Valor YTD
            </th>
            {MESES.map((m) => (
              <th
                key={m}
                style={{ border: "1px solid #000000", padding: "8px", textAlign: "right", whiteSpace: "nowrap" }}
              >
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Cantidad socios */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Cantidad socios</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaEntero(conciliacionALL.totales.cantidadSocios)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaEntero(conciliacionYTD.totales.cantidadSocios)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaEntero(cm?.totales.cantidadSocios)}
              </td>
            ))}
          </tr>

          {/* Acciones pagadas (2 decimales) */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Acciones pagadas</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaDosDec(conciliacionALL.totales.accionesPagadas)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaDosDec(conciliacionYTD.totales.accionesPagadas)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaDosDec(cm?.totales.accionesPagadas)}
              </td>
            ))}
          </tr>

          {/* Monto total de acciones */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Monto total de acciones</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.montoAcciones)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.montoAcciones)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.montoAcciones)}
              </td>
            ))}
          </tr>

          {/* Monto total de préstamos */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Monto total de préstamos</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.montoPrestamos)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.montoPrestamos)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.montoPrestamos)}
              </td>
            ))}
          </tr>

          {/* Capital pagado */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Monto total de capital pagado</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.capitalPagado)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.capitalPagado)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.capitalPagado)}
              </td>
            ))}
          </tr>

          {/* Intereses ordinarios */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Monto total de intereses ordinarios</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.interesesOrdinarios)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.interesesOrdinarios)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.interesesOrdinarios)}
              </td>
            ))}
          </tr>

          {/* Intereses moratorios */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Monto total de intereses moratorios</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.interesesMoratorios)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.interesesMoratorios)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.interesesMoratorios)}
              </td>
            ))}
          </tr>

          {/* Intereses Totales */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Intereses Totales</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.interesesTotales)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.interesesTotales)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.interesesTotales)}
              </td>
            ))}
          </tr>

          {/* dividendos capitalizados*/}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Dividendos Capitalizados (***)</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.dividendos)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.dividendos)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.dividendos)}
              </td>
            ))}
          </tr>

          {/* dividendos pagados*/}
          <tr className="bg-red-200">
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Dividendos Pagados</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.dividendos_pagados)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.dividendos_pagados)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.dividendos_pagados)}
              </td>
            ))}
          </tr>


          {/* Ajustes Auxiliares */}
          <tr>
            <td style={{ border: "1px solid #000000", padding: "8px" }}>Ajustes Auxiliares</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.totalAjustes)}
            </td>

            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.totalAjustes)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.totalAjustes)}
              </td>
            ))}
          </tr>

          {/* Saldo restante (negrita) */}
          <tr>
            <td style={{ fontWeight: "bold", border: "1px solid #000000", padding: "8px" }}>Saldo restante</td>
            <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionALL.totales.saldoRestante)}
            </td>

            <td style={{ fontWeight: "bold", border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
              {celdaCRC(conciliacionYTD.totales.saldoRestante)}
            </td>
            {conciliacionesMensuales.map((cm, idx) => (
              <td key={idx} style={{ fontWeight: "bold", border: "1px solid #000000", padding: "8px", textAlign: "right" }}>
                {celdaCRC(cm?.totales.saldoRestante)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <p className="mt-3 text-sm"> <strong>ALL:</strong> All. Valor acumulado de todos los años</p>
      <p className="mt-3 text-sm">** <strong>YTD:</strong> Year to Day. Valor acumulado a la fecha del periodo anual</p>
      <p className="mt-3 text-sm">*** <strong>Dividendos Capitalizados:</strong> Los dividendos capitalizados no afectan el saldo restante porque son parte de los intereses totales</p>
    </div>
  );
};

export default Page;

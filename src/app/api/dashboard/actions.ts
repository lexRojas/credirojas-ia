"use server";

import { prisma } from "@/lib/prisma";
import { EstadoSocio, Prisma } from "@prisma/client";

export interface DashboardData {
  f0: number;
  f1: number;
  f2: number;
  f3: number;
}

export const getDashboardData = async (
  periodo: number
): Promise<DashboardData[] | undefined> => {
  try {
    const data = await prisma.$queryRaw<
      DashboardData[]
    >`call sp_genera_dashboard_data(${periodo});`;

    if (data) {
      return data;
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
    return;
  }
};

interface datosType {
  f0: number;
  f1: string;
  f2: number;
}

export const getDashboardDataSocios = async (
  periodo: number
): Promise<datosType[] | undefined> => {
  try {
    const data = await prisma.$queryRaw<
      datosType[]
    >`call sp_resumen_accion_by_periodo(${periodo});`;

    if (data) {
      return data;
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
    return;
  }
};

export interface SocioAuditoriaPrestamo {
  idSocio: number;
  cedula: string;
  nombre: string;
  prestamos: Prestamo[];
}
interface SocioData {
  idSocio: number;
  cedula: string;
  nombre: string;
  acciones: Accion[];
  prestamos: Prestamo[];
}

interface Accion {
  idAccion: number;
  fecha: string; // Formato de fecha dependiendo de la base de datos
  cantidadAcciones: number;
  periodo: string | null;
  mes: string | null;
  pesoMultiplicador: number | null;
  monto_colones: number;
}

interface Prestamo {
  idPrestamo: number;
  fecha: string; // Formato de fecha dependiendo de la base de datos
  monto: number;
  plazo: number;
  motivo: string | null;
  modalidad: string;
  saldoCapital: number;
  saldoInteresOrdinario: number;
  saldoInteresMoratorio: number;
  pagos: Pago[];
}

interface Pago {
  idPago: number;
  fechaProyectada: string; // Formato de fecha dependiendo de la base de datos
  fechaReal: string | null; // Formato de fecha dependiendo de la base de datos
  monto: number;
  interesOrdinario: number;
  tipoCuota: string;
  interesMoratorio: number;
}

export const getSocioDashboardData = async (
  id: number
): Promise<SocioData | null> => {
  try {
    const data: SocioData | null = await prisma.socio.findFirst({
      where: { idSocio: id },
      select: {
        idSocio: true,
        cedula: true,
        nombre: true,
        acciones: {
          select: {
            idAccion: true,
            fecha: true,
            cantidadAcciones: true,
            periodo: true,
            mes: true,
            pesoMultiplicador: true,
            monto_colones: true,
          },
          orderBy: [{ fecha: "asc" }],
        },
        prestamos: {
          select: {
            idPrestamo: true,
            fecha: true,
            monto: true,
            plazo: true,
            motivo: true,
            modalidad: true,
            saldoCapital: true,
            saldoInteresOrdinario: true,
            saldoInteresMoratorio: true,
            pagos: {
              select: {
                idPago: true,
                fechaProyectada: true,
                fechaReal: true,
                monto: true,
                interesOrdinario: true,
                tipoCuota: true,
                interesMoratorio: true,
              },
              orderBy: {
                fechaReal: "asc",
              },
            },
          },
          orderBy: {
            idPrestamo: "asc",
          },
        },
      },
    });

    if (data) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

// prisma/resumenPeriodo.ts

type Periodo = {
  inicio?: string; // ISO "YYYY-MM-DD" también funciona si tus fechas son String (ISO)
  fin?: string;
};

/**
 * Modelos asumidos (cámbialos si tu schema difiere):
 * - AccionPago { fecha, monto, cantidadAcciones, socioId? }
 * - Prestamo   { fechaDesembolso, monto, socioId? }
 * - PagoPrestamo { fechaPago, capital, interesOrdinario, interesMoratorio, socioId? }
 *
 * Si usas otros nombres (ej. PagosAcciones, Loan, LoanPayment, etc.) cambia abajo.
 */
export async function obtenerResumenPeriodo({ inicio, fin }: Periodo={}) {
  inicio = inicio ?? "2000-01-01";
  fin = fin ?? "2100-12-31";

  console.log(inicio, fin);

  // Helper para convertir Prisma.Decimal | number | null -> number
  const toNum = (v: Prisma.Decimal | number | null | undefined) =>
    v ? Number(v) : 0;

  const [sociosAgg, accionesAgg, prestamosAgg, pagosAgg, desafiliacionesAgg, incobrablesAgg] =
    await prisma.$transaction([
      //===== CANTIDAD DE SOCIOS =====//
      prisma.socio.aggregate({
        _count: {
          idSocio: true,
        },
        where: {
          OR: [
            { estadoSocio: EstadoSocio.ACTIVO },
            { fechaSalida: { gte: inicio as string } },
          ],
          fechaIngreso: { lte: fin as string },
        }, // Cambia "fecha" por el campo fecha que uses
      }),

      // ====== TOTAL MONTO POR ACCIONES y CANTIDAD DE ACCIONES ======
      prisma.accion.aggregate({
        // Cambia "accionPago" por tu modelo real de pagos de acciones
        _sum: {
          monto_colones: true, // total del monto pagado por socios en acciones
          cantidadAcciones: true, // total de acciones pagadas en general (cantidad/unidades)
        },
        where: {
          // Si tu fecha es String ISO ("YYYY-MM-DD"), gte/lte funciona igualmente
          fecha: { gte: inicio as string, lte: fin as string },
        },
      }),

      // ====== TOTAL MONTOS DE PRÉSTAMOS OTORGADOS ======
      prisma.prestamo.aggregate({
        // Cambia "prestamo" por tu modelo real de préstamos
        _sum: {
          monto: true, // monto total de préstamos hechos por los socios (desembolsos)
        },
        where: {
          // Cambia "fechaDesembolso" por el campo fecha que uses
          fecha: { gte: inicio as string, lte: fin as string },
        },
      }),

      // ====== TOTALES DE PAGOS (CAPITAL E INTERESES) ======
      prisma.pago.aggregate({
        // Cambia "pagoPrestamo" por tu modelo real de pagos de préstamo
        _sum: {
          monto: true, // monto total de capital pagado
          interesOrdinario: true, // monto total de intereses ordinarios
          interesMoratorio: true, // monto total de intereses moratorios
        },
        where: {
          // Cambia "fechaPago" por el campo fecha que uses
          fechaReal: { gte: inicio as string, lte: fin as string },
        },
      }),

      prisma.desafiliacion.aggregate({
        _sum: {
          saldoPagado: true,
        },
        where: {
          fechaSalida: { gte: inicio as string, lte: fin as string },
        },
      }),

      prisma.incobrable.aggregate({
        _sum: {
          monto: true,
        },
        where: {
          fecha: { gte: inicio as string, lte: fin as string },
        },
      }),
    ]);

  //calculo de valores ingresos / egresos aux
  const auxiliares = await prisma.auxiliarContable.findMany({
    where: {
      fecha: { gte: inicio as string, lte: fin as string },
    },
  });

  //calculo de dividendos capitalizados
  const dividentos_capitalizados = await prisma.dividendos.aggregate({
    where: {
      fecha: { gte: inicio as string, lte: fin as string },
      capitalizado: true,
      periodoBloqueado: true,
    },
    _sum: {
      monto: true,
    },
  });

  //calculo de dividendos pagados
  const dividentos_pag = await prisma.dividendos.aggregate({
    where: {
      fecha: { gte: inicio as string, lte: fin as string },
      capitalizado: false,
      periodoBloqueado: true,
    },
    _sum: {
      monto: true,
    },
  });

  const totalAjustes = auxiliares.reduce((acc, aux) => {
    const monto = toNum(aux.monto * aux.tipoMovimiento);
    return acc + monto;
  }, 0);

  const cantidadSocios = toNum(sociosAgg._count.idSocio);
  const montoAcciones = toNum(accionesAgg._sum.monto_colones);
  const accionesPagadas = (accionesAgg._sum.cantidadAcciones ?? 0) as number; // cantidad/unidades
  const montoPrestamos = toNum(prestamosAgg._sum.monto);
  const capitalPagado = toNum(pagosAgg._sum.monto);
  const interesesOrdinarios = toNum(pagosAgg._sum.interesOrdinario);
  const interesesMoratorios = toNum(pagosAgg._sum.interesMoratorio);
  const dividendos = toNum(dividentos_capitalizados._sum.monto ?? 0);
  const dividendos_pagados = toNum(dividentos_pag._sum.monto ?? 0);
  const pagosDesafiliacion = toNum(desafiliacionesAgg._sum.saldoPagado ?? 0);
  const pagosIncobrables = toNum(incobrablesAgg._sum.monto ?? 0);

  // Fórmula solicitada:
  // saldo = monto total de acciones - monto total de préstamos + capital + intereses ordinarios + intereses moratorios
  const saldoRestante =
    montoAcciones -
    montoPrestamos +
    capitalPagado +
    interesesOrdinarios +
    interesesMoratorios -
    dividendos_pagados +
    totalAjustes -
    pagosDesafiliacion -
    pagosIncobrables;

  const interesesTotales = interesesOrdinarios + interesesMoratorios;

  return {
    periodo: { inicio, fin },
    totales: {
      cantidadSocios, //cantidad de socios
      montoAcciones, // total del monto pagado por socios en acciones
      accionesPagadas, // total de acciones pagadas (cantidad)
      montoPrestamos, // monto total de préstamos hechos por los socios
      capitalPagado, // monto total de capital pagado
      interesesOrdinarios, // monto total de intereses ordinarios
      interesesMoratorios, // monto total de intereses moratorios
      saldoRestante, // según la fórmula solicitada
      interesesTotales, // intereses ordinarios + intereses moratorios
      dividendos,
      dividendos_pagados,
      totalAjustes,
      pagosDesafiliacion,
      pagosIncobrables,
    },
  };
}

interface dataTemplate {
  idSocio: number;
  cedula: string;
  nombre: string;
  m1?: number;
  m2?: number;
  m3?: number;
  m4?: number;
  m5?: number;
  m6?: number;
  m7?: number;
  m8?: number;
  m9?: number;
  m10?: number;
  m11?: number;
  m12?: number;
  total?: number;
}

// Auditoria de pagos de acciones de socios x mes
export const getAuditoriaSocioAcciones = async (
  periodo: string
): Promise<dataTemplate[] | null> => {
  try {
    const socios = await prisma.socio.findMany({
      select: {
        idSocio: true,
        cedula: true,
        nombre: true,
      },
      where: {
        estadoSocio: EstadoSocio.ACTIVO,
      },
    });

    const result = await prisma.accion.groupBy({
      by: ["socioId", "periodo", "mes"], // Agrupar por socio, periodo y mes
      _sum: {
        cantidadAcciones: true, // Sumar las acciones por cada agrupación
      },
      orderBy: {
        socioId: "asc", // Ordenar por socioId (puedes modificar esto si lo necesitas)
      },
      where: {
        periodo: periodo,
      },
    });
    console.log(result);

    const datamatrix: dataTemplate[] = socios.map((socio) => {
      const socioId = socio.idSocio;
      const cedula = socio.cedula;
      const nombre = socio.nombre;

      const total = result.reduce((total, item) => {
        if (item.socioId === socioId) {
          total += item._sum.cantidadAcciones ?? 0;
        }
        return total;
      }, 0);

      const m1 =
        result.find((item) => item.socioId === socioId && item.mes === "1")
          ?._sum.cantidadAcciones ?? 0;
      const m2 =
        result.find((item) => item.socioId === socioId && item.mes === "2")
          ?._sum.cantidadAcciones ?? 0;
      const m3 =
        result.find((item) => item.socioId === socioId && item.mes === "3")
          ?._sum.cantidadAcciones ?? 0;
      const m4 =
        result.find((item) => item.socioId === socioId && item.mes === "4")
          ?._sum.cantidadAcciones ?? 0;
      const m5 =
        result.find((item) => item.socioId === socioId && item.mes === "5")
          ?._sum.cantidadAcciones ?? 0;
      const m6 =
        result.find((item) => item.socioId === socioId && item.mes === "6")
          ?._sum.cantidadAcciones ?? 0;
      const m7 =
        result.find((item) => item.socioId === socioId && item.mes === "7")
          ?._sum.cantidadAcciones ?? 0;
      const m8 =
        result.find((item) => item.socioId === socioId && item.mes === "8")
          ?._sum.cantidadAcciones ?? 0;
      const m9 =
        result.find((item) => item.socioId === socioId && item.mes === "9")
          ?._sum.cantidadAcciones ?? 0;
      const m10 =
        result.find((item) => item.socioId === socioId && item.mes === "10")
          ?._sum.cantidadAcciones ?? 0;
      const m11 =
        result.find((item) => item.socioId === socioId && item.mes === "11")
          ?._sum.cantidadAcciones ?? 0;
      const m12 =
        result.find((item) => item.socioId === socioId && item.mes === "12")
          ?._sum.cantidadAcciones ?? 0;

      return {
        idSocio: socioId,
        cedula,
        nombre,
        m1: m1,
        m2: m2,
        m3: m3,
        m4: m4,
        m5: m5,
        m6: m6,
        m7: m7,
        m8: m8,
        m9: m9,
        m10: m10,
        m11: m11,
        m12: m12,
        total: total,
      };
    });

    if (datamatrix) {
      return datamatrix;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Auditoria de pagos de prestamos de socios x mes

interface templateAuditoriaSociosPrestanos {
  idSocio: number;
  cedula: string;
  nombre: string;
  prestamos: Record<string, MesData>;
}

export const getAuditoriaSocioPrestamos = async (
  periodo: number
): Promise<templateAuditoriaSociosPrestanos[] | null> => {
  try {
    const socios = await prisma.socio.findMany({
      select: {
        idSocio: true,
        cedula: true,
        nombre: true,
        prestamos: {
          select: {
            fecha_inicio_pago: true,
            pagos: true,
          },
          orderBy: {
            fecha: "asc",
          },
        },
      },
      where: {
        estadoSocio: EstadoSocio.ACTIVO,
        prestamos: {
          some: {},
        },
      },
    });

    const result = socios.map((socio) => {
      const prestamos_pagos_socio = calcularPrestamosPorMes(
        socio.prestamos,
        periodo
      );

      return {
        idSocio: socio.idSocio,
        cedula: socio.cedula,
        nombre: socio.nombre,
        prestamos: prestamos_pagos_socio,
      };
    });

    if (result) {
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

type PrestamoRecord = [
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface SocioAuditoriaPrestamoOutput {
  idSocio: number;
  cedula: string;
  nombre: string;
  prestamos: PrestamoRecord[];
}

export const getAuditoriaSocioPrestamos2 = async (
  periodo: number
): Promise<SocioAuditoriaPrestamoOutput[] | null> => {
  try {
    const socios: SocioAuditoriaPrestamo[] = await prisma.socio.findMany({
      select: {
        idSocio: true,
        cedula: true,
        nombre: true,
        prestamos: {
          select: {
            idPrestamo: true,
            fecha: true,
            monto: true,
            plazo: true,
            motivo: true,
            modalidad: true,
            saldoCapital: true,
            saldoInteresOrdinario: true,
            saldoInteresMoratorio: true,
            pagos: {
              orderBy: {
                fechaReal: "asc", // Ordena los pagos por fechaReal en orden ascendente
              },
            },
          },
          where: {
            saldoCapital: {
              gt: 0,
            },
          },
          orderBy: {
            fecha: "asc", // Si deseas ordenar los préstamos por fecha también
          },
        },
      },
      where: {
        estadoSocio: EstadoSocio.ACTIVO,
        prestamos: {
          some: {},
        },
      },
    });

    const result = socios.map((socio) => {
      const prestamos_pagos_socio = calcularPrestamosPorMes2(
        socio.prestamos,
        periodo
      );

      return {
        idSocio: socio.idSocio,
        cedula: socio.cedula,
        nombre: socio.nombre,
        prestamos: prestamos_pagos_socio,
      };
    });

    if (result) {
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

function calcularPrestamosPorMes2(
  prestamos: Prestamo[],
  año: number
): PrestamoRecord[] {
  const detalle: PrestamoRecord[] = [];

  prestamos.forEach((prestamo) => {
    const linea: PrestamoRecord = [
      "",
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      prestamo.plazo,
    ];
    if (!prestamo.fecha) return;
    const fechaPrestamo = new Date(prestamo.fecha);
    const añoPrestamo = fechaPrestamo.getUTCFullYear();
    if (añoPrestamo === año) {
      linea[0] = prestamo.motivo!;
      prestamo.pagos.forEach((pago, index) => {
        if (!pago.fechaReal) return;
        const mesPago = new Date(pago.fechaReal).getUTCMonth() + 1;
        linea[mesPago] = index + 1;
      });
      detalle.push(linea);
    }
  });
  return detalle;
}

interface MesData {
  pMes: number;
  aMes: number;
}

function calcularPrestamosPorMes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prestamos: any[],
  año: number
): Record<string, MesData> {
  const resultado: Record<string, MesData> = {};
  for (let i = 1; i <= 12; i++) {
    resultado[`m${i}`] = { pMes: 0, aMes: 0 };
  }

  let valorPrestamosMes = 0;
  prestamos.forEach((prestamo) => {
    if (!prestamo.fecha_inicio_pago) return;
    const fechaPrestamo = new Date(prestamo.fecha_inicio_pago);
    const mesPrestamo = fechaPrestamo.getUTCMonth() + 1;
    const añoPrestamo = fechaPrestamo.getUTCFullYear();

    // Contar solo si el préstamo pertenece al año
    if (añoPrestamo === año) {
      valorPrestamosMes += 1;
      resultado[`m${mesPrestamo}`].pMes = valorPrestamosMes;
      // Contar los pagos asociados que también pertenezcan al mismo año
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prestamo.pagos?.forEach((pago: any) => {
        if (!pago.fechaReal) return;
        const fechaPago = new Date(pago.fechaReal);
        const mesPago = fechaPago.getUTCMonth() + 1;
        const añoPago = fechaPago.getUTCFullYear();

        if (añoPago === año) {
          resultado[`m${mesPago}`].pMes = valorPrestamosMes;
          resultado[`m${mesPago}`].aMes += 1;
        }
      });
    }
  });

  return resultado;
}

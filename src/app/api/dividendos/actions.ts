"use server";

import { prisma } from "@/lib/prisma";
import { getVariableValue } from "../variables/actions";

const calcularInteresesesFuturos = (
  saldo: number,
  tasaInteresMensual: number,
  meses: number,
  limite_meses: number
): number => {
  let montoInteresesTotal = 0;
  let saldoInicial = saldo;
  const cuotaMensual = saldo / meses;

  //limita el tiempo de calculo de intereses al tiempo que tarde el periodo.
  if (meses > limite_meses) {
    meses = limite_meses;
  }

  for (let i = 0; i < meses; i++) {
    const interesMensual = saldoInicial * tasaInteresMensual;
    montoInteresesTotal += interesMensual;
    saldoInicial -= cuotaMensual;
  }

  return montoInteresesTotal;
};

//Obtengo las acciones por mes por año de cada socio
export const getProyeccionDividendos = async (
  idSocio: number,
  periodo?: string
): Promise<{
  dividendos_actuales: number;
  intereses_totales: number;
  porcentaje_dividendos: number;
  intereses_futuros: number;
  dividendos_futuros: number;
  dividendos_capitalizados: number;
}> => {
  //Obtengo el periodo actual
  if (!periodo) {
    const periodo_table = await prisma.calendario.findUnique({
      where: {
        fecha: new Date().toISOString().split("T")[0],
      },
      select: {
        periodo: true,
      },
    });

    periodo = periodo_table?.periodo ?? "";
  }
  const periodo_anterior = (Number.parseInt(periodo, 10) - 1).toString();

  // Monto de acciones pagadas por socio activos
  const acciones_periodo = await prisma.accion.findMany({
    where: {
      calendario: {
        periodo: periodo,
      },
      socio: {
        fechaSalida: "",
      },
    },
    select: {
      monto_colones: true,
      calendario: {
        select: {
          factor: true,
        },
      },
    },
  });

  const acciones_periodo_total = acciones_periodo.reduce((sumatoria, item) => {
    return sumatoria + item.monto_colones * item.calendario.factor;
  }, 0);

  // Monto de acciones pagadas por socio activos periodo anterior
  const acciones_periodo_anterior = await prisma.accion.findMany({
    where: {
      calendario: {
        periodo: periodo_anterior,
      },
      socio: {
        fechaSalida: "",
      },
    },
    select: {
      monto_colones: true,
    },
  });

  const acciones_periodo_total_anterior = acciones_periodo_anterior.reduce(
    (sumatoria, item) => {
      return sumatoria + item.monto_colones;
    },
    0
  );

  // Monto de acciones pagadas por el socio
  const acciones_periodo_socio = await prisma.accion.findMany({
    where: {
      socioId: idSocio,
      calendario: {
        periodo: periodo,
      },
      socio: {
        fechaSalida: "",
      },
    },
    select: {
      monto_colones: true,
      calendario: {
        select: {
          factor: true,
        },
      },
    },
  });

  const acciones_periodo_socio_total = acciones_periodo_socio.reduce(
    (sumatoria, item) => {
      return sumatoria + item.monto_colones * item.calendario.factor;
    },
    0
  );

  // Monto de acciones pagadas por el socio anterior
  const acciones_periodo_socio_anterior = await prisma.accion.findMany({
    where: {
      socioId: idSocio,
      calendario: {
        periodo: periodo_anterior,
      },
      socio: {
        fechaSalida: "",
      },
    },
    select: {
      monto_colones: true,
    },
  });

  const acciones_periodo_socio_total_anterior =
    acciones_periodo_socio_anterior.reduce((sumatoria, item) => {
      return sumatoria + item.monto_colones;
    }, 0);

  //intereses
  const intereses = await prisma.pago.findMany({
    where: {
      calendario: {
        periodo: periodo,
      },
      socio: {
        fechaSalida: "",
      },
    },
    select: {
      interesMoratorio: true,
      interesOrdinario: true,
    },
  });

  const intereses_total = intereses.reduce((sumatoria, item) => {
    return sumatoria + item.interesMoratorio + item.interesOrdinario;
  }, 0);

  //Obtengo los dividentos capitalizados por socio
  const dividentos_capitalizados_socio = await prisma.dividendos.aggregate({
    where: {
      socioId: idSocio,
      periodo: periodo_anterior,
      capitalizado: true,
    },
    _sum: {
      monto: true,
    },
  });

  //Obtengo los dividentos capitalizados por socio
  const dividentos_capitalizados_total = await prisma.dividendos.aggregate({
    where: {
      periodo: periodo_anterior,
      capitalizado: true,
    },
    _sum: {
      monto: true,
    },
  });

  //CALCULO DE DIVIDENDOS
  const porcentaje_dividendos =
    ((acciones_periodo_socio_total_anterior +
      (dividentos_capitalizados_socio._sum.monto ?? 0)) *
      13 +
      acciones_periodo_socio_total) /
    ((acciones_periodo_total_anterior +
      (dividentos_capitalizados_total._sum.monto ?? 1)) *
      13 +
      acciones_periodo_total);

  const dividendos = intereses_total * porcentaje_dividendos;

  //proyeccion a futuro
  const prestamos = await prisma.prestamo.findMany({
    where: {
      saldoCapital: {
        gt: 0,
      },
    },
    select: {
      idPrestamo: true,
      saldoCapital: true,
      plazo: true,
      pagos: {
        select: {
          idPago: true,
        },
      },
    },
    orderBy: {
      idPrestamo: "asc",
    },
  });

  const { valor: tasaInteresMensual } = await getVariableValue(2);

  const meses_pendientes_periodo = await prisma.calendario.groupBy({
    by: ["mes"],
    where: {
      periodo: periodo,
      fecha: {
        gte: new Date().toISOString().split("T")[0],
      },
    },
    _count: {
      mes: true,
    },
  });

  const limite_meses_periodo =
    meses_pendientes_periodo.length > 1
      ? meses_pendientes_periodo.length - 1
      : 0;

  //Simulacro de pagos a futuro de cada prestamos para determinar los intereses futuros
  let intereses_futuros = 0;
  for (const prestamo of prestamos) {
    const saldo = prestamo.saldoCapital;
    const plazo_total = prestamo.plazo;
    const cuotas = prestamo.pagos.length;
    const cuotas_pendientes = plazo_total - cuotas;

    intereses_futuros += calcularInteresesesFuturos(
      saldo,
      tasaInteresMensual,
      cuotas_pendientes,
      limite_meses_periodo
    );
  }

  const dividendos_futuros =
    (intereses_futuros + intereses_total) * porcentaje_dividendos;

  return {
    dividendos_actuales: dividendos,
    intereses_totales: intereses_total,
    porcentaje_dividendos: porcentaje_dividendos,
    intereses_futuros: intereses_futuros + intereses_total,
    dividendos_futuros: dividendos_futuros,
    dividendos_capitalizados: dividentos_capitalizados_socio._sum.monto ?? 0,
  };
};

export type getDividendosPeriodoType = {
  idSocio: number;
  periodo: string;
  nombreSocio: string;
  fechaIngreso: string;
  fechaSalida: string;
  cantidadAcciones: number;
  dividendos_capitalizados: number;
  montoAhorrado: number;
  montoPrestado: number;
  montoDisponible: number;
  interesPagados: number;
  montoDividendos: number;
};

export const getDividendosPeriodo = async (
  periodo: string
): Promise<getDividendosPeriodoType[]> => {
  //obtengo la lista de socios
  const socios = await prisma.socio.findMany({
    where: {
      fechaSalida: "",
    },
    select: {
      idSocio: true,
      cedula: true,
      nombre: true,
      fechaIngreso: true,
      fechaSalida: true,
      acciones: {
        select: {
          cantidadAcciones: true,
          monto_colones: true,
        },
      },
      prestamos: {
        select: {
          saldoCapital: true,
        },
      },
      pagos: {
        select: {
          interesMoratorio: true,
          interesOrdinario: true,
        },
      },
    },
    orderBy: {
      idSocio: "asc",
    },
  });

  let total_acciones = 0;
  let total_monto_acciones = 0;
  let total_saldo_capital = 0;
  let total_interes_moratorio = 0;
  let total_interes_ordinario = 0;
  let dividendos;
  const dividendosPeriodoOutPut: getDividendosPeriodoType[] = [];

  for (const socio of socios) {
    total_acciones = socio.acciones.reduce((sumatoria, item) => {
      return sumatoria + item.cantidadAcciones;
    }, 0);

    total_monto_acciones = socio.acciones.reduce((sumatoria, item) => {
      return sumatoria + item.monto_colones;
    }, 0);

    total_saldo_capital = socio.prestamos.reduce((sumatoria, item) => {
      return sumatoria + item.saldoCapital;
    }, 0);

    total_interes_moratorio = socio.pagos.reduce((sumatoria, item) => {
      return sumatoria + item.interesMoratorio;
    }, 0);

    total_interes_ordinario = socio.pagos.reduce((sumatoria, item) => {
      return sumatoria + item.interesOrdinario;
    }, 0);

    //obtengo los dividendos
    dividendos = await getProyeccionDividendos(socio.idSocio, periodo);

    dividendosPeriodoOutPut.push({
      idSocio: socio.idSocio,
      periodo: periodo,
      nombreSocio: socio.nombre,
      fechaIngreso: socio.fechaIngreso!,
      fechaSalida: socio.fechaSalida!,
      cantidadAcciones: total_acciones,
      montoAhorrado: total_monto_acciones,
      montoPrestado: total_saldo_capital,
      montoDisponible: total_monto_acciones - total_saldo_capital,
      interesPagados: total_interes_moratorio + total_interes_ordinario,
      montoDividendos: dividendos.dividendos_actuales,
      dividendos_capitalizados: dividendos.dividendos_capitalizados,
    });
  }

  return dividendosPeriodoOutPut;
};

export const setDividendosPeriodo = async (
  periodo: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Buscar dividendos del periodo
    const dividendosExistentes = await prisma.dividendos.findMany({
      where: { periodo },
      select: { periodoBloqueado: true },
    });

    // Si existen dividendos y están bloqueados → no se permite reemplazar
    const periodoBloqueado = dividendosExistentes.some(
      (d) => d.periodoBloqueado
    );

    if (periodoBloqueado) {
      return {
        success: false,
        message:
          "El periodo está bloqueado. No se pueden reemplazar los dividendos.",
      };
    }

    // Si existen y NO están bloqueados → se borran para regenerarlos
    if (dividendosExistentes.length > 0) {
      await prisma.dividendos.deleteMany({
        where: { periodo },
      });
    }

    // Obtener dividendos nuevos
    const nuevosDividendos = await getDividendosPeriodo(periodo);

    if (nuevosDividendos.length === 0) {
      return {
        success: false,
        message: "No hay datos para generar dividendos en este periodo.",
      };
    }

    // Preparar datos para createMany (más eficiente)
    const dataToInsert = nuevosDividendos.map((d) => ({
      socioId: d.idSocio,
      fecha: new Date().toISOString().split("T")[0],
      periodo,
      monto: d.montoDividendos,
      capitalizado: false,
      periodoBloqueado: false,
    }));

    // Insertar en una sola operación
    const result = await prisma.dividendos.createMany({
      data: dataToInsert,
    });

    return {
      success: true,
      message: `Dividendos creados correctamente (${result.count} registros).`,
    };
  } catch (error) {
    console.error("❌ Error creando dividendos:", error);
    return {
      success: false,
      message: "Error interno al crear los dividendos.",
    };
  }
};

export type getDividendosPeriodoSavedType = {
  idDividendos: number;
  idSocio: number;
  cedula: string;
  nombre: string;
  fecha: string;
  periodo: string;
  monto: number;
  capitalizado: boolean;
  periodoBloqueado: boolean;
  cantidad_acciones: number;
  monto_acciones: number;
  saldo_capital: number;
};

export const getDividendosPeriodoSaved = async (
  periodo?: string
): Promise<getDividendosPeriodoSavedType[]> => {
  //dividendo x socio

  if (!periodo) periodo = "%";

  const dividendos = await prisma.dividendos.findMany({
    where: {
      periodo: { contains: periodo },
      socio: {
        fechaSalida: "",
      },
    },
    select: {
      idDividendos: true,
      socio: {
        select: {
          idSocio: true,
          cedula: true,
          nombre: true,
        },
      },
      fecha: true,
      periodo: true,
      monto: true,
      capitalizado: true,
      periodoBloqueado: true,
    },
  });

  //total de acciones x socio
  const acciones = await prisma.accion.findMany({
    where: {
      periodo: { contains: periodo },
      socio: {
        fechaSalida: "",
      },
    },
    select: {
      idAccion: true,
      periodo: true,
      socioId: true,
      cantidadAcciones: true,
      monto_colones: true,
    },
  });

  //total de prestamos x socio
  const prestamos = await prisma.prestamo.findMany({
    where: {
      socio: {
        fechaSalida: "",
      },
    },
    select: {
      idPrestamo: true,
      socioId: true,
      saldoCapital: true,
    },
  });

  //resumen de datos

  const dividendosPeriodoOutPut: getDividendosPeriodoSavedType[] = [];

  for (const dividendo of dividendos) {
    const socio = dividendo.socio;
    const accion = acciones.filter(
      (accion) => accion.socioId === socio.idSocio && accion.periodo === dividendo.periodo
    );
    const prestamo = prestamos.filter(
      (prestamo) => prestamo.socioId === socio.idSocio
    );

    dividendosPeriodoOutPut.push({
      idDividendos: dividendo.idDividendos,
      idSocio: socio.idSocio,
      cedula: socio.cedula,
      nombre: socio.nombre,
      fecha: dividendo.fecha,
      periodo: dividendo.periodo,
      monto: dividendo.monto,
      capitalizado: dividendo.capitalizado,
      periodoBloqueado: dividendo.periodoBloqueado,
      cantidad_acciones: accion?.reduce((sumatoria, item) => {
        return sumatoria + item.cantidadAcciones;
      }, 0),
      monto_acciones: accion?.reduce((sumatoria, item) => {
        return sumatoria + item.monto_colones;
      }, 0),
      saldo_capital: prestamo?.reduce((sumatoria, item) => {
        return sumatoria + item.saldoCapital;
      }, 0),
    });
  }

  return dividendosPeriodoOutPut;
};

export const aplicarDividendosPeriodo = async (
  data: getDividendosPeriodoSavedType[]
) => {
  try {
    const idsCapitalizados = data
      .filter((d) => d.capitalizado)
      .map((d) => d.idDividendos);

    const idsNoCapitalizados = data
      .filter((d) => !d.capitalizado)
      .map((d) => d.idDividendos);

    const result = await prisma.$transaction([
      prisma.dividendos.updateMany({
        where: { idDividendos: { in: idsCapitalizados } },
        data: { capitalizado: true },
      }),
      prisma.dividendos.updateMany({
        where: { idDividendos: { in: idsNoCapitalizados } },
        data: { capitalizado: false },
      }),
    ]);

    return {
      success: true,
      capitalizados: result[0].count,
      noCapitalizados: result[1].count,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const bloquearDividendosPeriodo = async (periodo: string) => {
  try {
    const result = await prisma.dividendos.updateMany({
      where: { periodo },
      data: { periodoBloqueado: true },
    });

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

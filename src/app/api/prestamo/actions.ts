"use server";

import { estado_cuenta, Prestamo } from "@/types/types";
// actions.ts
import { EstadoSocio, prestamo_modalidad } from "@prisma/client";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { saldo_prestamos } from "@/types/types";
import { getVariableValue } from "../variables/actions";
import { prisma } from "@/lib/prisma";
import { parseDateOnly, toDateOnly } from "@/lib/date";

// Crear una instancia de PrismaClient

type formTypePrestamo = {
  idPrestamo?: number;
  socioId: number;
  fecha: string;
  fecha_inicio_pago?: string;
  monto: number;
  plazo: number;
  motivo?: string | null;
  modalidad: prestamo_modalidad;
  saldoCapital: number;
  saldoInteresOrdinario: number;
  saldoInteresMoratorio: number;
};
interface SaldoCapitalPrestamoByIdSocioTemplate {
  saldoCapital: number;
}
// Función para registrar un nuevo socio
export const savePrestamo = async (formData: formTypePrestamo) => {
  try {
    // Crear un nuevo registro de Socio usando Prisma
    const prestamoData = {
      socioId: formData.socioId,
      fecha: formData.fecha,
      fecha_inicio_pago: formData.fecha_inicio_pago,
      monto: formData.monto,
      plazo: formData.plazo,
      motivo: formData.motivo,
      modalidad: formData.modalidad,
      saldoCapital: formData.saldoCapital,
      saldoInteresOrdinario: formData.saldoInteresOrdinario,
      saldoInteresMoratorio: formData.saldoInteresMoratorio,
    };

    const data = await prisma.prestamo.upsert({
      where: { idPrestamo: formData.idPrestamo },
      create: prestamoData, // Usamos el objeto común
      update: prestamoData, // Usamos el objeto común
    });

    // Retornar el nuevo socio creado
    return data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Si es un error conocido de Prisma
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        // Violación de unique constraint (@unique)
        case "P2002": {
          // Validar que exista un nombre de campo válido
          const fieldName = error.meta?.target;

          // Mensaje amigable
          const message = fieldName
            ? `El  campo "${fieldName}" ya existe en la base de datos.`
            : "Se ha violado una restricción única en la base de datos (campo desconocido o vacío).";

          throw new Error(message);
        }

        // Violación de llave primaria (@id)
        case "P2000": // Value too long → puede afectar PK
        case "P2003": // Foreign key failed → PK de otra tabla
        case "P2016": // Record required but not found
        default:
          throw new Error(`Error en la base de datos: ${error}`);
      }
    }

    // Errores inesperados
    throw new Error("Error desconocido al crear el socio: " + error.message);
  }
};

export const getPrestamos = async (): Promise<Prestamo[]> => {
  try {
    return prisma.prestamo.findMany();
  } catch {
    return [];
  }
};

export const getPrestamoById = async (id: number): Promise<Prestamo | null> => {
  try {
    return prisma.prestamo.findUnique({
      where: {
        idPrestamo: id,
      },
    });
  } catch {
    return null;
  }
};

export const getPrestamoBySocioId = async (
  id: number
): Promise<Prestamo[] | null> => {
  try {
    return prisma.prestamo.findMany({
      where: {
        socioId: id,
      },
    });
  } catch {
    return null;
  }
};

export const updatePrestamo = async (formData: formTypePrestamo) => {
  try {
    const update = prisma.prestamo.update({
      where: {
        idPrestamo: formData.idPrestamo,
      },
      data: {
        socioId: formData.socioId,
        fecha: formData.fecha,
        monto: formData.monto,
        plazo: formData.plazo,
        motivo: formData.motivo,
        modalidad: formData.modalidad,
        saldoCapital: formData.saldoCapital,
        saldoInteresOrdinario: formData.saldoInteresOrdinario,
        saldoInteresMoratorio: formData.saldoInteresMoratorio,
      },
    });

    return update;
  } catch {
    return null;
  }
};

export const getSaldoCapitalPrestamoByIdSocio = async (
  id: number
): Promise<SaldoCapitalPrestamoByIdSocioTemplate> => {
  try {
    const data = await prisma.prestamo.findMany({
      where: {
        socioId: id,
      },
    });

    const saldoCapital = data.reduce((sumatoria, item) => {
      return sumatoria + item.saldoCapital;
    }, 0);

    return { saldoCapital };
  } catch {
    return { saldoCapital: 0 };
  }
};

export const getVistaSaldoPrestamosBySocioId = async (
  id: number
): Promise<saldo_prestamos[] | null> => {
  const prestamosConPagos = await prisma.prestamo.findMany({
    where: {
      socioId: id,
    },
    select: {
      socioId: true,
      idPrestamo: true,
      fecha: true,
      motivo: true,
      monto: true,
      plazo: true,
      pagos: {
        select: {
          monto: true,
          idPago: true,
        },
      },
    },
    orderBy: {
      idPrestamo: "asc",
    },
  });

  // Mapear los cálculos
  const resultado = prestamosConPagos.map((p) => {
    const pagosCount = p.pagos.length;
    const montoAbonado = p.pagos.reduce(
      (acc, pago) => acc + Number(pago.monto),
      0
    );
    const saldoCapital = Number(p.monto) - montoAbonado;

    return {
      socioId: p.socioId,
      idPrestamo: p.idPrestamo,
      fecha: p.fecha,
      motivo: p.motivo,
      monto: Number(p.monto),
      plazo: p.plazo,
      pagos: pagosCount,
      montoAbonado,
      saldoCapital,
    };
  });
  return resultado;
};

export const getVistaEstadoCuenta = async (): Promise<
  estado_cuenta[] | null
> => {
  const data = await prisma.socio.findMany({
    where: {
      estadoSocio: EstadoSocio.ACTIVO,
      prestamos: {
        some: {},
      },
    },
    select: {
      idSocio: true,
      cedula: true,
      nombre: true,
      prestamos: {
        select: {
          idPrestamo: true,
          motivo: true,
          monto: true, // monto del préstamo
          plazo: true,
          modalidad: true,
          saldoCapital: true,
          saldoInteresOrdinario: true,
          saldoInteresMoratorio: true,
          pagos: {
            select: {
              idPago: true,
              fechaProyectada: true,
              fechaReal: true,
              monto: true, // monto del abono
              interesOrdinario: true,
              interesMoratorio: true,
            },
            orderBy: {
              idPago: "asc",
            },
          },
        },
        orderBy: {
          idPrestamo: "asc",
        },
      },
    },
    orderBy: {
      idSocio: "asc",
    },
  });

  const sociosConAbonos = data.map((socio) => ({
    ...socio,
    prestamos: socio.prestamos.map((prestamo) => ({
      ...prestamo,
      pagos: prestamo.pagos.map((pago) => ({
        ...pago,
        abonoTotal: pago.monto + pago.interesOrdinario + pago.interesMoratorio,
      })),
    })),
  }));

  return sociosConAbonos;
};

export const getVistaEstadoCuentaP = async (): Promise<
  estado_cuenta[] | null
> => {
  const data = await prisma.socio.findMany({
    where: {
      estadoSocio: EstadoSocio.ACTIVO,
      prestamos: {
        some: {},
      },
    },
    select: {
      idSocio: true,
      cedula: true,
      nombre: true,
      prestamos: {
        select: {
          idPrestamo: true,
          motivo: true,
          monto: true, // monto del préstamo
          plazo: true,
          modalidad: true,
          saldoCapital: true,
          saldoInteresOrdinario: true,
          saldoInteresMoratorio: true,
          fecha_inicio_pago: true,
          pagos: {
            select: {
              idPago: true,
              fechaProyectada: true,
              fechaReal: true,
              monto: true, // monto del abono
              interesOrdinario: true,
              interesMoratorio: true,
            },
            orderBy: {
              idPago: "asc",
            },
          },
        },
        where: {
          saldoCapital: {
            gt: 0,
          },
        },
        orderBy: {
          idPrestamo: "asc",
        },
      },
    },
    orderBy: {
      idSocio: "asc",
    },
  });

  const { valor: tasaInteres } = await getVariableValue(2);

  const sociosConAbonosProyectados = data.map((socio) => ({
    ...socio,
    prestamos: socio.prestamos.map((prestamo) => {
      const pagosGenerados = [];

      const fechaProyectada = prestamo.fecha_inicio_pago
        ? parseDateOnly(prestamo.fecha_inicio_pago)
        : new Date();

      const pagosRealizados = prestamo.pagos.length;
      const plazoRestante = prestamo.plazo - pagosRealizados;

      let saldoRestante = prestamo.saldoCapital;

      fechaProyectada.setMonth(
        fechaProyectada.getMonth() +
          (pagosRealizados > 0 ? pagosRealizados - 1 : 0)
      ); // actualizo la fecha a la ultima fecha pagada

      // Generar pagos proyectados (los que falten) hasta que el saldo se pague
      for (let i = 0; i < plazoRestante; i++) {
        // Cálculo del interés según modalidad
        let interesOrdinario = 0;
        let montoCapital = 0;

        if (prestamo.modalidad === "ALEMAN") {
          // Modalidad Alemana: pago fijo de capital, calculando solo interés sobre saldo restante
          interesOrdinario = saldoRestante * tasaInteres;
          montoCapital = saldoRestante / (plazoRestante - i); // El capital es dividido de manera fija
        }

        // Cálculo de la fecha de pago proyectada
        fechaProyectada.setMonth(fechaProyectada.getMonth() + 1); // Sumar un mes al pago

        // Registrar el pago proyectado
        pagosGenerados.push({
          idPago: 900 + i,
          fechaProyectada: toDateOnly(fechaProyectada),
          fechaReal: null,
          monto: montoCapital,
          interesOrdinario: interesOrdinario,
          interesMoratorio: 0, // No aplicamos interés moratorio en el pago proyectado
        });

        // Reducir el saldo restante
        saldoRestante -= montoCapital;

        // Salir del bucle si el saldo se pagó
        if (saldoRestante <= 0) {
          break; // Terminar cuando el saldo es 0
        }
      }

      return {
        ...prestamo,
        pagos: [...prestamo.pagos, ...pagosGenerados], // Combinar pagos existentes con los generados
      };
    }),
  }));

  const sociosConAbonos = sociosConAbonosProyectados.map((socio) => ({
    ...socio,
    prestamos: socio.prestamos.map((prestamo) => ({
      ...prestamo,
      pagos: prestamo.pagos.map((pago) => ({
        ...pago,
        abonoTotal: pago.monto + pago.interesOrdinario + pago.interesMoratorio,
      })),
    })),
  }));

  return sociosConAbonos;
};

"use server";

import { prisma } from "@/lib/prisma";
import { Accion, sociosConAcciones_type } from "@/types/types";
// actions.ts
import { EstadoSocio } from "@prisma/client";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const MONTO_ACCION_VARIABLE_ID = 4;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface SocioActivoAcciones {
  idSocio: number;
  cedula: string;
  nombre: string;
}

export interface ActualizarAccionInput {
  idAccion: number;
  periodo: string;
  mes: string;
  fecha: string;
  cantidadAcciones: number;
}

export interface AccionMutationResult {
  success: boolean;
  message: string;
}

// Crear una instancia de PrismaClient

type formTypeAccion = {
  idAccion?: number;
  socioId: number;
  fecha: string;
  cantidadAcciones: number;
  periodo?: string | null;
  mes?: string | null;
  pesoMultiplicador?: number | null;
  monto_colones: number;
};

// Función para registrar un nuevo socio
export const saveAccion = async (formData: formTypeAccion) => {
  try {
    await prisma.accion.deleteMany({
      where: {
        socioId: formData.socioId,
        periodo: formData.periodo,
        mes: formData.mes,
      },
    });

    // Crear un nuevo registro de Socio usando Prisma
    const nuevaAccion = await prisma.accion.create({
      data: {
        socioId: formData.socioId,
        fecha: formData.fecha,
        cantidadAcciones: formData.cantidadAcciones,
        periodo: formData.periodo,
        mes: formData.mes,
        pesoMultiplicador: formData.pesoMultiplicador,
        monto_colones: formData.monto_colones,
      },
    });

    // Retornar el nuevo socio creado
    return nuevaAccion;

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

export const getAccionesBySocioId = async (
  socioId: number
): Promise<Accion[]> => {
  try {
    return prisma.accion.findMany({
      where: {
        socioId: socioId,
      },
    });
  } catch {
    return [];
  }
};

export const getSociosActivosAcciones = async (): Promise<SocioActivoAcciones[]> => {
  return prisma.socio.findMany({
    where: { estadoSocio: EstadoSocio.ACTIVO },
    select: {
      idSocio: true,
      cedula: true,
      nombre: true,
    },
    orderBy: { nombre: "asc" },
  });
};

export const getAccionesMantenimiento = async (socioId: number): Promise<Accion[]> => {
  if (!Number.isInteger(socioId) || socioId <= 0) return [];

  return prisma.accion.findMany({
    where: {
      socioId,
      socio: { estadoSocio: EstadoSocio.ACTIVO },
    },
    orderBy: [
      { fecha: "desc" },
      { idAccion: "desc" },
    ],
  });
};

export const actualizarAccion = async (
  input: ActualizarAccionInput
): Promise<AccionMutationResult> => {
  const { idAccion, periodo, mes, fecha, cantidadAcciones } = input;

  if (!Number.isInteger(idAccion) || idAccion <= 0) {
    return { success: false, message: "La acción seleccionada no es válida." };
  }

  if (!DATE_ONLY_PATTERN.test(fecha)) {
    return { success: false, message: "La fecha debe tener formato YYYY-MM-DD." };
  }

  const [anioFecha, mesFecha, diaFecha] = fecha.split("-").map(Number);
  const fechaValida = new Date(anioFecha, mesFecha - 1, diaFecha);
  if (
    fechaValida.getFullYear() !== anioFecha ||
    fechaValida.getMonth() + 1 !== mesFecha ||
    fechaValida.getDate() !== diaFecha
  ) {
    return { success: false, message: "La fecha indicada no es válida." };
  }

  if (periodo !== String(anioFecha)) {
    return { success: false, message: "El periodo debe coincidir con el año de la fecha." };
  }

  if (mes !== String(mesFecha)) {
    return { success: false, message: "El mes debe coincidir con el mes de la fecha." };
  }

  if (!Number.isInteger(cantidadAcciones) || cantidadAcciones <= 0) {
    return { success: false, message: "La cantidad de acciones debe ser un entero mayor que cero." };
  }

  try {
    const [accion, variableMonto, fechaCalendario] = await Promise.all([
      prisma.accion.findFirst({
        where: {
          idAccion,
          socio: { estadoSocio: EstadoSocio.ACTIVO },
        },
        select: { idAccion: true },
      }),
      prisma.variables.findUnique({
        where: { idVariable: MONTO_ACCION_VARIABLE_ID },
        select: { valor: true },
      }),
      prisma.calendario.findUnique({
        where: { fecha },
        select: { fecha: true },
      }),
    ]);

    if (!accion) {
      return { success: false, message: "La acción ya no existe o el socio no está activo." };
    }

    if (!variableMonto || !Number.isFinite(variableMonto.valor) || variableMonto.valor <= 0) {
      return { success: false, message: "El valor vigente de una acción no está configurado correctamente." };
    }

    if (!fechaCalendario) {
      return { success: false, message: "La fecha indicada no existe en el calendario de pagos." };
    }

    await prisma.accion.update({
      where: { idAccion },
      data: {
        periodo,
        mes,
        fecha,
        cantidadAcciones,
        monto_colones: cantidadAcciones * variableMonto.valor,
      },
    });

    return { success: true, message: "Acción actualizada correctamente." };
  } catch (error) {
    console.error("Error al actualizar la acción:", error);
    return { success: false, message: "No se pudo actualizar la acción." };
  }
};

export const eliminarAccion = async (idAccion: number): Promise<AccionMutationResult> => {
  if (!Number.isInteger(idAccion) || idAccion <= 0) {
    return { success: false, message: "La acción seleccionada no es válida." };
  }

  try {
    const accion = await prisma.accion.findFirst({
      where: {
        idAccion,
        socio: { estadoSocio: EstadoSocio.ACTIVO },
      },
      select: { idAccion: true },
    });

    if (!accion) {
      return { success: false, message: "La acción ya no existe o el socio no está activo." };
    }

    await prisma.accion.delete({ where: { idAccion } });
    return { success: true, message: "Acción eliminada correctamente." };
  } catch (error) {
    console.error("Error al eliminar la acción:", error);
    return { success: false, message: "No se pudo eliminar la acción." };
  }
};

interface ResumenAccionesByIdSocioTemplate {
  montoAhorrado: number;
  cantidadAcciones: number;
  montoDisponible: number;
}

export const getResumenAccionesByIdSocio = async (
  id: number
): Promise<ResumenAccionesByIdSocioTemplate> => {
  try {
    const data = await prisma.accion.findMany({
      where: {
        socioId: id,
      },
    });

    const montoAhorrado = data.reduce((sumatoria, item) => {
      return sumatoria + item.monto_colones;
    }, 0);

    const cantidadAcciones = data.reduce((sumatoria, item) => {
      return sumatoria + item.cantidadAcciones;
    }, 0);

    const montoDisponible = data.reduce((sumatoria, item) => {
      return sumatoria + item.monto_colones * (item.pesoMultiplicador ?? 1);
    }, 0);

    return { montoAhorrado, cantidadAcciones, montoDisponible };
  } catch {
    return { montoAhorrado: 0, cantidadAcciones: 0, montoDisponible: 0 };
  }
};

export const getVistaEstadoAcciones = async (): Promise<
  sociosConAcciones_type[] | null
> => {
  const sociosConAcciones = await prisma.socio.findMany({
    where: {
      estadoSocio: EstadoSocio.ACTIVO,
      acciones: {
        some: {},
      },
    },
    select: {
      idSocio: true,
      cedula: true,
      nombre: true,
      correo: true,
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
        orderBy: {
          idAccion: "asc",
        },
      },
    },
    orderBy: {
      idSocio: "asc",
    },
  });

  return sociosConAcciones;
};

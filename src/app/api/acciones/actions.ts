"use server";

import { prisma } from "@/lib/prisma";
import { Accion, sociosConAcciones_type } from "@/types/types";
// actions.ts

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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

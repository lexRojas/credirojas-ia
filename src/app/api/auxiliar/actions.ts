"use server";

import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Crear una instancia de PrismaClient
interface AuxiliarContableType {
  idAuxiliar?: number;
  fecha: string; // String (YYYY-MM-DD)
  tipoMovimiento: number; // 1 | -1
  monto: number; // number para validación; "" permite limpiar el input
  nota: string;
}

// Función para registrar un nuevo socio
export const saveAuxiliar = async (formData: AuxiliarContableType) => {
  try {
    // Crear un nuevo registro de Socio usando Prisma
    const data = await prisma.auxiliarContable.create({
      data: {
        fecha: formData.fecha,
        tipoMovimiento: formData.tipoMovimiento,
        monto: formData.monto,
        nota: formData.nota,
      },
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

export const updateAuxiliar = async (formData: AuxiliarContableType) => {
  try {
    // Crear un nuevo registro de Socio usando Prisma
    const data = await prisma.auxiliarContable.update({
      data: {
        fecha: formData.fecha,
        tipoMovimiento: formData.tipoMovimiento,
        monto: formData.monto,
        nota: formData.nota,
      },
      where: {
        idAuxiliar: formData.idAuxiliar,
      },
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

export const getAuxiliares = async (
  Id?: number
): Promise<AuxiliarContableType[]> => {
  try {
    if (!Id) {
      return prisma.auxiliarContable.findMany();
    }
    return prisma.auxiliarContable.findMany({
      where: {
        idAuxiliar: Id,
      },
    });
  } catch {
    return [];
  }
};

export const deleteAuxiliar = async (id: number) => {
  try {
    await prisma.auxiliarContable.delete({
      where: {
        idAuxiliar: id,
      },
    });
  } catch {
    return;
  }
};

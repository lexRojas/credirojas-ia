"use server";

import { prisma } from "@/lib/prisma";
import { Pagos } from "@/types/types";
// actions.ts
import { TipoCuota } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Crear una instancia de PrismaClient

type formTypeAbono = {
  idPago: number;
  prestamoId: number;
  socioId: number;
  fechaProyectada: string;
  fechaReal: string;
  diasAtraso: number;
  monto: number;
  montoCuotaCapital: number;
  interesOrdinario: number;
  interesMoratorio: number;
  tipoCuota: TipoCuota;
};

// Función para registrar un nuevo socio
export const savePago = async (formData: formTypeAbono) => {
  try {
    // Crear un nuevo registro de Socio usando Prisma
    const pagoData = {
      idPago: formData.idPago === 0 ? undefined : formData.idPago,
      prestamoId: formData.prestamoId,
      socioId: formData.socioId,
      fechaProyectada: formData.fechaProyectada,
      fechaReal: formData.fechaReal,
      diasAtraso: formData.diasAtraso,
      monto: formData.montoCuotaCapital,
      interesOrdinario: formData.interesOrdinario,
      interesMoratorio: formData.interesMoratorio,
      tipoCuota: formData.tipoCuota,
    };

    const data = await prisma.pago.upsert({
      where: { idPago: formData.idPago },
      create: pagoData, // Usamos el objeto común
      update: pagoData, // Usamos el objeto común
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

export const getPagos = async (): Promise<Pagos[]> => {
  try {
    return prisma.pago.findMany();
  } catch {
    return [];
  }
};

export const getPagosByPrestamoId = async (
  id: number
): Promise<Pagos[] | null> => {
  try {
    return prisma.pago.findMany({
      where: {
        prestamoId: id,
      },
    });
  } catch {
    return null;
  }
};

export const deletePago = async (id: number): Promise<boolean> => {
  try {
    await prisma.pago.delete({
      where: {
        idPago: id,
      },
    });

    return true;
  } catch {
    return false;
  }
};

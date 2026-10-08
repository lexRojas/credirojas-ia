"use server";

import { prisma } from "@/lib/prisma";
// actions.ts
import { Variables } from "@/types/types";


// Función para registrar un nuevo socio

export const getVariableValue = async (id: number): Promise<Variables> => {
  try {
    // Crear un nuevo registro de Socio usando Prisma
    const variableValue = await prisma.variables.findFirst({
      where: {
        idVariable: id,
      },
    });

    // Verificar si se encontró la variable
    if (!variableValue) {
      throw new Error(`Variable con id ${id} no encontrada.`);
    }

    // Retornar el valor de la variable
    return variableValue;
  } catch (error) {
    console.error("Error al registrar el socio:", error);
    throw new Error("Error al registrar el socio");
  }
};

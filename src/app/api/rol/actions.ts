"use server";

import { prisma } from "@/lib/prisma";
// actions.ts


import { Rol } from "@/types/types";


// Función para registrar un nuevo socio

export const getRoles = async (): Promise<Rol[]> => {
  try {
    // Crear un nuevo registro de Socio usando Prisma
    const data = await prisma.rol.findMany();

    // Verificar si se encontró la variable
    if (!data) {
      throw new Error(`Roles no encontrados.`);
    }

    // Retornar el valor de la variable
    return data;
  } catch (error) {
    console.error("Error al registrar el socio:", error);
    throw new Error("Error al registrar el socio");
  }
};

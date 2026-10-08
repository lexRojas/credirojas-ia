"use server";

import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

// Función para registrar un nuevo socio
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { formData } = body.data;

  try {
    console.log("salvando voto!");
    // Crear un nuevo registro de Socio usando Prisma
    const result = await prisma.$transaction(async (prisma) => {
      const newRst = await prisma.votacion.create({
        data: {
          socioId: formData.socioId,
          solicitudId: formData.solicitudId,
          fecha: formData.fecha,
          aprueba: formData.aprueba,
        },
      });

      if (!newRst)
        return NextResponse.json({ message: "Voto no salvado", status: 400 });
      // Retornar el nuevo socio creado
    });

    if (!result)
      return NextResponse.json({ message: "Voto no salvado", status: 400 });

    console.log("voto salvado!");
    return NextResponse.json({ message: "Voto salvado", status: 200 });

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
}

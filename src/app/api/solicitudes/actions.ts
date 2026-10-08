"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import SolicitudPrestamoVotacion from "@/components/staticPages/SolicitudPrestamoVotacion";
import { generateTokenUrlSafe, hashToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Crear una instancia de PrismaClient

export type formTypeSolicitud = {
  socioId: number;
  fechaSolicitud: string;
  detalle: string;
  aprobada: boolean;
  fechaAprobacion: string;
  cerrada: boolean;
  monto: number;
  plazo: number;
  motivo: string;
};

// Función para registrar un nuevo socio
export const saveSolicitud = async (formData: formTypeSolicitud) => {
  try {
    console.log("entrando a salvar la solicitud");
    // Crear un nuevo registro de Socio usando Prisma
    const newRst = await prisma.solicitud.create({
      data: {
        socioId: formData.socioId,
        fechaSolicitud: formData.fechaSolicitud,
        detalle: formData.detalle,
        aprobada: formData.aprobada,
        fechaAprobacion: formData.fechaAprobacion,
        cerrada: formData.cerrada,
        monto_solicitado: formData.monto,
        plazo: formData.plazo,
      },
    });

    const socios = await prisma.socio.findMany({
      where: {
        fechaSalida: "",
      },
    });

    const socioSolicitante = socios.find(
      (item) => item.idSocio === formData.socioId
    );

    for (const socio of socios) {
      try {
        const token = await generateTokenUrlSafe();
        const hash = await hashToken(token);

        await prisma.votacionToken.create({
          data: {
            idSolicitud: newRst.idSolicitud,
            tokenHash: hash,
            socioId: socio.idSocio,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), //24 horas
          },
        });

        const data = {
          idSocio: socioSolicitante!.idSocio,
          cedula: socioSolicitante!.cedula,
          nombre: socioSolicitante!.nombre,
          motivo: formData.motivo,
          monto: formData.monto,
          plazo: formData.plazo,
          token: token,
        };

        await sendMailSolicitud(data, socio.correo);
      } catch (error) {
        console.log(error);
      }
    }

    // Retornar el nuevo socio creado
    return newRst;

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

export interface solicitudPrestamoProps {
  idSocio: number;
  cedula: string;
  nombre: string;
  motivo: string;
  monto: number;
  plazo: number;
  token: string;
}

export const sendMailSolicitud = async (
  data: solicitudPrestamoProps,
  correo: string
) => {
  try {
    if (!data) return;

    // Renderiza HTML de tu componente React Email
    const htmlContent = render(SolicitudPrestamoVotacion(data));

    // Configura Nodemailer con Gmail (usar contraseña de aplicación)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Opcional: si quieres enviar adjuntos, agrega un array en attachments
    const mailOptions = {
      from: `"CrediRojas" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: "CrediRojas -> SOLICITUD DE PRESTAMO",
      html: await htmlContent, // Await the promise here

      attachments: [
        // {
        //   filename: "archivo.pdf",
        //   path: "/ruta/a/archivo.pdf",
        // },
      ],
    };

    // Envia el correo
    const info = await transporter.sendMail(mailOptions);

    console.log("Correo enviado:", info.messageId);
  } catch (error) {
    console.error("Error enviando correo:", error);
    return error;
  }
};

// Función para obtener solicitudes
export const listaSolicitudesPendientes = async () => {
  try {
    // Crear un nuevo registro de Socio usando Prisma
    const newRst = await prisma.solicitud.findMany({
      where: {
        cerrada: false,
      },
      include: {
        votos: true,
        socio: {
          select: {
            nombre: true,
            idSocio: true,
          },
        },
      },
    });

    // Retornar el nuevo socio creado
    return newRst;

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

// Función para registrar un nuevo socio
export const cerrarSolicitud = async (idSolicitud: number) => {
  try {
    if (!idSolicitud) return;

    // Crear un nuevo registro de Socio usando Prisma
    await prisma.$transaction(async (tx) => {
      try {
        await tx.solicitud.update({
          data: {
            cerrada: true,
          },
          where: {
            idSolicitud: idSolicitud,
          },
        });

        await tx.votacionToken.updateMany({
          data: {
            expiresAt: new Date(), //24 horas
          },
          where: {
            // Assuming idSolicitud is a unique identifier for VotacionToken
            // You might need to adjust this based on your actual schema for VotacionToken
            idSolicitud: idSolicitud,
          },
        });
      } catch {
        throw new Error(
          "Error durante la transacción. Se ha realizado un rollback."
        );
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(`Error en la base de datos: ${error}`);
  }
};

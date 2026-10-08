"use server";

import { getVariableValue } from "@/app/api/variables/actions";
import { prisma } from "@/lib/prisma";
import { Socio } from "@/types/types";
// actions.ts
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Crear una instancia de PrismaClient

type formTypeSocio = {
  idSocio?: number;
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  fechaSalida: string;
  username: string;
  password: string;
  rolId: number;
  montoAccion: number;
  multiplicador: number;
  estado_civil?: string;
  profesion?: string;
  direccion?: string;
};

// Función para registrar un nuevo socio
export const saveSocio = async (formData: formTypeSocio) => {
  try {
    const montoAccion = await getVariableValue(4);
    const multiplicador = await getVariableValue(1);

    // Crear un nuevo registro de Socio usando Prisma
    const nuevoSocio = await prisma.socio.create({
      data: {
        nombre: formData.nombre,
        cedula: formData.cedula,
        correo: formData.correo,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        fechaIngreso: formData.fechaIngreso,
        fechaSalida: formData.fechaSalida,
        montoAccion: montoAccion.valor,
        multiplicador: multiplicador.valor,
        username: formData.username,
        password: formData.password,
        rolId: formData.rolId,
        direccion: formData.direccion,
        estado_civil: formData.estado_civil,
        profesion: formData.profesion,
      },
    });

    // Retornar el nuevo socio creado
    return nuevoSocio;

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

export interface maestroSociosTemplate {
  idSocio: number;
  cedula: string;
  nombre: string;
  correo: string;
  fechaIngreso: string;
  fechaSalida: string;
  total_acciones: number;
  monto_acciones: number;
  monto_disponible: number;
  monto_prestamos: number;
  saldo_capital: number;
  saldo_disponible: number;
}

export const getMaestroSocios = async (): Promise<maestroSociosTemplate[]> => {
  try {
    const data = await prisma.socio.findMany({
      select: {
        idSocio: true,
        cedula: true,
        nombre: true,
        correo: true,
        fechaIngreso: true,
        fechaSalida: true,
        acciones: {
          select: {
            idAccion: true,
            monto_colones: true,
            cantidadAcciones: true,
            pesoMultiplicador: true,
          },
        },
        prestamos: {
          select: {
            idPrestamo: true,
            monto: true,
            saldoCapital: true,
          },
          where: {
            saldoCapital: {
              gt: 0,
            },
          },
        },
      },
    });

    const result = data.map<maestroSociosTemplate>((item) => ({
      idSocio: item.idSocio,
      cedula: item.cedula,
      nombre: item.nombre,
      correo: item.correo,
      fechaIngreso: item.fechaIngreso!,
      fechaSalida: item.fechaSalida!,
      total_acciones: item.acciones.reduce(
        (total, accion) => total + accion.cantidadAcciones,
        0
      ),
      monto_acciones: item.acciones.reduce(
        (total, accion) => total + accion.monto_colones,
        0
      ),
      monto_disponible: item.acciones.reduce(
        (total, accion) =>
          total + accion.monto_colones * (accion.pesoMultiplicador ?? 1),
        0
      ),
      monto_prestamos: item.prestamos.reduce(
        (total, prestamo) => total + prestamo.monto,
        0
      ),
      saldo_capital: item.prestamos.reduce(
        (total, prestamo) => total + prestamo.saldoCapital,
        0
      ),
      saldo_disponible: 0,
    }));

    const result_saldo_disponible = result.map((item) => ({
      ...item,
      saldo_disponible: item.monto_disponible - item.saldo_capital,
    }));

    const sort = result_saldo_disponible.sort((a, b) => {
      if (a.saldo_disponible > b.saldo_disponible) {
        return -1;
      }
      if (a.saldo_disponible < b.saldo_disponible) {
        return 1;
      }
      return 0;
    });

    return sort;
  } catch {
    return [];
  }
};

export const getSocios = async (): Promise<Socio[]> => {
  try {
    return prisma.socio.findMany();
  } catch {
    return [];
  }
};

export const getSocioById = async (id: number): Promise<Socio | null> => {
  try {
    return prisma.socio.findUnique({
      where: {
        idSocio: id,
      },
    });
  } catch {
    return null;
  }
};

export const updateSocio = async (formData: formTypeSocio) => {
  try {
    const update = prisma.socio.update({
      where: {
        idSocio: formData.idSocio,
      },
      data: {
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        fechaIngreso: formData.fechaIngreso,
        fechaSalida: formData.fechaSalida,
        montoAccion: formData.montoAccion,
        multiplicador: formData.multiplicador,
        username: formData.username,
        password: formData.password,
        rolId: formData.rolId,
        estado_civil: formData.estado_civil,
        profesion: formData.profesion,
        direccion: formData.direccion,
      },
    });

    return update;
  } catch {
    return null;
  }
};

import { invitacionProps } from "@/components/staticPages/InvitacionSocio";
import InvitacionCard from "@/components/staticPages/InvitacionSocio";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import path from "path";

export const sendMailInvitacionSocio = async (data: invitacionProps) => {
  try {
    if (!data) return;

    // Renderiza HTML de tu componente React Email
    const htmlContent = render(InvitacionCard(data));
    const imagePath = path.join(process.cwd(), "public/images/logo.png"); // Ruta absoluta

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
      to: data.data?.correo,
      subject: "CrediRojas -> INVITACION !",
      html: await htmlContent, // Await the promise here

      attachments: [
        {
          filename: "logo.png",
          path: imagePath,
          cid: "logo",
        },
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

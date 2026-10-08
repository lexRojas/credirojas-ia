// app/api/enviar-estado/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";

import EstadoAcciones from "@/components/staticPages/EstadoAcciones";
import { sociosConAcciones_type } from "@/types/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body.data as sociosConAcciones_type;

    if (!data) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Renderiza HTML de tu componente React Email
    const htmlContent = render(EstadoAcciones(data));

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
      to: data.correo,
      subject: "CrediRojas -> Estado de Cuenta Acciones",
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

    return NextResponse.json({
      message: "Correo enviado",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return NextResponse.json(
      { error: "Error al enviar el correo" },
      { status: 500 }
    );
  }
}

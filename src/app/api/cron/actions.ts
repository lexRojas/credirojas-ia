"use server";

import RecordatorioCard, {
  recordatorioPagoProps,
} from "@/components/staticPages/RecordatorioCard";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import path from "path";

export const sendMailRecordatorioPago = async (
  data: recordatorioPagoProps,
  correo: string
) => {
  try {
    if (!data) return;

    // Renderiza HTML de tu componente React Email
    const htmlContent = render(RecordatorioCard(data));
    const imagePath = path.join(process.cwd(), "public/images/banner.png"); // Ruta absoluta

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
      subject: "CrediRojas -> RECORDATORIO PAGO PRESTAMO",
      html: await htmlContent, // Await the promise here

      attachments: [
        {
          filename: "banner.png",
          path: imagePath,
          cid: "banner",
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

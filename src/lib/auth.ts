"use server";

// lib/auth.ts
import argon2 from "argon2";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function hashPassword(password: string) {
  // Argon2id (argon2 default is fine). Ajusta memoria/iteraciones según tu infra.
  return await argon2.hash(password);
}
export async function verifyPassword(hash: string, password: string) {
  return await argon2.verify(hash, password);
}

export async function generateTokenUrlSafe(len = 32) {
  // 32 bytes -> 64 hex chars
  return crypto.randomBytes(len).toString("hex");
}

export async function hashToken(token: string) {
  // almacenamos sólo hash del token (SHA-256)
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function sendResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;


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
    to: to,
    subject: "Recuperación de contraseña",
    html: `<p>Haz click <a href="${resetUrl}">aquí</a> para restablecer tu contraseña. El enlace expira en 1 hora.</p>`,
    text: `Copia este enlace en el navegador: ${resetUrl}`,
  };

  // Envia el correo
  const info = await transporter.sendMail(mailOptions);

  console.log("Correo enviado:", info.messageId);

  return info;
}

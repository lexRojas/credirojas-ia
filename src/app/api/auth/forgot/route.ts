import { NextResponse } from "next/server";
import { generateTokenUrlSafe, hashToken, sendResetEmail } from "@/lib/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { username } = await req.json();


  if (!username) return NextResponse.json({ ok: false }, { status: 400 });

  // Busca usuario (si no existe devolvemos OK genérico para evitar enumeración)
  const user = await prisma.socio.findUnique({ where: { username: username } });

  // Siempre responde OK (no reveles si existe)
  if (!user) {
    // opcional: log para monitoreo

    return NextResponse.json(
      { ok: true, message: "Si existe una cuenta, recibirás un email." },
      { status: 200 }
    );
  }

  const token = await generateTokenUrlSafe(32);
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  // Borra tokens previos y crea uno nuevo (o usa upsert)
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.idSocio },
  });
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      user: { connect: { idSocio: user.idSocio } },
      expiresAt,
    },
  });

  // Enviar email (no blockear si falla, mejor loguear)
  try {
    await sendResetEmail(user.correo, token);
  } catch (err) {
    console.error("Error sending reset email:", err);
    // no devuelvas error al cliente por seguridad; pero podrías alertar al admin/monitor
  }

  return NextResponse.json(
    { ok: true, message: "Si existe una cuenta, recibirás un email." },
    { status: 200 }
  );
}

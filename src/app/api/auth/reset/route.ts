import { NextRequest, NextResponse } from "next/server";
import { hashToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Faltan datos requeridos." },
        { status: 400 }
      );
    }

    const tokenHash = await hashToken(token);

    // Buscar token válido y usuario asociado
    const prt = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
        user: { correo: email }, // 🔁 ajustado al modelo 'socio'
      },
      include: { user: true },
    });

    if (!prt || !prt.user) {
      return NextResponse.json(
        { ok: false, message: "Token inválido o expirado." },
        { status: 400 }
      );
    }

    // Actualizar la contraseña
    const newHash = await hashPassword(password);
    await prisma.socio.update({
      where: { idSocio: prt.userId },
      data: { password: newHash },
    });

    // Borrar token usado
    await prisma.passwordResetToken.deleteMany({
      where: { userId: prt.userId },
    });

    return NextResponse.json(
      { ok: true, message: "Contraseña actualizada correctamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en reset password:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

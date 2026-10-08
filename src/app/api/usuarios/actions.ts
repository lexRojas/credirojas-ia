"use server";

// actions.ts
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


// Validar password

type formTypeUsuario = {
  username: string;
  password: string;
};

interface responseUsuario {
  message: string;
  success: boolean;
  rol?: number;
  idSocio?: number;
}
// Función para registrar un nuevo socio
export const validarPassword = async (
  formData: formTypeUsuario
): Promise<responseUsuario> => {
  const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

  try {
    const { username, password } = formData;

    const user = await prisma.socio.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return { message: "Usuario no encontrado", success: false };
    }

    /** esta funcion verifyPassword(hash, password); */
    const validarPassword = await verifyPassword(user.password, password);

    if (!validarPassword) {
      return { message: "Contraseña incorrecta", success: false };
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);

      const token = await new SignJWT({ usuario: username }) // Define el payload
        .setProtectedHeader({ alg: "HS256" }) // Especificamos el algoritmo
        .setIssuedAt() // Marca el tiempo de emisión
        .setExpirationTime("3h") // El token expira en 1 hora
        .sign(secret); // Firmamos el JWT con la clave secreta

      const cookieStore = await cookies();

      cookieStore.set({
        name: "access_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 1,
      });
      //expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      // Retornar el nuevo socio creado


      return {
        message: "Acceso validado!!",
        success: true,
        rol: user.rolId!,
        idSocio: user.idSocio!,
      };
    } catch {
      return {
        message: "Error desconocido, acceso no permitido",
        success: false,
        rol: -1,
      };
    }
  } catch {
    return {
      message: "Error desconocido, acceso no permitido",
      success: false,
      rol: -1,
    };

    // Errores inesperados
  }
};

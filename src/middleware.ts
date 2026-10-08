import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware que valida si 'access_token' está presente y es válido
export async function middleware(request: NextRequest) {
  // Buscamos el token en las cookies
  const cookieStore = await cookies();
  const hasCookie = cookieStore.has("access_token");

  // Si no existe el token, redirigimos a la página de login
  if (!hasCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const token = cookieStore.get("access_token");
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    // Verificamos el token JWT
    await jwtVerify(token!.value, new TextEncoder().encode(JWT_SECRET!));

    // Si el token es válido, seguimos con la solicitud
    return NextResponse.next();
  } catch (e) {
    // Si el token expiró o es inválido, redirigimos a la página de login
    console.error({ mensaje: "JWT expiró o es inválido", error: e });
    return NextResponse.redirect(new URL("/", request.url));
  }
}

// Definimos las rutas donde este middleware debe aplicarse
export const config = {
  runtime: "nodejs", // desactiva el Edge Runtime
  matcher: ["/home/:path*", "/socios/:path*", "/prestamos/:path*"], // Aplica a cualquier ruta bajo /home
};

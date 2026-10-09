"use server";

import { prisma } from "@/lib/prisma";
import { EstadoSocio, TipoBeneficiario } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SocioBeneficiarioInput = {
  idBeneficiario?: number;
  socioId: number;
  cedula: string;
  nombreCompleto: string;
  parentesco: string;
  tipoBeneficiario: TipoBeneficiario;
  porcentajeBeneficio: number;
};

export type SocioBeneficiarioOutput = {
  idBeneficiario: number;
  socioId: number;
  cedula: string;
  nombreCompleto: string;
  parentesco: string;
  tipoBeneficiario: TipoBeneficiario;
  porcentajeBeneficio: number;
};

export type GuardarBeneficiariosResponse = {
  success: boolean;
  message: string;
  data?: SocioBeneficiarioOutput[];
};

const roundPercent = (value: number) => Math.round(value * 100) / 100;

const getCurrentUserForServerAction = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!token || !JWT_SECRET) return null;

  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(JWT_SECRET)
  );
  const username = payload.usuario;

  if (typeof username !== "string") return null;

  return prisma.socio.findUnique({ where: { username } });
};

export const puedeAdministrarBeneficiarios = async (): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUserForServerAction();
    return currentUser?.rolId === 2;
  } catch {
    return false;
  }
};

export const getBeneficiariosBySocioId = async (
  socioId: number
): Promise<SocioBeneficiarioOutput[]> => {
  try {
    const beneficiarios = await prisma.socioBeneficiario.findMany({
      where: { socioId },
      orderBy: [{ tipoBeneficiario: "asc" }, { nombreCompleto: "asc" }],
    });

    return beneficiarios.map((beneficiario) => ({
      idBeneficiario: beneficiario.idBeneficiario,
      socioId: beneficiario.socioId,
      cedula: beneficiario.cedula,
      nombreCompleto: beneficiario.nombreCompleto,
      parentesco: beneficiario.parentesco,
      tipoBeneficiario: beneficiario.tipoBeneficiario,
      porcentajeBeneficio: beneficiario.porcentajeBeneficio,
    }));
  } catch {
    return [];
  }
};

export const guardarBeneficiariosSocio = async (
  socioId: number,
  beneficiarios: SocioBeneficiarioInput[]
): Promise<GuardarBeneficiariosResponse> => {
  try {
    const currentUser = await getCurrentUserForServerAction();

    if (!currentUser || currentUser.rolId !== 2) {
      return {
        success: false,
        message: "Solo usuarios de Junta Directiva pueden asignar beneficiarios.",
      };
    }

    const socio = await prisma.socio.findFirst({
      where: { idSocio: socioId, estadoSocio: EstadoSocio.ACTIVO },
      select: { idSocio: true },
    });

    if (!socio) {
      return {
        success: false,
        message: "El socio no existe o no está activo.",
      };
    }

    if (beneficiarios.length === 0) {
      return {
        success: false,
        message: "Debe registrar uno o más beneficiarios.",
      };
    }

    const normalized = beneficiarios.map((beneficiario) => ({
      ...beneficiario,
      socioId,
      cedula: beneficiario.cedula.trim(),
      nombreCompleto: beneficiario.nombreCompleto.trim(),
      parentesco: beneficiario.parentesco.trim(),
      porcentajeBeneficio: Number(beneficiario.porcentajeBeneficio),
    }));

    const missing = normalized.some(
      (beneficiario) =>
        !beneficiario.cedula ||
        !beneficiario.nombreCompleto ||
        !beneficiario.parentesco ||
        !beneficiario.tipoBeneficiario ||
        Number.isNaN(beneficiario.porcentajeBeneficio)
    );

    if (missing) {
      return {
        success: false,
        message: "Todos los beneficiarios deben tener cédula, nombre, parentesco, tipo y porcentaje.",
      };
    }

    const invalidPercent = normalized.some(
      (beneficiario) =>
        beneficiario.porcentajeBeneficio <= 0 ||
        beneficiario.porcentajeBeneficio > 100
    );

    if (invalidPercent) {
      return {
        success: false,
        message: "Cada porcentaje debe ser mayor que 0 y menor o igual que 100.",
      };
    }

    for (const tipo of [TipoBeneficiario.ORDINARIO, TipoBeneficiario.CONTINGENTE]) {
      const beneficiariosTipo = normalized.filter(
        (beneficiario) => beneficiario.tipoBeneficiario === tipo
      );

      if (beneficiariosTipo.length === 0) continue;

      const total = roundPercent(
        beneficiariosTipo.reduce(
          (sum, beneficiario) => sum + beneficiario.porcentajeBeneficio,
          0
        )
      );

      if (total !== 100) {
        return {
          success: false,
          message: `Los beneficiarios ${tipo.toLowerCase()} deben sumar exactamente 100%. Actualmente suman ${total}%.`,
        };
      }

      const duplicated = new Set<string>();

      for (const beneficiario of beneficiariosTipo) {
        const key = beneficiario.cedula.toLowerCase();

        if (duplicated.has(key)) {
          return {
            success: false,
            message: `La cédula ${beneficiario.cedula} ya existe para el tipo ${tipo}.`,
          };
        }

        duplicated.add(key);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.socioBeneficiario.deleteMany({ where: { socioId } });

      await tx.socioBeneficiario.createMany({
        data: normalized.map((beneficiario) => ({
          socioId,
          cedula: beneficiario.cedula,
          nombreCompleto: beneficiario.nombreCompleto,
          parentesco: beneficiario.parentesco,
          tipoBeneficiario: beneficiario.tipoBeneficiario,
          porcentajeBeneficio: beneficiario.porcentajeBeneficio,
        })),
      });
    });

    const data = await getBeneficiariosBySocioId(socioId);

    return {
      success: true,
      message: "Beneficiarios guardados correctamente.",
      data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    return {
      success: false,
      message,
    };
  }
};

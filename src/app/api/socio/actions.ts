"use server";

import { getVariableValue } from "@/app/api/variables/actions";
import { setDividendosPeriodo } from "@/app/api/dividendos/actions";
import { calcularProximaCuota } from "@/lib/calculos";
import { isDateOnly, todayCR } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { Socio } from "@/types/types";
// actions.ts
import { EstadoSocio, MotivoSalida, TipoBeneficiario, TipoCuota } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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
      where: {
        estadoSocio: EstadoSocio.ACTIVO,
      },
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
    return prisma.socio.findMany({
      where: {
        estadoSocio: EstadoSocio.ACTIVO,
      },
    });
  } catch {
    return [];
  }
};

export interface SocioDesafiliacionResumen {
  idSocio: number;
  cedula: string;
  nombre: string;
  correo: string;
  fechaIngreso: string | null;
  fechaSalida: string | null;
  montoAcciones: number;
  montoDividendos: number;
  montoPrestamosCapital: number;
  montoInteresOrdinario: number;
  montoInteresMoratorio: number;
  montoCreditosPendientes: number;
  saldoDisponible: number;
  saldoPagado: number;
  saldoIncobrable: number;
  periodo: string;
  prestamos: PrestamoDesafiliacionResumen[];
}

export interface PrestamoDesafiliacionResumen {
  idPrestamo: number;
  motivo: string | null;
  saldoCapital: number;
  interesOrdinario: number;
  interesMoratorio: number;
  montoPendiente: number;
  diasAtraso: number;
}

export interface BeneficiarioDesafiliacionInput {
  nombre: string;
  cedula: string;
  montoPagado: number;
  tipoBeneficiario?: TipoBeneficiario;
  porcentajeBeneficio?: number;
}

export interface DesafiliarSocioInput {
  socioId: number;
  fechaSalida: string;
  motivoSalida: MotivoSalida;
  justificacionSalida?: string;
  observacion?: string;
  beneficiarios?: BeneficiarioDesafiliacionInput[];
}

export interface DesafiliarSocioResponse {
  success: boolean;
  message: string;
  desafiliacionId?: number;
  resumen?: SocioDesafiliacionResumen;
  comprobanteDisponible?: boolean;
  reporteId?: string;
}

const DESAFILIACION_REPORT_ID = "";

const roundMoney = (value: number) => Math.round(value * 100) / 100;

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

const getPeriodoByFecha = async (fecha: string) => {
  const calendario = await prisma.calendario.findUnique({
    where: { fecha },
    select: { periodo: true },
  });

  return calendario?.periodo ?? null;
};

export const getSociosActivosParaDesafiliar = async (): Promise<Socio[]> => {
  try {
    return prisma.socio.findMany({
      where: { estadoSocio: EstadoSocio.ACTIVO },
      orderBy: { nombre: "asc" },
    });
  } catch {
    return [];
  }
};

export const puedeDesafiliarSocios = async (): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUserForServerAction();
    return currentUser?.rolId === 2;
  } catch {
    return false;
  }
};

export const calcularDesafiliacion = async (
  socioId: number,
  fechaSalida: string = todayCR()
): Promise<SocioDesafiliacionResumen | null> => {
  if (!isDateOnly(fechaSalida)) {
    throw new Error("La fecha de salida debe tener formato YYYY-MM-DD.");
  }

  const periodo = await getPeriodoByFecha(fechaSalida);

  if (!periodo) {
    throw new Error("No existe periodo de calendario para la fecha de salida.");
  }

  const dividendosResult = await setDividendosPeriodo(periodo);

  if (!dividendosResult.success) {
    throw new Error(dividendosResult.message);
  }

  const socio = await prisma.socio.findFirst({
    where: { idSocio: socioId, estadoSocio: EstadoSocio.ACTIVO },
    select: {
      idSocio: true,
      cedula: true,
      nombre: true,
      correo: true,
      fechaIngreso: true,
      fechaSalida: true,
      acciones: { select: { monto_colones: true } },
      prestamos: {
        where: { saldoCapital: { gt: 0 } },
        select: {
          idPrestamo: true,
          fecha: true,
          fecha_inicio_pago: true,
          motivo: true,
          modalidad: true,
          plazo: true,
          saldoCapital: true,
          pagos: { select: { idPago: true } },
        },
      },
      dividendos: {
        where: { periodo },
        select: { monto: true },
      },
    },
  });

  if (!socio) return null;

  const prestamos = await Promise.all(
    socio.prestamos.map(async (prestamo) => {
      const cuota = await calcularProximaCuota({
        plazoTotal: prestamo.plazo,
        plazoRestante: Math.max(prestamo.plazo - prestamo.pagos.length, 1),
        porcentajeInteresOrdinario: 5,
        porcentajeInteresMoratorio: 5,
        saldoActual: prestamo.saldoCapital,
        fechaProyectadaPago: prestamo.fecha_inicio_pago ?? fechaSalida,
        fechaReal: fechaSalida,
        modeloInteres: prestamo.modalidad,
        fechaGenerada: prestamo.fecha,
      });

      const interesOrdinario = roundMoney(cuota.montoInteresOrdinario);
      const interesMoratorio = roundMoney(cuota.montoInteresMoratorio);
      const saldoCapital = roundMoney(prestamo.saldoCapital);

      return {
        idPrestamo: prestamo.idPrestamo,
        motivo: prestamo.motivo,
        saldoCapital,
        interesOrdinario,
        interesMoratorio,
        montoPendiente: roundMoney(
          saldoCapital + interesOrdinario + interesMoratorio
        ),
        diasAtraso: cuota.diasAtraso ?? 0,
      };
    })
  );

  prestamos.sort((a, b) => a.montoPendiente - b.montoPendiente);

  const montoAcciones = roundMoney(
    socio.acciones.reduce((total, accion) => total + accion.monto_colones, 0)
  );
  const montoDividendos = roundMoney(
    socio.dividendos.reduce((total, dividendo) => total + dividendo.monto, 0)
  );
  const montoPrestamosCapital = roundMoney(
    prestamos.reduce((total, prestamo) => total + prestamo.saldoCapital, 0)
  );
  const montoInteresOrdinario = roundMoney(
    prestamos.reduce((total, prestamo) => total + prestamo.interesOrdinario, 0)
  );
  const montoInteresMoratorio = roundMoney(
    prestamos.reduce((total, prestamo) => total + prestamo.interesMoratorio, 0)
  );
  const montoCreditosPendientes = roundMoney(
    montoPrestamosCapital + montoInteresOrdinario + montoInteresMoratorio
  );
  const saldoDisponible = roundMoney(montoAcciones + montoDividendos);
  const saldoPagado = roundMoney(
    Math.max(saldoDisponible - montoCreditosPendientes, 0)
  );
  const saldoIncobrable = roundMoney(
    Math.max(montoCreditosPendientes - saldoDisponible, 0)
  );

  return {
    idSocio: socio.idSocio,
    cedula: socio.cedula,
    nombre: socio.nombre,
    correo: socio.correo,
    fechaIngreso: socio.fechaIngreso,
    fechaSalida: socio.fechaSalida,
    montoAcciones,
    montoDividendos,
    montoPrestamosCapital,
    montoInteresOrdinario,
    montoInteresMoratorio,
    montoCreditosPendientes,
    saldoDisponible,
    saldoPagado,
    saldoIncobrable,
    periodo,
    prestamos,
  };
};

export const desafiliarSocio = async (
  input: DesafiliarSocioInput
): Promise<DesafiliarSocioResponse> => {
  try {
    const currentUser = await getCurrentUserForServerAction();

    if (!currentUser || currentUser.rolId !== 2) {
      return {
        success: false,
        message: "Solo usuarios de Junta Directiva pueden desafiliar socios.",
      };
    }

    if (!isDateOnly(input.fechaSalida)) {
      return {
        success: false,
        message: "La fecha de salida debe tener formato YYYY-MM-DD.",
      };
    }

    if (
      input.motivoSalida === MotivoSalida.EXPULSION &&
      !input.justificacionSalida?.trim()
    ) {
      return {
        success: false,
        message: "La justificación es obligatoria para expulsión.",
      };
    }

    const resumen = await calcularDesafiliacion(
      input.socioId,
      input.fechaSalida
    );

    if (!resumen) {
      return {
        success: false,
        message: "El socio no existe o ya está desafiliado.",
      };
    }

    const beneficiarios = input.beneficiarios ?? [];

    if (input.motivoSalida === MotivoSalida.FALLECIMIENTO) {
      const beneficiariosAsignados = await prisma.socioBeneficiario.findMany({
        where: { socioId: input.socioId },
        select: {
          cedula: true,
          tipoBeneficiario: true,
        },
      });

      if (beneficiariosAsignados.length === 0) {
        return {
          success: false,
          message: "El socio no tiene beneficiarios asignados. No procede la desafiliación por fallecimiento.",
        };
      }

      if (beneficiarios.length === 0) {
        return {
          success: false,
          message: "Debe registrar uno o más beneficiarios.",
        };
      }

      if (
        beneficiarios.some(
          (beneficiario) =>
            !beneficiario.nombre.trim() ||
            !beneficiario.cedula.trim() ||
            beneficiario.montoPagado < 0
        )
      ) {
        return {
          success: false,
          message: "Todos los beneficiarios deben tener nombre, cédula y monto válido.",
        };
      }

      const totalBeneficiarios = roundMoney(
        beneficiarios.reduce(
          (total, beneficiario) => total + beneficiario.montoPagado,
          0
        )
      );

      if (totalBeneficiarios !== resumen.saldoPagado) {
        return {
          success: false,
          message: "La distribución de beneficiarios debe coincidir con el saldo a pagar.",
        };
      }

      const todosAsignados = beneficiarios.every((beneficiario) =>
        beneficiariosAsignados.some(
          (asignado) =>
            asignado.cedula === beneficiario.cedula &&
            asignado.tipoBeneficiario === beneficiario.tipoBeneficiario
        )
      );

      if (!todosAsignados) {
        return {
          success: false,
          message: "La distribución contiene beneficiarios que no están asignados al socio.",
        };
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const socio = await tx.socio.findFirst({
        where: { idSocio: input.socioId, estadoSocio: EstadoSocio.ACTIVO },
        select: { idSocio: true },
      });

      if (!socio) {
        throw new Error("El socio no existe o ya está desafiliado.");
      }

      const desafiliacion = await tx.desafiliacion.create({
        data: {
          socioId: input.socioId,
          fechaSalida: input.fechaSalida,
          motivoSalida: input.motivoSalida,
          justificacionSalida: input.justificacionSalida?.trim() || null,
          montoAcciones: resumen.montoAcciones,
          montoDividendos: resumen.montoDividendos,
          montoPrestamos: resumen.montoPrestamosCapital,
          montoInteresOrdinario: resumen.montoInteresOrdinario,
          montoInteresMoratorio: resumen.montoInteresMoratorio,
          saldoDisponible: resumen.saldoDisponible,
          saldoPagado: resumen.saldoPagado,
          saldoIncobrable: resumen.saldoIncobrable,
          reporteId: DESAFILIACION_REPORT_ID || null,
          observacion: input.observacion?.trim() || null,
          beneficiarios:
            input.motivoSalida === MotivoSalida.FALLECIMIENTO
              ? {
                  create: beneficiarios.map((beneficiario) => ({
                    nombre: beneficiario.nombre.trim(),
                    cedula: beneficiario.cedula.trim(),
                    montoPagado: beneficiario.montoPagado,
                  })),
                }
              : undefined,
        },
      });

      let disponibleParaCreditos = resumen.saldoDisponible;

      for (const prestamo of resumen.prestamos) {
        let aplicado = roundMoney(
          Math.min(disponibleParaCreditos, prestamo.montoPendiente)
        );

        const pagoMoratorio = roundMoney(
          Math.min(aplicado, prestamo.interesMoratorio)
        );
        aplicado = roundMoney(aplicado - pagoMoratorio);

        const pagoOrdinario = roundMoney(
          Math.min(aplicado, prestamo.interesOrdinario)
        );
        aplicado = roundMoney(aplicado - pagoOrdinario);

        const pagoCapital = roundMoney(Math.min(aplicado, prestamo.saldoCapital));
        const pagoTotal = roundMoney(
          pagoCapital + pagoOrdinario + pagoMoratorio
        );

        if (pagoTotal > 0) {
          await tx.pago.create({
            data: {
              prestamoId: prestamo.idPrestamo,
              socioId: input.socioId,
              fechaProyectada: input.fechaSalida,
              fechaReal: input.fechaSalida,
              diasAtraso: prestamo.diasAtraso,
              monto: pagoCapital,
              interesOrdinario: pagoOrdinario,
              interesMoratorio: pagoMoratorio,
              tipoCuota: TipoCuota.ADICIONAL,
            },
          });
        }

        disponibleParaCreditos = roundMoney(disponibleParaCreditos - pagoTotal);

        const incobrableMoratorio = roundMoney(
          prestamo.interesMoratorio - pagoMoratorio
        );
        const incobrableOrdinario = roundMoney(
          prestamo.interesOrdinario - pagoOrdinario
        );
        const incobrableCapital = roundMoney(prestamo.saldoCapital - pagoCapital);
        const incobrableTotal = roundMoney(
          incobrableCapital + incobrableOrdinario + incobrableMoratorio
        );

        if (incobrableTotal > 0) {
          await tx.pago.create({
            data: {
              prestamoId: prestamo.idPrestamo,
              socioId: input.socioId,
              fechaProyectada: input.fechaSalida,
              fechaReal: input.fechaSalida,
              diasAtraso: prestamo.diasAtraso,
              monto: incobrableCapital,
              interesOrdinario: incobrableOrdinario,
              interesMoratorio: incobrableMoratorio,
              tipoCuota: TipoCuota.INCOBRABLE,
            },
          });

          await tx.incobrable.create({
            data: {
              socioId: input.socioId,
              prestamoId: prestamo.idPrestamo,
              desafiliacionId: desafiliacion.idDesafiliacion,
              fecha: input.fechaSalida,
              monto: incobrableTotal,
              montoCapital: incobrableCapital,
              montoInteresOrdinario: incobrableOrdinario,
              montoInteresMoratorio: incobrableMoratorio,
              motivo: "PAGO INCOBRABLE",
              detalle: `Saldo no cubierto por desafiliación del préstamo ${prestamo.idPrestamo}`,
            },
          });
        }

        await tx.prestamo.update({
          where: { idPrestamo: prestamo.idPrestamo },
          data: {
            saldoCapital: 0,
            saldoInteresOrdinario: 0,
            saldoInteresMoratorio: 0,
          },
        });
      }

      await tx.socio.update({
        where: { idSocio: input.socioId },
        data: {
          estadoSocio: EstadoSocio.DESAFILIADO,
          fechaSalida: input.fechaSalida,
        },
      });

      return desafiliacion;
    });

    return {
      success: true,
      message: DESAFILIACION_REPORT_ID
        ? "Socio desafiliado correctamente."
        : "Socio desafiliado correctamente. El comprobante queda pendiente porque no hay REPORT_ID configurado.",
      desafiliacionId: created.idDesafiliacion,
      resumen,
      comprobanteDisponible: Boolean(DESAFILIACION_REPORT_ID),
      reporteId: DESAFILIACION_REPORT_ID || undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    return {
      success: false,
      message,
    };
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

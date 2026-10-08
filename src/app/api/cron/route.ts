import { recordatorioPagoProps } from "@/components/staticPages/RecordatorioCard";
import {
  calcularProximaCuota,
  CalcularProximaCuotaInput,
} from "@/lib/calculos";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendMailRecordatorioPago } from "./actions";

export async function POST(req: NextRequest) {
  let correos_enviados = 0;

  try {
    const data = await req.json();
    const fecha_3dias_str = obtenerFechaConDiasSumados(3);
    const variables = await prisma.variables.findFirst({
      where: {
        idVariable: 2,
      },
      select: {
        valor: true,
      },
    });

    const interes = variables?.valor || 0.05;

    //obtengo los prestamos con saldo mayor a cero
    const prestamos = await prisma.socio.findMany({
      select: {
        idSocio: true,
        cedula: true,
        nombre: true,
        correo: true,
        prestamos: {
          select: {
            idPrestamo: true,
            motivo: true,
            saldoCapital: true,
            fecha_inicio_pago: true,
            plazo: true,
            modalidad: true,
            fecha: true,
            pagos: {
              select: {
                idPago: true,
              },
            },
          },
          where: {
            saldoCapital: {
              gt: 0,
            },
          },
        },
      },
      where: {
        prestamos: {
          some: {},
        },
      },
    });

    if (!prestamos) {
      return new NextResponse("Error", { status: 500 });
    }

    // Recorro todos los prestamos
    for (const socio of prestamos) {
      if (socio.prestamos) {
        const prestamosArray = socio.prestamos.map(async (prestamo) => {
          const dia = prestamo.fecha_inicio_pago?.split("-")[2];

          const fechaproyectada = obtenerFechaConDia(Number(dia));

          if (fechaproyectada === fecha_3dias_str) {
            const inp: CalcularProximaCuotaInput = {
              plazoTotal: prestamo.plazo,
              plazoRestante: prestamo.plazo - prestamo.pagos.length,
              porcentajeInteresOrdinario: interes * 100,
              porcentajeInteresMoratorio: interes * 100,
              saldoActual: prestamo.saldoCapital,
              fechaProyectadaPago: fecha_3dias_str,
              fechaReal: fecha_3dias_str,
              modeloInteres: prestamo.modalidad,
              fechaGenerada: prestamo.fecha,
            };

            const montoPago = await calcularProximaCuota(inp);

            const datosPrestamo = {
              idPrestamo: prestamo.idPrestamo,
              motivo: prestamo.motivo!,
              saldo: prestamo.saldoCapital,
              fechaPago: fecha_3dias_str!,
              montoPago:
                montoPago.montoAmortizacionCapital +
                montoPago.montoInteresOrdinario +
                montoPago.montoInteresMoratorio,
            };

            return datosPrestamo;
          } else {
            return null;
          }
        });

        const prestamosA = await Promise.all(prestamosArray);
        // encabezado

        const prestamosFiltrados = prestamosA.filter((item) => item !== null);

        if (!prestamosFiltrados || prestamosFiltrados.length === 0) {
          console.log("No hay prestamos activos..");
        } else {
          const input: recordatorioPagoProps = {
            data: {
              idSocio: socio.idSocio,
              cedula: socio.cedula,
              nombre: socio.nombre, // Filter out null values before passing to prestamos
              prestamos: prestamosFiltrados.filter(Boolean) as {
                idPrestamo: number;
                motivo: string;
                saldo: number;
                fechaPago: string;
                montoPago: number;
              }[],
            },
          };

          await sendMailRecordatorioPago(input, socio.correo);
          correos_enviados++;
        }
      }
    }

    console.log("cron activity", data);

    const cronActivity = await prisma.cronActivity.create({
      data: {
        fecha: new Date(),
        emailsSended: correos_enviados,
      },
    });

    return NextResponse.json({ salida: cronActivity }, { status: 200 });
  } catch (err) {
    return new NextResponse("Error" + err, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await prisma.cronActivity.findMany();

    if (!data) {
      return new NextResponse("Error", { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
  }
}

function obtenerFechaConDia(dia: number): string {
  const hoy = new Date();

  // Obtener el año y el mes actuales
  let anio = hoy.getFullYear();
  let mes = hoy.getMonth(); // Los meses en JavaScript van de 0 (enero) a 11 (diciembre)

  // Obtener el último día del mes actual

  if (mes + 2 > 11) {
    anio += 1;
    mes = 0;
  } else {
    mes += 1;
  }

  const ultimoDiaMes = new Date(anio, mes, 0).getDate();

  // Si el día proporcionado es mayor que el último día del mes, asignamos el último día
  const diaFinal = dia > ultimoDiaMes ? ultimoDiaMes : dia;

  // Crear una nueva fecha con el día suministrado
  const fecha = new Date(anio, mes, diaFinal);

  // Formatear la fecha en formato "yyyy-mm-dd"
  const fechaFormateada = fecha.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Reemplazamos las barras por guiones
  return fechaFormateada.split("/").reverse().join("-");
}

function obtenerFechaConDiasSumados(n: number) {
  // Crear un objeto Date para la fecha actual
  const fecha_hoy = new Date();

  // Ajustar la fecha a la zona horaria de Costa Rica (UTC -6)
  const offset = -6; // Costa Rica está en UTC -6
  fecha_hoy.setHours(fecha_hoy.getHours() + offset);

  // Crear una nueva fecha sumando 'n' días
  const fecha_sumada = new Date(fecha_hoy);
  fecha_sumada.setDate(fecha_hoy.getDate() + n);

  // Formatear la fecha en "yyyy-mm-dd"
  let fecha_str = fecha_sumada.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Reemplazar los "/" por "-" para obtener el formato "yyyy-mm-dd"
  fecha_str = fecha_str.split("/").reverse().join("-");

  return fecha_str;
}

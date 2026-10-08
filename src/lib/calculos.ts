import { parseDateOnly, toDateOnly } from "@/lib/date";

type ModeloInteres = "ALEMAN" | "FRANCES";

export interface CalcularProximaCuotaInput {
  plazoTotal: number; // total de cuotas del préstamo
  plazoRestante: number; // número de cuotas restantes
  porcentajeInteresOrdinario: number; // % mensual
  porcentajeInteresMoratorio: number; // % mensual sobre saldo por día de atraso
  saldoActual: number;
  fechaProyectadaPago: string; // "YYYY-MM-DD"
  fechaReal: string; // "YYYY-MM-DD"
  modeloInteres: ModeloInteres;
  fechaGenerada: string;
}
interface ProximaCuotaOutput {
  montoAmortizacionCapital: number;
  montoInteresOrdinario: number;
  montoInteresMoratorio: number;
  diasAtraso?: number;
}
export interface GenerarProyeccionInput {
  monto: number;
  plazoMeses: number;
  tasaInteresMensual: number; // % mensual
  modelo: ModeloInteres;
  fechaSolicitud: string; // "YYYY-MM-DD"
  fechaPrimerPago: string; // "YYYY-MM-DD"
}
export interface CuotaProyectada {
  numeroCuota: number;
  fechaPago: string;
  montoCuota: number;
  amortizacionCapital: number;
  interes: number;
  saldoPendiente: number;
}

/**
 *
 * @param input : CalcularProximaCuotaInput
 * @returns
 */
export async function calcularProximaCuota(
  input: CalcularProximaCuotaInput,
): Promise<ProximaCuotaOutput> {
  const {
    plazoRestante,
    porcentajeInteresOrdinario,
    porcentajeInteresMoratorio,
    saldoActual,
    fechaProyectadaPago,
    fechaReal,
    modeloInteres,
    fechaGenerada,
  } = input;

  // 1️⃣ Convertir fechas a Date
  const fechaProy = parseDateOnly(fechaProyectadaPago);
  const fechaAct = parseDateOnly(fechaReal);
  const fechaGen = parseDateOnly(fechaGenerada);

  // 2️⃣ Calcular días de atraso
  const diasAtraso = Math.max(
    0,
    Math.ceil(
      (fechaAct.getTime() - fechaProy.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  let montoAmortizacionCapital = 0;
  let montoInteresOrdinario = 0;
  let montoInteresMoratorio = 0;

  // Interés moratorio
  montoInteresMoratorio =
    saldoActual * (porcentajeInteresMoratorio / 100) * (diasAtraso / 30);

  if (modeloInteres === "ALEMAN") {
    // 3️⃣ Sistema Alemán: capital constante ajustado al saldo actual

    if (validarFecha_pagaInteres(fechaGen, fechaProy)) {
      if (plazoRestante > 0) {
        montoAmortizacionCapital = saldoActual / plazoRestante;
      } else {
        montoAmortizacionCapital = 0;
      }
      console.log(saldoActual);
      console.log(plazoRestante);
    } else {
      montoAmortizacionCapital = 0;
    }

    console.log(montoAmortizacionCapital);

    montoInteresOrdinario = saldoActual * (porcentajeInteresOrdinario / 100);
  } else if (modeloInteres === "FRANCES") {
    // 4️⃣ Sistema Francés: cuota total constante basada en saldo actual y plazo restante
    const i = porcentajeInteresOrdinario / 100; // tasa mensual
    const n = plazoRestante;

    // cuota total mensual según fórmula francesa
    const cuotaTotal =
      (saldoActual * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);

    montoInteresOrdinario = saldoActual * i;
    montoAmortizacionCapital = cuotaTotal - montoInteresOrdinario;
  }

  // 5️⃣ Redondeo a 2 decimales
  return {
    montoAmortizacionCapital: Math.round(montoAmortizacionCapital * 100) / 100,
    montoInteresOrdinario: Math.round(montoInteresOrdinario * 100) / 100,
    montoInteresMoratorio: Math.round(montoInteresMoratorio * 100) / 100,
    diasAtraso: diasAtraso,
  };
}

export function generarProyeccionPagos(
  input: GenerarProyeccionInput,
): CuotaProyectada[] {
  const { monto, plazoMeses, tasaInteresMensual, modelo, fechaPrimerPago } =
    input;

  const i = tasaInteresMensual / 100; // tasa decimal
  let saldo = monto;
  const cuotas: CuotaProyectada[] = [];

  // Calcular cuota total fija en caso del sistema francés
  let cuotaFrances = 0;
  if (modelo === "FRANCES") {
    cuotaFrances =
      (monto * (i * Math.pow(1 + i, plazoMeses))) /
      (Math.pow(1 + i, plazoMeses) - 1);
  }

  // Iterar sobre cada cuota
  for (let n = 1; n <= plazoMeses; n++) {
    // fecha de pago = fechaPrimerPago + (n-1) meses
    const fecha = parseDateOnly(fechaPrimerPago);
    fecha.setMonth(fecha.getMonth() + (n - 1));
    const fechaPago = toDateOnly(fecha);

    const interes = saldo * i;
    let amortizacionCapital = 0;
    let montoCuota = 0;

    if (modelo === "ALEMAN") {
      amortizacionCapital = monto / plazoMeses;
      montoCuota = interes + amortizacionCapital;
    } else if (modelo === "FRANCES") {
      montoCuota = cuotaFrances;
      amortizacionCapital = montoCuota - interes;
    }

    saldo -= amortizacionCapital;

    cuotas.push({
      numeroCuota: n,
      fechaPago,
      montoCuota: Math.round(montoCuota * 100) / 100,
      amortizacionCapital: Math.round(amortizacionCapital * 100) / 100,
      interes: Math.round(interes * 100) / 100,
      saldoPendiente: Math.round(Math.max(saldo, 0) * 100) / 100,
    });
  }

  return cuotas;
}

export function validarFecha_pagaInteres(gen: Date, proy: Date): boolean {
  if (isNaN(gen.getTime()) || isNaN(proy.getTime())) {
    throw new Error("Fechas inválidas");
  }

  const diaGen = gen.getDate();

  const mesGen = gen.getMonth(); // 0-11
  const mesProy = proy.getMonth();

  const diferenciaMes = Math.abs(mesGen - mesProy);

  // condición de rechazo
  if (diaGen >= 20 && diferenciaMes === 1) {
    return false;
  }

  return true;
}

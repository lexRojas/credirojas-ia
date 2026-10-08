// types.ts

import { EstadoSocio, prestamo_modalidad, pagos_tipoCuota } from "@prisma/client";

// Modelos
export interface Accion {
  idAccion: number;
  socioId: number;
  fecha: string;
  cantidadAcciones: number;
  periodo?: string | null;
  mes?: string | null;
  pesoMultiplicador?: number | null;
  monto_colones: number;
  socio?: Socio; // Relación opcional a socio
}

export interface Pagos {
  idPago: number;
  socioId: number;
  prestamoId?: number | null;
  fechaProyectada: string;
  fechaReal?: string | null;
  diasAtraso?: number | null;
  monto: number;
  interesOrdinario: number;
  tipoCuota: pagos_tipoCuota;
  interesMoratorio: number;
  prestamo?: Prestamo | null; // Relación opcional a prestamo
  socio?: Socio; // Relación opcional a socio
}

export interface Prestamo {
  idPrestamo: number;
  socioId: number;
  fecha: string;
  fecha_inicio_pago: string | null;
  monto: number;
  plazo: number;
  motivo?: string | null;
  modalidad: prestamo_modalidad;
  saldoCapital: number;
  saldoInteresOrdinario: number;
  saldoInteresMoratorio: number;
  pagos?: Pagos[]; // Relación 1:N
  socio?: Socio; // Relación opcional a socio
}

export interface Rol {
  idRol: number;
  descripcion: string;
  socio?: Socio[]; // Relación 1:N
}

export interface Socio {
  idSocio: number;
  fechaNacimiento?: string | null;
  fechaIngreso?: string | null;
  fechaSalida?: string | null;
  montoAccion: number;
  multiplicador?: number | null;
  nombre: string;
  cedula?: string | null;
  correo: string;
  telefono?: string | null;
  direccion?: string | null;
  estado_civil?: string | null;
  profesion?: string | null;
  password: string;
  rolId?: number | null;
  estadoSocio?: EstadoSocio;
  username: string;
  accion?: Accion[];
  pagos?: Pagos[];
  prestamo?: Prestamo[];
  rol?: Rol | null;
  solicitudes?: Solicitudes[];
  votacion?: Votacion[];
}

export interface Solicitudes {
  idSolicitud: number;
  socioId: number;
  fechaSolicitud: string;
  detalle?: string | null;
  aprobada: boolean;
  fechaAprobacion?: string | null;
  cerrada: boolean;
  socio?: Socio; // Relación opcional
  votacion?: Votacion[];
}

export interface Variables {
  idVariable: number;
  descripcion: string;
  valor: number;
}

export interface Votacion {
  idVoto: number;
  socioId: number;
  solicitudId: number;
  fecha: string;
  hora?: string | null;
  observacion?: string | null;
  aprueba: boolean;
  socio?: Socio; // Relación opcional
  solicitudes?: Solicitudes; // Relación 1:1
}

export interface saldo_prestamos {
  socioId: number;
  idPrestamo: number;
  fecha: string;
  motivo: string | null;
  monto: number;
  plazo: number;
  pagos: number;
  montoAbonado: number;
  saldoCapital: number;
}

export interface estado_cuenta {
  // Datos del socio
  idSocio: number;
  cedula: string;
  nombre: string;

  // Prestamos asociados al socio
  prestamos: {
    idPrestamo: number;
    motivo: string | null;
    monto: number;
    plazo: number;
    modalidad: "ALEMAN" | "FRANCES";
    saldoCapital: number;
    saldoInteresOrdinario: number;
    saldoInteresMoratorio: number;

    // Pagos asociados al préstamo
    pagos: {
      idPago: number;
      fechaProyectada: string;
      fechaReal: string | null;
      abonoTotal: number;
      monto: number; // monto del abono
      interesOrdinario: number;
      interesMoratorio: number;
    }[];
  }[];
}

export interface sociosConAcciones_type {
  acciones: {
    idAccion: number;
    fecha: string;
    cantidadAcciones: number;
    periodo: string | null;
    pesoMultiplicador: number | null;
    monto_colones: number;
    mes: string | null;
  }[];
  idSocio: number;
  nombre: string;
  cedula: string;
  correo: string;
}

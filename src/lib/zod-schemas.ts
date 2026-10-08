// zod-schemas.ts
import { z } from "zod";

/* -------------------- Enums -------------------- */
export const PrestamoModalidadSchema = z.enum(["ALEMAN", "FRANCES"], {
  message: "La modalidad del préstamo es inválida",
});

export const PagosTipoCuotaSchema = z.enum(["ORDINARIA", "ADICIONAL"], {
  message: "El tipo de cuota es inválido",
});

/* -------------------- Modelos -------------------- */

export const AccionSchema = z.object({
  idAccion: z.number().int().optional(),
  socioId: z.number().int({ message: "El id del socio es obligatorio" }),
  fecha: z.string({ message: "La fecha es obligatoria" }),
  cantidadAcciones: z.number({
    message: "La cantidad de acciones es obligatoria",
  }),
  periodo: z.string().optional(),
  pesoMultiplicador: z.number().int().optional(),
  monto_colones: z.number({ message: "El monto en colones es obligatorio" }),
});

export const PagosSchema = z.object({
  idPago: z.number().int().optional(),
  socioId: z.number().int({ message: "El id del socio es obligatorio" }),
  prestamoId: z.number().int().optional(),
  fechaProyectada: z.string({ message: "La fecha proyectada es obligatoria" }),
  fechaReal: z.string().optional(),
  diasAtraso: z.number().optional(),
  monto: z.number({ message: "El monto es obligatorio" }),
  interesOrdinario: z.number({
    message: "El interés ordinario es obligatorio",
  }),
  tipoCuota: PagosTipoCuotaSchema,
  interesMoratorio: z.number({
    message: "El interés extraordinario es obligatorio",
  }),
});

export const PrestamoSchema = z.object({
  idPrestamo: z.number().int().optional(),
  socioId: z.number().int({ message: "El id del socio es obligatorio" }),
  monto: z.number({ message: "El monto es obligatorio" }),
  plazo: z.number().int({ message: "El plazo es obligatorio" }),
  motivo: z.string().optional(),
  modalidad: PrestamoModalidadSchema,
  saldoCapital: z.number({ message: "El saldo de capital es obligatorio" }),
  saldoInteresOrdinario: z.number({
    message: "El saldo de interés ordinario es obligatorio",
  }),
  saldoInteresMoratorio: z.number({
    message: "El saldo de interés moratorio es obligatorio",
  }),
});

export const RolSchema = z.object({
  idRol: z.number().int().optional(),
  descripcion: z.string({ message: "La descripción del rol es obligatoria" }),
});

export const SocioSchema = z.object({
  idSocio: z.number().int().optional(),
  fechaNacimiento: z.string().optional(),
  fechaIngreso: z.string().optional(),
  fechaSalida: z.string().optional(),
  montoAccion: z.number({ message: "El monto de acción es obligatorio" }),
  multiplicador: z.number().int().optional(),
  nombre: z.string({ message: "El nombre es obligatorio" }),
  cedula: z
    .string("La cédula es obligatoria") // asegura que no esté vacía
    .min(9, "La cédula debe tener al menos 9 dígitos")
    .max(12, "La cédula no puede tener más de 12 dígitos") // opcional
    .regex(/^\d+$/, "La cédula solo puede contener números"),

  correo: z
    .email({ message: "El correo no es válido" }) // valida y da mensaje si no es un email
    .nonempty({ message: "El correo es obligatorio" }), // valida que no esté vacío
  direccion: z.string().optional(),
  estado_civil: z.string().optional(),
  profesion: z.string().optional(),
  telefono: z.string().optional(),
  password: z.string({ message: "La contraseña es obligatoria" }),
  rolId: z.number().int().optional(),
  username: z.string({ message: "El username es obligatorio" }),
});

export const SolicitudesSchema = z.object({
  idSolicitud: z.number().int().optional(),
  socioId: z.number().int({ message: "El id del socio es obligatorio" }),
  fechaSolicitud: z.string({ message: "La fecha de solicitud es obligatoria" }),
  detalle: z.string().optional(),
  aprobada: z.boolean().optional(),
  fechaAprobacion: z.string().optional(),
  cerrada: z.boolean().optional(),
});

export const VariablesSchema = z.object({
  idVariable: z.number().int().optional(),
  descripcion: z.string({ message: "La descripción es obligatoria" }),
  valor: z.number({ message: "El valor es obligatorio" }),
});

export const VotacionSchema = z.object({
  idVoto: z.number().int().optional(),
  socioId: z.number().int({ message: "El id del socio es obligatorio" }),
  solicitudId: z
    .number()
    .int({ message: "El id de la solicitud es obligatorio" }),
  fecha: z.string({ message: "La fecha es obligatoria" }),
  hora: z.string().optional(),
  observacion: z.string().optional(),
  aprueba: z.boolean().optional(),
});

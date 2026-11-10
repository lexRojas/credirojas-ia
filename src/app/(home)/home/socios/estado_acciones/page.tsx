'use client'

import {
  actualizarAccion,
  eliminarAccion,
  getAccionesMantenimiento,
  getSociosActivosAcciones,
  type ActualizarAccionInput,
  type SocioActivoAcciones,
} from "@/app/api/acciones/actions";
import { getVariableValue } from "@/app/api/variables/actions";
import type { Accion } from "@/types/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type Filtros = {
  periodo: string;
  mes: string;
  fechaDesde: string;
  fechaHasta: string;
};

const FILTROS_VACIOS: Filtros = {
  periodo: "",
  mes: "",
  fechaDesde: "",
  fechaHasta: "",
};

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const formatoCRC = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
});

function getErrorEdicion(input: ActualizarAccionInput): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.fecha)) {
    return "Seleccione una fecha válida.";
  }

  const [anio, mes] = input.fecha.split("-").map(Number);
  if (input.periodo !== String(anio)) {
    return "El periodo debe coincidir con el año de la fecha.";
  }
  if (input.mes !== String(mes)) {
    return "El mes debe coincidir con el mes de la fecha.";
  }
  if (!Number.isInteger(input.cantidadAcciones) || input.cantidadAcciones <= 0) {
    return "La cantidad de acciones debe ser un entero mayor que cero.";
  }

  return null;
}

export default function MantenimientoAccionesPage() {
  const [socios, setSocios] = useState<SocioActivoAcciones[]>([]);
  const [busquedaSocio, setBusquedaSocio] = useState("");
  const [socioId, setSocioId] = useState<number | null>(null);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
  const [montoAccion, setMontoAccion] = useState(0);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoAcciones, setCargandoAcciones] = useState(false);
  const [accionEditando, setAccionEditando] = useState<ActualizarAccionInput | null>(null);
  const [accionEliminando, setAccionEliminando] = useState<Accion | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const [sociosActivos, variableMonto] = await Promise.all([
          getSociosActivosAcciones(),
          getVariableValue(4),
        ]);
        setSocios(sociosActivos);
        setMontoAccion(variableMonto.valor);
      } catch (error) {
        console.error(error);
        toast.error("No se pudo cargar la información para el mantenimiento de acciones.");
      } finally {
        setCargandoInicial(false);
      }
    };

    cargarInicial();
  }, []);

  useEffect(() => {
    let vigente = true;

    const cargarAcciones = async () => {
      if (!socioId) {
        setAcciones([]);
        return;
      }

      setCargandoAcciones(true);
      try {
        const resultado = await getAccionesMantenimiento(socioId);
        if (vigente) setAcciones(resultado);
      } catch (error) {
        console.error(error);
        if (vigente) {
          setAcciones([]);
          toast.error("No se pudieron cargar las acciones del socio.");
        }
      } finally {
        if (vigente) setCargandoAcciones(false);
      }
    };

    cargarAcciones();
    return () => {
      vigente = false;
    };
  }, [socioId]);

  const sociosFiltrados = useMemo(() => {
    const texto = busquedaSocio.trim().toLowerCase();
    if (!texto) return socios;
    return socios.filter(
      (socio) =>
        socio.nombre.toLowerCase().includes(texto) ||
        socio.cedula.toLowerCase().includes(texto)
    );
  }, [busquedaSocio, socios]);

  const periodos = useMemo(
    () =>
      Array.from(
        new Set(acciones.map((accion) => accion.periodo).filter((valor): valor is string => Boolean(valor)))
      ).sort((a, b) => b.localeCompare(a)),
    [acciones]
  );

  const rangoInvalido = Boolean(
    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta
  );

  const accionesFiltradas = useMemo(() => {
    if (rangoInvalido) return [];

    return acciones.filter((accion) => {
      if (filtros.periodo && accion.periodo !== filtros.periodo) return false;
      if (filtros.mes && accion.mes !== filtros.mes) return false;
      if (filtros.fechaDesde && accion.fecha < filtros.fechaDesde) return false;
      if (filtros.fechaHasta && accion.fecha > filtros.fechaHasta) return false;
      return true;
    });
  }, [acciones, filtros, rangoInvalido]);

  const socioSeleccionado = socios.find((socio) => socio.idSocio === socioId) ?? null;

  const seleccionarSocio = (valor: string) => {
    const nuevoSocioId = valor ? Number(valor) : null;
    setSocioId(nuevoSocioId);
    setFiltros(FILTROS_VACIOS);
    setAccionEditando(null);
    setAccionEliminando(null);
  };

  const refrescarAcciones = async () => {
    if (!socioId) return;
    const resultado = await getAccionesMantenimiento(socioId);
    setAcciones(resultado);
  };

  const abrirEdicion = (accion: Accion) => {
    setAccionEditando({
      idAccion: accion.idAccion,
      periodo: accion.periodo ?? "",
      mes: accion.mes ?? "",
      fecha: accion.fecha,
      cantidadAcciones: accion.cantidadAcciones,
    });
  };

  const cambiarFechaEdicion = (fecha: string) => {
    setAccionEditando((actual) => {
      if (!actual) return actual;
      const [periodo = "", mesConCero = ""] = fecha.split("-");
      const mes = mesConCero ? String(Number(mesConCero)) : "";
      return { ...actual, fecha, periodo, mes };
    });
  };

  const guardarEdicion = async () => {
    if (!accionEditando) return;
    const error = getErrorEdicion(accionEditando);
    if (error) {
      toast.error(error);
      return;
    }

    setProcesando(true);
    try {
      const resultado = await actualizarAccion(accionEditando);
      if (!resultado.success) {
        toast.error(resultado.message);
        return;
      }

      await refrescarAcciones();
      setAccionEditando(null);
      toast.success(resultado.message);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar la acción.");
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!accionEliminando) return;

    setProcesando(true);
    try {
      const resultado = await eliminarAccion(accionEliminando.idAccion);
      if (!resultado.success) {
        toast.error(resultado.message);
        return;
      }

      await refrescarAcciones();
      setAccionEliminando(null);
      toast.success(resultado.message);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar la acción.");
    } finally {
      setProcesando(false);
    }
  };

  const totalCantidad = accionesFiltradas.reduce(
    (total, accion) => total + accion.cantidadAcciones,
    0
  );
  const totalMonto = accionesFiltradas.reduce(
    (total, accion) => total + accion.monto_colones,
    0
  );
  const errorEdicion = accionEditando ? getErrorEdicion(accionEditando) : null;

  if (cargandoInicial) {
    return <div className="p-4">Cargando mantenimiento de acciones...</div>;
  }

  return (
    <div className="w-full p-3 text-gray-900">
      <h1 className="mb-4 text-xl font-bold">Mantenimiento de Acciones</h1>

      <section className="mb-5 rounded-lg border border-gray-300 bg-gray-50 p-4">
        <h2 className="mb-3 font-semibold">Seleccionar socio activo</h2>
        {socios.length === 0 ? (
          <p>No existen socios activos disponibles.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Buscar por nombre o cédula</span>
              <input
                type="search"
                value={busquedaSocio}
                onChange={(event) => setBusquedaSocio(event.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2"
                placeholder="Buscar socio"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Socio</span>
              <select
                value={socioId ?? ""}
                onChange={(event) => seleccionarSocio(event.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2"
              >
                <option value="">Seleccione un socio</option>
                {sociosFiltrados.map((socio) => (
                  <option key={socio.idSocio} value={socio.idSocio}>
                    {socio.cedula} - {socio.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </section>

      {!socioSeleccionado ? (
        <div className="rounded border border-blue-200 bg-blue-50 p-4">
          Seleccione un socio activo para consultar sus acciones.
        </div>
      ) : (
        <>
          <section className="mb-4 rounded-lg border border-gray-300 bg-white p-4">
            <h2 className="mb-3 font-semibold">
              Acciones de {socioSeleccionado.cedula} - {socioSeleccionado.nombre}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label>
                <span className="mb-1 block text-sm font-medium">Periodo</span>
                <select
                  value={filtros.periodo}
                  onChange={(event) => setFiltros({ ...filtros, periodo: event.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="">Todos</option>
                  {periodos.map((periodo) => (
                    <option key={periodo} value={periodo}>{periodo}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Mes</span>
                <select
                  value={filtros.mes}
                  onChange={(event) => setFiltros({ ...filtros, mes: event.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="">Todos</option>
                  {MESES.map((nombre, index) => (
                    <option key={nombre} value={String(index + 1)}>{nombre}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Fecha desde</span>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(event) => setFiltros({ ...filtros, fechaDesde: event.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Fecha hasta</span>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(event) => setFiltros({ ...filtros, fechaHasta: event.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setFiltros(FILTROS_VACIOS)}
                  className="w-full rounded bg-gray-600 px-3 py-2 text-white hover:bg-gray-700"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
            {rangoInvalido && (
              <p className="mt-2 text-sm font-medium text-red-600">
                La fecha desde no puede ser posterior a la fecha hasta.
              </p>
            )}
          </section>

          {cargandoAcciones ? (
            <p>Cargando acciones...</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-blue-950/80 text-left text-white">
                  <tr>
                    <th className="p-2">Id Acción</th>
                    <th className="p-2">Periodo</th>
                    <th className="p-2">Mes</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2 text-right">Cantidad de acciones</th>
                    <th className="p-2 text-right">Monto</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {accionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-5 text-center text-gray-600">
                        {acciones.length === 0
                          ? "El socio no tiene acciones registradas."
                          : "No hay acciones que coincidan con los filtros."}
                      </td>
                    </tr>
                  ) : (
                    accionesFiltradas.map((accion) => (
                      <tr key={accion.idAccion} className="border-t border-gray-200 hover:bg-blue-50">
                        <td className="p-2">{accion.idAccion}</td>
                        <td className="p-2">{accion.periodo ?? "-"}</td>
                        <td className="p-2">{accion.mes ?? "-"}</td>
                        <td className="p-2">{accion.fecha}</td>
                        <td className="p-2 text-right">{accion.cantidadAcciones}</td>
                        <td className="p-2 text-right">{formatoCRC.format(accion.monto_colones)}</td>
                        <td className="p-2">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => abrirEdicion(accion)}
                              className="rounded bg-blue-700 px-3 py-1 text-white hover:bg-blue-800"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setAccionEliminando(accion)}
                              className="rounded bg-red-700 px-3 py-1 text-white hover:bg-red-800"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {accionesFiltradas.length > 0 && (
                  <tfoot className="border-t bg-yellow-100 font-bold">
                    <tr>
                      <td colSpan={4} className="p-2 text-right">Totales filtrados:</td>
                      <td className="p-2 text-right">{totalCantidad}</td>
                      <td className="p-2 text-right">{formatoCRC.format(totalMonto)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </>
      )}

      {accionEditando && socioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-editar-accion">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
            <h2 id="titulo-editar-accion" className="mb-4 text-lg font-bold">Editar acción</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-sm font-medium">Id Acción</span>
                <input value={accionEditando.idAccion} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Id Socio</span>
                <input value={socioSeleccionado.idSocio} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Periodo</span>
                <input
                  inputMode="numeric"
                  value={accionEditando.periodo}
                  onChange={(event) => setAccionEditando({ ...accionEditando, periodo: event.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Mes</span>
                <select
                  value={accionEditando.mes}
                  onChange={(event) => setAccionEditando({ ...accionEditando, mes: event.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="">Seleccione</option>
                  {MESES.map((nombre, index) => (
                    <option key={nombre} value={String(index + 1)}>{nombre}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Fecha</span>
                <input
                  type="date"
                  value={accionEditando.fecha}
                  onChange={(event) => cambiarFechaEdicion(event.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium">Cantidad de acciones</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={accionEditando.cantidadAcciones}
                  onChange={(event) => setAccionEditando({
                    ...accionEditando,
                    cantidadAcciones: Number(event.target.value),
                  })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Monto recalculado</span>
                <input
                  value={formatoCRC.format(accionEditando.cantidadAcciones * montoAccion || 0)}
                  disabled
                  className="w-full rounded border bg-gray-100 px-3 py-2"
                />
              </label>
            </div>
            {errorEdicion && <p className="mt-3 text-sm font-medium text-red-600">{errorEdicion}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={procesando}
                onClick={() => setAccionEditando(null)}
                className="rounded bg-gray-500 px-4 py-2 text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={procesando || Boolean(errorEdicion) || montoAccion <= 0}
                onClick={guardarEdicion}
                className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
              >
                {procesando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {accionEliminando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-eliminar-accion">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 id="titulo-eliminar-accion" className="mb-3 text-lg font-bold">Confirmar eliminación</h2>
            <p>
              ¿Desea eliminar permanentemente la acción <strong>#{accionEliminando.idAccion}</strong> del {accionEliminando.fecha}?
            </p>
            <p className="mt-2 text-sm text-red-700">Esta operación no se puede deshacer.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={procesando}
                onClick={() => setAccionEliminando(null)}
                className="rounded bg-gray-500 px-4 py-2 text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={procesando}
                onClick={confirmarEliminacion}
                className="rounded bg-red-700 px-4 py-2 text-white disabled:opacity-50"
              >
                {procesando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

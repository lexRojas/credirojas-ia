"use client";

import {
  BeneficiarioDesafiliacionInput,
  calcularDesafiliacion,
  desafiliarSocio,
  getSociosActivosParaDesafiliar,
  puedeDesafiliarSocios,
  SocioDesafiliacionResumen,
} from "@/app/api/socio/actions";
import {
  getBeneficiariosBySocioId,
} from "@/app/api/beneficiarios/actions";
import type { SocioBeneficiarioOutput } from "@/app/api/beneficiarios/actions";
import { todayCR } from "@/lib/date";
import { Socio } from "@/types/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type MotivoSalidaOption = "RENUNCIA" | "EXPULSION" | "FALLECIMIENTO";

const currency = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
});

export default function DesafiliarSocioPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [socioId, setSocioId] = useState(0);
  const [fechaSalida, setFechaSalida] = useState(todayCR());
  const [motivoSalida, setMotivoSalida] =
    useState<MotivoSalidaOption>("RENUNCIA");
  const [justificacionSalida, setJustificacionSalida] = useState("");
  const [observacion, setObservacion] = useState("");
  const [beneficiariosAsignados, setBeneficiariosAsignados] = useState<
    SocioBeneficiarioOutput[]
  >([]);
  const [beneficiariosDisponibles, setBeneficiariosDisponibles] = useState<
    number[]
  >([]);
  const [resumen, setResumen] = useState<SocioDesafiliacionResumen | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const puede = await puedeDesafiliarSocios();
      setAutorizado(puede);

      if (!puede) return;

      const data = await getSociosActivosParaDesafiliar();
      setSocios(data);
    };

    init();
  }, []);

  useEffect(() => {
    const loadBeneficiarios = async () => {
      if (!resumen || motivoSalida !== "FALLECIMIENTO") {
        setBeneficiariosAsignados([]);
        setBeneficiariosDisponibles([]);
        return;
      }

      const data = await getBeneficiariosBySocioId(resumen.idSocio);
      setBeneficiariosAsignados(data);
      setBeneficiariosDisponibles([]);
    };

    loadBeneficiarios();
  }, [resumen, motivoSalida]);

  const distribucionBeneficiarios = useMemo(() => {
    if (!resumen) {
      return {
        beneficiarios: [] as BeneficiarioDesafiliacionInput[],
        totalAsignado: 0,
        saldoPendiente: 0,
        saldoRestanteOrdinarios: 0,
      };
    }

    const isDisponible = (id: number) => beneficiariosDisponibles.includes(id);
    const ordinarios = beneficiariosAsignados.filter(
      (beneficiario) => beneficiario.tipoBeneficiario === "ORDINARIO"
    );
    const contingentes = beneficiariosAsignados.filter(
      (beneficiario) => beneficiario.tipoBeneficiario === "CONTINGENTE"
    );
    const porcentajeOrdinarioDisponible = ordinarios
      .filter((beneficiario) => isDisponible(beneficiario.idBeneficiario))
      .reduce((total, beneficiario) => total + beneficiario.porcentajeBeneficio, 0);
    const montoOrdinarios = Math.round(
      resumen.saldoPagado * Math.min(porcentajeOrdinarioDisponible, 100)
    ) / 100;
    const saldoRestanteOrdinarios = Math.round(
      Math.max(resumen.saldoPagado - montoOrdinarios, 0) * 100
    ) / 100;
    const beneficiariosOrdinarios = ordinarios
      .filter((beneficiario) => isDisponible(beneficiario.idBeneficiario))
      .map((beneficiario) => ({
        nombre: beneficiario.nombreCompleto,
        cedula: beneficiario.cedula,
        montoPagado: Math.round(
          resumen.saldoPagado * (beneficiario.porcentajeBeneficio / 100) * 100
        ) / 100,
        tipoBeneficiario: beneficiario.tipoBeneficiario,
        porcentajeBeneficio: beneficiario.porcentajeBeneficio,
      }));
    const beneficiariosContingentes = contingentes
      .filter((beneficiario) => isDisponible(beneficiario.idBeneficiario))
      .map((beneficiario) => ({
        nombre: beneficiario.nombreCompleto,
        cedula: beneficiario.cedula,
        montoPagado: Math.round(
          saldoRestanteOrdinarios * (beneficiario.porcentajeBeneficio / 100) * 100
        ) / 100,
        tipoBeneficiario: beneficiario.tipoBeneficiario,
        porcentajeBeneficio: beneficiario.porcentajeBeneficio,
      }));
    const beneficiarios = [...beneficiariosOrdinarios, ...beneficiariosContingentes].filter(
      (beneficiario) => beneficiario.montoPagado > 0
    );
    const totalAsignado = Math.round(
      beneficiarios.reduce((total, beneficiario) => total + beneficiario.montoPagado, 0) * 100
    ) / 100;
    const saldoPendiente = Math.round(Math.max(resumen.saldoPagado - totalAsignado, 0) * 100) / 100;

    return {
      beneficiarios,
      totalAsignado,
      saldoPendiente,
      saldoRestanteOrdinarios,
    };
  }, [beneficiariosAsignados, beneficiariosDisponibles, resumen]);

  const handleCalcular = async () => {
    if (!socioId) {
      toast.error("Seleccione un socio activo.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await calcularDesafiliacion(socioId, fechaSalida);

      if (!data) {
        toast.error("No se encontró el socio activo.");
        setResumen(null);
        return;
      }

      setResumen(data);
      toast.success("Cálculo de desafiliación actualizado.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo calcular.";
      setResumen(null);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    if (!resumen) {
      toast.error("Debe calcular la desafiliación antes de confirmar.");
      return;
    }

    if (motivoSalida === "EXPULSION" && !justificacionSalida.trim()) {
      toast.error("La justificación es obligatoria para expulsión.");
      return;
    }

    if (motivoSalida === "FALLECIMIENTO") {
      if (beneficiariosAsignados.length === 0) {
        toast.error("El socio no tiene beneficiarios asignados. No procede por fallecimiento.");
        return;
      }

      if (distribucionBeneficiarios.beneficiarios.length === 0) {
        toast.error("Debe marcar al menos un beneficiario disponible.");
        return;
      }

      if (distribucionBeneficiarios.saldoPendiente > 0) {
        toast.error("No puede quedar saldo sin distribuir.");
        return;
      }
    }

    setConfirming(true);
    setMessage("");

    const result = await desafiliarSocio({
      socioId: resumen.idSocio,
      fechaSalida,
      motivoSalida,
      justificacionSalida,
      observacion,
      beneficiarios:
        motivoSalida === "FALLECIMIENTO"
          ? distribucionBeneficiarios.beneficiarios
          : undefined,
    });

    setConfirming(false);
    setMessage(result.message);

    if (result.success) {
      toast.success(result.message);
      const data = await getSociosActivosParaDesafiliar();
      setSocios(data);
      setResumen(null);
      setSocioId(0);
      setBeneficiariosAsignados([]);
      setBeneficiariosDisponibles([]);
    } else {
      toast.error(result.message);
    }
  };

  if (autorizado === null) {
    return <div className="p-4">Validando permisos...</div>;
  }

  if (!autorizado) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Desafiliar socio
        </h1>
        <p className="mt-4 rounded bg-red-100 p-4 text-red-800">
          Solo usuarios de Junta Directiva pueden desafiliar socios.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Desafiliar socio
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-200">
          La operación inactiva al socio, registra trazabilidad e impide su uso
          en procesos operativos.
        </p>
      </div>

      <section className="rounded border border-gray-200 bg-white p-4 shadow dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-900 dark:text-white">
            Socio activo
            <select
              className="rounded border border-gray-300 p-2 text-gray-900"
              value={socioId}
              onChange={(event) => {
                setSocioId(Number(event.target.value));
                setResumen(null);
              }}
            >
              <option value={0}>Seleccione...</option>
              {socios.map((socio) => (
                <option key={socio.idSocio} value={socio.idSocio}>
                  {socio.cedula} - {socio.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-900 dark:text-white">
            Fecha de salida
            <input
              type="date"
              className="rounded border border-gray-300 p-2 text-gray-900"
              value={fechaSalida}
              onChange={(event) => {
                setFechaSalida(event.target.value);
                setResumen(null);
              }}
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              className="w-full rounded bg-blue-700 px-4 py-2 font-semibold text-white disabled:bg-gray-400"
              disabled={loading}
              onClick={handleCalcular}
            >
              {loading ? "Calculando..." : "Calcular"}
            </button>
          </div>
        </div>
      </section>

      {resumen && (
        <>
          <section className="grid gap-3 md:grid-cols-4">
            <Metric title="Ahorros acumulados" value={resumen.montoAcciones} />
            <Metric title="Dividendos a cancelar" value={resumen.montoDividendos} />
            <Metric
              title="Créditos pendientes"
              value={resumen.montoCreditosPendientes}
            />
            <Metric title="Saldo a pagar" value={resumen.saldoPagado} />
          </section>

          <section className="rounded border border-gray-200 bg-white p-4 shadow dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Préstamos e incobrables
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-700 dark:text-gray-200">
                    <th className="p-2">Préstamo</th>
                    <th className="p-2">Capital</th>
                    <th className="p-2">Interés ordinario</th>
                    <th className="p-2">Interés moratorio</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.prestamos.map((prestamo) => (
                    <tr key={prestamo.idPrestamo} className="border-b">
                      <td className="p-2">#{prestamo.idPrestamo}</td>
                      <td className="p-2">{currency.format(prestamo.saldoCapital)}</td>
                      <td className="p-2">
                        {currency.format(prestamo.interesOrdinario)}
                      </td>
                      <td className="p-2">
                        {currency.format(prestamo.interesMoratorio)}
                      </td>
                      <td className="p-2 font-semibold">
                        {currency.format(prestamo.montoPendiente)}
                      </td>
                    </tr>
                  ))}
                  {resumen.prestamos.length === 0 && (
                    <tr>
                      <td className="p-2" colSpan={5}>
                        El socio no tiene préstamos pendientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">
              Saldo incobrable estimado: {currency.format(resumen.saldoIncobrable)}
            </p>
          </section>

          <section className="rounded border border-gray-200 bg-white p-4 shadow dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Datos de salida
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-900 dark:text-white">
                Motivo
                <select
                  className="rounded border border-gray-300 p-2 text-gray-900"
                  value={motivoSalida}
                  onChange={(event) =>
                    setMotivoSalida(event.target.value as MotivoSalidaOption)
                  }
                >
                  <option value="RENUNCIA">Renuncia</option>
                  <option value="EXPULSION">Expulsión</option>
                  <option value="FALLECIMIENTO">Fallecimiento</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-gray-900 dark:text-white">
                Observación
                <input
                  className="rounded border border-gray-300 p-2 text-gray-900"
                  value={observacion}
                  onChange={(event) => setObservacion(event.target.value)}
                />
              </label>
            </div>

            {motivoSalida === "EXPULSION" && (
              <label className="mt-4 flex flex-col gap-1 text-sm font-medium text-gray-900 dark:text-white">
                Justificación obligatoria
                <textarea
                  className="rounded border border-gray-300 p-2 text-gray-900"
                  value={justificacionSalida}
                  onChange={(event) => setJustificacionSalida(event.target.value)}
                />
              </label>
            )}

            {motivoSalida === "FALLECIMIENTO" && (
              <BeneficiariosFallecimiento
                beneficiarios={beneficiariosAsignados}
                selectedIds={beneficiariosDisponibles}
                onToggle={(id) =>
                  setBeneficiariosDisponibles((current) =>
                    current.includes(id)
                      ? current.filter((item) => item !== id)
                      : [...current, id]
                  )
                }
                saldoPagado={resumen.saldoPagado}
                totalAsignado={distribucionBeneficiarios.totalAsignado}
                saldoPendiente={distribucionBeneficiarios.saldoPendiente}
                saldoRestanteOrdinarios={distribucionBeneficiarios.saldoRestanteOrdinarios}
              />
            )}
          </section>

          <section className="rounded border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
            El comprobante de Carbone queda preparado, pero su generación está
            bloqueada hasta configurar el `REPORT_ID`.
          </section>

          {message && (
            <section className="rounded border border-gray-200 bg-white p-4 text-gray-900 shadow">
              {message}
            </section>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded bg-red-700 px-6 py-2 font-semibold text-white disabled:bg-gray-400"
              disabled={confirming}
              onClick={handleConfirmar}
            >
              {confirming ? "Confirmando..." : "Confirmar desafiliación"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow dark:bg-gray-900">
      <p className="text-sm text-gray-600 dark:text-gray-200">{title}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">
        {currency.format(value)}
      </p>
    </div>
  );
}

function BeneficiariosFallecimiento({
  beneficiarios,
  selectedIds,
  onToggle,
  saldoPagado,
  totalAsignado,
  saldoPendiente,
  saldoRestanteOrdinarios,
}: {
  beneficiarios: SocioBeneficiarioOutput[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  saldoPagado: number;
  totalAsignado: number;
  saldoPendiente: number;
  saldoRestanteOrdinarios: number;
}) {
  const ordinarios = beneficiarios.filter(
    (beneficiario) => beneficiario.tipoBeneficiario === "ORDINARIO"
  );
  const contingentes = beneficiarios.filter(
    (beneficiario) => beneficiario.tipoBeneficiario === "CONTINGENTE"
  );

  if (beneficiarios.length === 0) {
    return (
      <div className="mt-4 rounded border border-red-300 bg-red-50 p-4 text-red-800">
        El socio no tiene beneficiarios asignados. No procede la desafiliación por fallecimiento.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <p className="text-sm text-gray-700 dark:text-gray-200">
        Marque los beneficiarios disponibles. Primero se distribuye entre ordinarios; si queda saldo, se puede cubrir con contingentes.
      </p>

      <BeneficiarioDisponibilidadGroup
        title="Beneficiarios Ordinarios"
        beneficiarios={ordinarios}
        selectedIds={selectedIds}
        baseMonto={saldoPagado}
        onToggle={onToggle}
      />

      <BeneficiarioDisponibilidadGroup
        title="Beneficiarios Contingentes"
        beneficiarios={contingentes}
        selectedIds={selectedIds}
        baseMonto={saldoRestanteOrdinarios}
        onToggle={onToggle}
      />

      <div className="rounded bg-gray-100 p-3 text-sm text-gray-900">
        <p>Saldo a distribuir: {currency.format(saldoPagado)}</p>
        <p>Total asignado: {currency.format(totalAsignado)}</p>
        <p className={saldoPendiente === 0 ? "font-semibold text-green-700" : "font-semibold text-red-700"}>
          Saldo pendiente: {currency.format(saldoPendiente)}
        </p>
      </div>
    </div>
  );
}

function BeneficiarioDisponibilidadGroup({
  title,
  beneficiarios,
  selectedIds,
  baseMonto,
  onToggle,
}: {
  title: string;
  beneficiarios: SocioBeneficiarioOutput[];
  selectedIds: number[];
  baseMonto: number;
  onToggle: (id: number) => void;
}) {
  return (
    <section className="rounded border border-gray-200 p-3">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="border-b text-left text-gray-700 dark:text-gray-200">
              <th className="p-2">Disponible</th>
              <th className="p-2">Cédula</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Parentesco</th>
              <th className="p-2">%</th>
              <th className="p-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            {beneficiarios.map((beneficiario) => {
              const selected = selectedIds.includes(beneficiario.idBeneficiario);
              const monto = selected
                ? Math.round(baseMonto * (beneficiario.porcentajeBeneficio / 100) * 100) / 100
                : 0;

              return (
                <tr key={beneficiario.idBeneficiario} className="border-b">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggle(beneficiario.idBeneficiario)}
                    />
                  </td>
                  <td className="p-2">{beneficiario.cedula}</td>
                  <td className="p-2">{beneficiario.nombreCompleto}</td>
                  <td className="p-2">{beneficiario.parentesco}</td>
                  <td className="p-2">{beneficiario.porcentajeBeneficio}%</td>
                  <td className="p-2">{currency.format(monto)}</td>
                </tr>
              );
            })}
            {beneficiarios.length === 0 && (
              <tr>
                <td className="p-2 text-gray-600 dark:text-gray-200" colSpan={6}>
                  No hay beneficiarios de este tipo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

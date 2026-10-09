"use client";

import {
  getBeneficiariosBySocioId,
  guardarBeneficiariosSocio,
  puedeAdministrarBeneficiarios,
} from "@/app/api/beneficiarios/actions";
import type {
  SocioBeneficiarioInput,
  SocioBeneficiarioOutput,
} from "@/app/api/beneficiarios/actions";
import { getSocios } from "@/app/api/socio/actions";
import { Socio } from "@/types/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type TipoBeneficiarioUI = "ORDINARIO" | "CONTINGENTE";

const PARENTESCOS = [
  "Cónyuge",
  "Hijo/a",
  "Padre",
  "Madre",
  "Hermano/a",
  "Abuelo/a",
  "Nieto/a",
  "Tío/a",
  "Sobrino/a",
  "Primo/a",
  "Otro",
];

const blankBeneficiario = (
  socioId: number,
  tipoBeneficiario: TipoBeneficiarioUI,
  porcentajeBeneficio: number
): SocioBeneficiarioInput => ({
  socioId,
  cedula: "",
  nombreCompleto: "",
  parentesco: "",
  tipoBeneficiario,
  porcentajeBeneficio,
});

const sumByType = (
  beneficiarios: SocioBeneficiarioInput[],
  tipoBeneficiario: TipoBeneficiarioUI
) =>
  Math.round(
    beneficiarios
      .filter((beneficiario) => beneficiario.tipoBeneficiario === tipoBeneficiario)
      .reduce((sum, beneficiario) => sum + Number(beneficiario.porcentajeBeneficio), 0) * 100
  ) / 100;

export default function BeneficiariosSocioPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [socioId, setSocioId] = useState(0);
  const [beneficiarios, setBeneficiarios] = useState<SocioBeneficiarioInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const puede = await puedeAdministrarBeneficiarios();
      setAutorizado(puede);

      if (!puede) return;

      const data = await getSocios();
      setSocios(data);
    };

    init();
  }, []);

  const totalOrdinarios = useMemo(
    () => sumByType(beneficiarios, "ORDINARIO"),
    [beneficiarios]
  );
  const totalContingentes = useMemo(
    () => sumByType(beneficiarios, "CONTINGENTE"),
    [beneficiarios]
  );

  const loadBeneficiarios = async (id: number) => {
    if (!id) {
      setBeneficiarios([]);
      return;
    }

    setLoading(true);
    const data = await getBeneficiariosBySocioId(id);
    setBeneficiarios(
      data.map((beneficiario: SocioBeneficiarioOutput) => ({
        idBeneficiario: beneficiario.idBeneficiario,
        socioId: beneficiario.socioId,
        cedula: beneficiario.cedula,
        nombreCompleto: beneficiario.nombreCompleto,
        parentesco: beneficiario.parentesco,
        tipoBeneficiario: beneficiario.tipoBeneficiario,
        porcentajeBeneficio: beneficiario.porcentajeBeneficio,
      }))
    );
    setLoading(false);
  };

  const handleSocioChange = async (id: number) => {
    setSocioId(id);
    await loadBeneficiarios(id);
  };

  const addBeneficiario = (tipoBeneficiario: TipoBeneficiarioUI) => {
    if (!socioId) {
      toast.error("Seleccione un socio antes de agregar beneficiarios.");
      return;
    }

    const countTipo = beneficiarios.filter(
      (beneficiario) => beneficiario.tipoBeneficiario === tipoBeneficiario
    ).length;

    setBeneficiarios((current) => [
      ...current,
      blankBeneficiario(socioId, tipoBeneficiario, countTipo === 0 ? 100 : 0.01),
    ]);
  };

  const updateBeneficiario = (
    index: number,
    field: keyof SocioBeneficiarioInput,
    value: string
  ) => {
    setBeneficiarios((current) =>
      current.map((beneficiario, itemIndex) =>
        itemIndex === index
          ? {
              ...beneficiario,
              [field]: field === "porcentajeBeneficio" ? Number(value) : value,
            }
          : beneficiario
      )
    );
  };

  const removeBeneficiario = (index: number) => {
    setBeneficiarios((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const validateBeforeSave = () => {
    if (!socioId) return "Seleccione un socio.";
    if (beneficiarios.length === 0) return "Debe registrar uno o más beneficiarios.";

    for (const tipo of ["ORDINARIO", "CONTINGENTE"] as TipoBeneficiarioUI[]) {
      const beneficiariosTipo = beneficiarios.filter(
        (beneficiario) => beneficiario.tipoBeneficiario === tipo
      );

      if (beneficiariosTipo.length === 0) continue;

      const total = sumByType(beneficiarios, tipo);

      if (total !== 100) {
        return `Los beneficiarios ${tipo.toLowerCase()} deben sumar exactamente 100%. Actualmente suman ${total}%.`;
      }

      const seen = new Set<string>();

      for (const beneficiario of beneficiariosTipo) {
        if (!beneficiario.cedula.trim()) return "Todos los beneficiarios deben tener cédula.";
        if (!beneficiario.nombreCompleto.trim()) return "Todos los beneficiarios deben tener nombre completo.";
        if (!beneficiario.parentesco.trim()) return "Todos los beneficiarios deben tener parentesco.";
        if (Number(beneficiario.porcentajeBeneficio) <= 0) {
          return "Todos los porcentajes deben ser mayores que 0%.";
        }

        const key = beneficiario.cedula.trim().toLowerCase();
        if (seen.has(key)) {
          return `La cédula ${beneficiario.cedula} está repetida en beneficiarios ${tipo.toLowerCase()}.`;
        }
        seen.add(key);
      }
    }

    return "";
  };

  const handleSave = async () => {
    const error = validateBeforeSave();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    const result = await guardarBeneficiariosSocio(socioId, beneficiarios);
    setSaving(false);

    if (result.success) {
      toast.success(result.message);
      setBeneficiarios(result.data ?? []);
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
          Asignación de Beneficiarios
        </h1>
        <p className="mt-4 rounded bg-red-100 p-4 text-red-800">
          Solo usuarios de Junta Directiva pueden administrar beneficiarios.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Asignación de Beneficiarios
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-200">
          Administre beneficiarios ordinarios y contingentes por socio. Cada grupo debe sumar exactamente 100%.
        </p>
      </div>

      <section className="rounded border border-gray-200 bg-white p-4 shadow dark:bg-gray-900">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-900 dark:text-white md:w-1/2">
          Socio activo
          <select
            className="rounded border border-gray-300 p-2 text-gray-900"
            value={socioId}
            onChange={(event) => handleSocioChange(Number(event.target.value))}
          >
            <option value={0}>Seleccione...</option>
            {socios.map((socio) => (
              <option key={socio.idSocio} value={socio.idSocio}>
                {socio.cedula} - {socio.nombre}
              </option>
            ))}
          </select>
        </label>
      </section>

      {socioId > 0 && (
        <>
          {loading ? (
            <div className="rounded bg-white p-4 text-gray-900 shadow">Cargando beneficiarios...</div>
          ) : (
            <>
              <BeneficiarioGroup
                title="Beneficiarios Ordinarios"
                tipo="ORDINARIO"
                beneficiarios={beneficiarios}
                total={totalOrdinarios}
                onAdd={() => addBeneficiario("ORDINARIO")}
                onUpdate={updateBeneficiario}
                onRemove={removeBeneficiario}
              />

              <BeneficiarioGroup
                title="Beneficiarios Contingentes"
                tipo="CONTINGENTE"
                beneficiarios={beneficiarios}
                total={totalContingentes}
                onAdd={() => addBeneficiario("CONTINGENTE")}
                onUpdate={updateBeneficiario}
                onRemove={removeBeneficiario}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded bg-blue-700 px-6 py-2 font-semibold text-white disabled:bg-gray-400"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Guardando..." : "Guardar beneficiarios"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function BeneficiarioGroup({
  title,
  tipo,
  beneficiarios,
  total,
  onAdd,
  onUpdate,
  onRemove,
}: {
  title: string;
  tipo: TipoBeneficiarioUI;
  beneficiarios: SocioBeneficiarioInput[];
  total: number;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof SocioBeneficiarioInput, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const rows = beneficiarios
    .map((beneficiario, index) => ({ beneficiario, index }))
    .filter(({ beneficiario }) => beneficiario.tipoBeneficiario === tipo);

  const totalClass = total === 100 ? "text-green-700" : "text-red-700";

  return (
    <section className="rounded border border-gray-200 bg-white p-4 shadow dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className={`text-sm font-semibold ${totalClass}`}>
            Total: {total}% {rows.length > 0 && total !== 100 ? "(debe ser 100%)" : ""}
          </p>
        </div>
        <button
          type="button"
          className="rounded bg-gray-800 px-3 py-2 text-sm text-white"
          onClick={onAdd}
        >
          Agregar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="border-b text-left text-gray-700 dark:text-gray-200">
              <th className="p-2">Cédula</th>
              <th className="p-2">Nombre completo</th>
              <th className="p-2">Parentesco</th>
              <th className="p-2">Porcentaje</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ beneficiario, index }) => (
              <tr key={`${tipo}-${index}`} className="border-b">
                <td className="p-2">
                  <input
                    className="w-full rounded border border-gray-300 p-2 text-gray-900"
                    value={beneficiario.cedula}
                    onChange={(event) => onUpdate(index, "cedula", event.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="w-full rounded border border-gray-300 p-2 text-gray-900"
                    value={beneficiario.nombreCompleto}
                    onChange={(event) => onUpdate(index, "nombreCompleto", event.target.value)}
                  />
                </td>
                <td className="p-2">
                  <select
                    className="w-full rounded border border-gray-300 p-2 text-gray-900"
                    value={beneficiario.parentesco}
                    onChange={(event) => onUpdate(index, "parentesco", event.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    {PARENTESCOS.map((parentesco) => (
                      <option key={parentesco} value={parentesco}>
                        {parentesco}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0.01}
                    max={100}
                    step="0.01"
                    className="w-full rounded border border-gray-300 p-2 text-gray-900"
                    value={beneficiario.porcentajeBeneficio}
                    onChange={(event) => onUpdate(index, "porcentajeBeneficio", event.target.value)}
                  />
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    className="rounded bg-red-700 px-3 py-2 text-white"
                    onClick={() => onRemove(index)}
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-2 text-gray-600 dark:text-gray-200" colSpan={5}>
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

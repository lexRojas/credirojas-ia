"use client";

import { deleteAuxiliar, getAuxiliares, saveAuxiliar, updateAuxiliar } from "@/app/api/auxiliar/actions";
import { todayCR } from "@/lib/date";
import { useEffect, useState } from "react";

interface AuxiliarContableForm {
    index?: number;
    idAuxiliar?: number;
    fecha: string;            // String (YYYY-MM-DD)
    tipoMovimiento: number;   // 1 | -1
    monto: number | "";       // number para validación; "" permite limpiar el input
    nota: string;
}

type FormErrors = Partial<Record<keyof AuxiliarContableForm, string>>;

export default function Page() {



    const [isEditing, setIsEditing] = useState(false)
    const [data, SetData] = useState<AuxiliarContableForm[]>([])
    const [loading, setLoading] = useState(false)





    const [form, setForm] = useState<AuxiliarContableForm>({
        fecha: todayCR(),
        tipoMovimiento: 1,
        monto: "",
        nota: "",
    });


    const [errors, setErrors] = useState<FormErrors>({});



    //cargan los datos iniciales 
    useEffect(() => {

        setLoading(true)
        const loadData = async () => {
            try {
                const data = await getAuxiliares()
                SetData(data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        loadData()


        return () => {
        }
    }, [])






    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validateField = (field: keyof AuxiliarContableForm, value: any): string => {
        switch (field) {
            case "fecha":
                if (!value) return "La fecha es obligatoria.";
                // Validar formato simple YYYY-MM-DD
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Formato de fecha inválido (YYYY-MM-DD).";
                return "";
            case "tipoMovimiento":
                if (![1, -1].includes(Number(value))) return "Elija Entrada (1) o Salida (-1).";
                return "";
            case "monto":
                if (value === "" || value === null) return "El monto es obligatorio.";
                if (isNaN(Number(value))) return "El monto debe ser numérico.";
                if (Number(value) < 0) return "El monto no puede ser negativo.";
                return "";
            case "nota":
                if (!String(value).trim()) return "La razón de ajuste es obligatoria.";
                if (String(value).length > 250) return "Máximo 250 caracteres.";
                return "";
            default:
                return "";
        }
    };

    const validateForm = (data: AuxiliarContableForm): FormErrors => {
        const next: FormErrors = {};
        (Object.keys(data) as (keyof AuxiliarContableForm)[]).forEach((k) => {
            const msg = validateField(k, data[k]);
            if (msg) next[k] = msg;
        });
        return next;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target as HTMLInputElement & HTMLSelectElement;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let newValue: any = value;

        // Parseo por campo
        if (name === "monto") {
            newValue = value === "" ? "" : Number(value);
        } else if (name === "tipoMovimiento") {
            newValue = Number(value);
        }

        setForm((prev) => ({ ...prev, [name]: newValue }));

        // Limpia error del campo al escribir
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const msg = validateField(name as keyof AuxiliarContableForm, value);
        if (msg) {
            setErrors((prev) => ({ ...prev, [name]: msg }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextErrors = validateForm(form);
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length === 0) {
            // Aquí harías tu POST/acción del servidor
            // Por ejemplo: await createAuxiliarContable(form);

            const data = await saveAuxiliar({
                fecha: form.fecha,
                tipoMovimiento: form.tipoMovimiento,
                monto: Number(form.monto),
                nota: form.nota,
            })

            if (data) {
                SetData(prev => [...prev, {
                    ...form,
                    idAuxiliar: data.idAuxiliar,
                    monto: Number(data.monto)
                }])
            }

            setIsEditing(false);

            // Opcional: reset
            setForm({ fecha: todayCR(), tipoMovimiento: 1, monto: 0, nota: "" });

        }
    };

    //seletedRow: lo que hace es fijar los valores del form con los valores de la fila seleccionada 
    const selecteRow = (item: AuxiliarContableForm, index: number) => {
        setForm({
            index: index,
            idAuxiliar: item.idAuxiliar,
            fecha: item.fecha,
            tipoMovimiento: item.tipoMovimiento,
            monto: item.monto,
            nota: item.nota,
        });
        setIsEditing(true);
    }

    const handleCancel = () => {
        setIsEditing(false);
        setForm({ fecha: todayCR(), tipoMovimiento: 1, monto: 0, nota: "" });
    }

    const handleDelete = () => {
        setIsEditing(false);

        if (!form.idAuxiliar) return;

        deleteAuxiliar(form.idAuxiliar)

        SetData(prev => prev.filter(item => item.idAuxiliar !== form.idAuxiliar))

        setForm({ fecha: todayCR(), tipoMovimiento: 1, monto: 0, nota: "" });

    }

    const handleModficar = async () => {
        setIsEditing(false);
        if (!form.idAuxiliar) return;


        const nextErrors = validateForm(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0) {

            const data = await updateAuxiliar({
                idAuxiliar: form.idAuxiliar,
                fecha: form.fecha,
                tipoMovimiento: form.tipoMovimiento,
                monto: Number(form.monto),
                nota: form.nota,

            })
            if (data) {
                SetData(prev => prev.map(item => {
                    if (item.idAuxiliar === form.idAuxiliar) {
                        return {
                            ...item,
                            ...form,
                            monto: Number(data.monto)
                        }
                    }
                    return item
                }))
            }

        }
    }

    return (
        <div className="container dark:bg-amber-100/90 pb-3 px-3.5 sm:max-w-4xl " >
            <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-5 sm:space-y-5 ">
                    <h1 className="pt-5 text-base/7 font-semibold text-gray-900">
                        Registro de Movimientos Auxiliares
                    </h1>

                    <div className="border-b border-gray-900/40 pb-12">
                        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-4 sm:grid-cols-6 sm:gap-x-4">
                            {/* Razón de ajuste (nota) */}
                            <div className="col-span-2 sm:col-span-4">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="nota">
                                    Razón de ajuste
                                </label>
                                <div className="mt-1">
                                    <div className={`flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 ${errors.nota ? "outline-red-500 focus-within:outline-red-500" : "focus-within:outline-indigo-600"}`}>
                                        <input
                                            id="nota"
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="text"
                                            name="nota"
                                            placeholder="Indique la razón del ajuste"
                                            value={form.nota}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={!!errors.nota}
                                            aria-describedby={errors.nota ? "nota-error" : undefined}
                                            required
                                        />
                                    </div>
                                    {errors.nota && (
                                        <p id="nota-error" className="text-red-600 text-sm/5 mt-1">
                                            {errors.nota}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Clase de movimiento (tipoMovimiento) */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="tipoMovimiento">
                                    Clase Movimiento
                                </label>
                                <div className="mt-1">
                                    <div className={`flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 ${errors.tipoMovimiento ? "outline-red-500 focus-within:outline-red-500" : "focus-within:outline-indigo-600"}`}>
                                        <select
                                            id="tipoMovimiento"
                                            className="block min-w-0 grow bg-white py-2 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            name="tipoMovimiento"
                                            value={form.tipoMovimiento}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={!!errors.tipoMovimiento}
                                            aria-describedby={errors.tipoMovimiento ? "tipoMovimiento-error" : undefined}
                                        >
                                            <option value={1}>Entrada</option>
                                            <option value={-1}>Salida</option>
                                        </select>
                                    </div>
                                    {errors.tipoMovimiento && (
                                        <p id="tipoMovimiento-error" className="text-red-600 text-sm/5 mt-1">
                                            {errors.tipoMovimiento}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Monto */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto">
                                    Monto
                                </label>
                                <div className="mt-1">
                                    <div className={`flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 ${errors.monto ? "outline-red-500 focus-within:outline-red-500" : "focus-within:outline-indigo-600"}`}>
                                        <input
                                            id="monto"
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="number"
                                            name="monto"
                                            min={0}
                                            value={form.monto}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={!!errors.monto}
                                            aria-describedby={errors.monto ? "monto-error" : undefined}
                                            required
                                        />
                                    </div>
                                    {errors.monto && (
                                        <p id="monto-error" className="text-red-600 text-sm/5 mt-1">
                                            {errors.monto}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Fecha */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="fecha">
                                    Fecha
                                </label>
                                <div className="mt-1">
                                    <div className={`flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 ${errors.fecha ? "outline-red-500 focus-within:outline-red-500" : "focus-within:outline-indigo-600"}`}>
                                        <input
                                            id="fecha"
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="date"
                                            name="fecha"
                                            value={form.fecha}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={!!errors.fecha}
                                            aria-describedby={errors.fecha ? "fecha-error" : undefined}
                                            required
                                        />
                                    </div>
                                    {errors.fecha && (
                                        <p id="fecha-error" className="text-red-600 text-sm/5 mt-1">
                                            {errors.fecha}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="col-start-1 col-span-2 sm:col-span-6 mt-3 flex flex-col sm:flex-row align-baseline sm:justify-end gap-x-3 gap-y-3">
                                <button
                                    className="rounded-md disabled:bg-gray-500 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    type="submit"
                                    disabled={isEditing}
                                >
                                    Agregar
                                </button>

                                <button
                                    className="rounded-md disabled:bg-gray-500 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    type="button"
                                    disabled={!isEditing}
                                    onClick={() => handleModficar()}
                                >
                                    Modificar
                                </button>

                                <button
                                    className="rounded-md disabled:bg-gray-500 bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                    type="button"
                                    disabled={!isEditing}
                                    onClick={() => handleDelete()}
                                >
                                    Eliminar
                                </button>
                                <button
                                    className="rounded-md disabled:bg-gray-500 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                    type="button"
                                    disabled={!isEditing}
                                    onClick={() => handleCancel()}
                                >
                                    Cancelar
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* Tabla (placeholder) */}
                    {!loading && (
                        <div className="max-h-60 overflow-y-scroll">
                            <table className="table-auto w-full ">
                                <thead className="sticky -top-0 uppercase bg-[#6b7280] text-[#e5e7eb]">
                                    <tr>
                                        <th className="w-[80px] py-1 border border-gray-300 text-center font-bold p-4">
                                            ID
                                        </th>
                                        <th className="py-1 border border-gray-300 text-center font-bold p-4">
                                            FECHA
                                        </th>
                                        <th className="py-1 border border-gray-300 text-center font-bold p-4">
                                            RAZON
                                        </th>
                                        <th className="py-1 border border-gray-300 text-center font-bold p-4">
                                            CLASE MOV
                                        </th>
                                        <th className="hidden sm:table-cell py-1 border border-gray-300 text-center font-bold p-4">
                                            MONTO
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white text-gray-500 ">
                                    {data && data.map((item, index) => (
                                        <tr
                                            className="[&_td]:border [&_td]:border-gray-300   hover:bg-gray-400"
                                            key={index}
                                            onClick={() => selecteRow(item, index)}
                                        >
                                            <td className="text-center">{index + 1}</td>
                                            <td className=" text-center">{item.fecha}</td>
                                            <td className=" pl-2">{item.nota}  </td>
                                            <td className="text-center">{item.tipoMovimiento === 1 ? 'Entrada' : 'Salida'}</td>
                                            <td className="text-right pr-3">{item.monto.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</td>

                                        </tr>
                                    ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </form>
        </div >
    );
}

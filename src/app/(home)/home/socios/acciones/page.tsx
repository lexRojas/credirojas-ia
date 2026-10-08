'use client'

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Socio } from "@/types/types";
import { getSocios } from "@/app/api/socio/actions";
import { getVariableValue } from "@/app/api/variables/actions";
import { saveAccion } from "@/app/api/acciones/actions";
import ProgressBar from "@/components/ProgressBar";
import { parseDateOnly, todayCR } from "@/lib/date";


interface socioTemplateList {
    selected: boolean;
    idSocio: number;
    nombre: string;
    cedula: string;
    acciones: number;
}


export default function AccionForm() {

    const navegate = useRouter()


    // Estado para almacenar los datos del formulario
    const blankForm = {
        fecha: "",
        cantidadAcciones: 1,
        periodo: 0,
        mes: 0,
        monto_colones: 0,
        pesoMultiplicador: 0,
    }


    const [multiplicador, setMultiplicador] = useState(0);
    const [montoAccion, setMontoAccion] = useState(0)
    const [formData, setFormData] = useState(blankForm);
    const [dataSocio, setDataSocio] = useState<socioTemplateList[]>([]);
    const [cantidadSociosTotal, setCantidadSociosTotal] = useState(0);
    const [cantidadSociosSeleccionados, setCantidadSociosSeleccionados] = useState(0);
    const [valorAvance, setValorAvance] = useState(0);
    const [valorFinal, setValorFinal] = useState(1);

    //cargar variables
    useEffect(() => {

        const fetchVariables = async () => {
            try {
                const variableMultiplicador = await getVariableValue(1)
                setMultiplicador(variableMultiplicador.valor)

                const variableMontoAccion = await getVariableValue(4)
                setMontoAccion(variableMontoAccion.valor)

                setFormData((prevFormData) => ({
                    ...prevFormData,
                    pesoMultiplicador: variableMultiplicador.valor,
                    monto_colones: variableMontoAccion.valor
                }));

            } catch (error) {
                console.log(error)
            }
        }
        fetchVariables()

    }, [])

    //carga los socios
    useEffect(() => {

        const fetchSocios = async () => {
            try {
                const socios = await getSocios()


                const socioList: socioTemplateList[] = socios.map((socio: Socio) => ({
                    selected: false,
                    idSocio: socio.idSocio,
                    nombre: socio.nombre,
                    cedula: socio.cedula!,
                    acciones: 0,
                }))

                setDataSocio(socioList)

                const totalSocios = socios.length;
                setCantidadSociosTotal(totalSocios);


            } catch (error) {
                console.log(error)
            }
        }
        fetchSocios()
    }, [])

    // Establecer la fecha actual en el estado 'fecha' al cargar el componente
    useEffect(() => {
        const today = todayCR();
        const todayDate = parseDateOnly(today);
        const year = todayDate.getFullYear();
        const mes = todayDate.getMonth() + 1;


        setFormData((prevFormData) => ({
            ...prevFormData,
            fecha: today,
            periodo: year,
            mes: mes
        }));
    }, []);

    //actualiza la cantidad de socios seleccionados 
    useEffect(() => {
        const selectedCount = dataSocio.filter((socio) => socio.selected).length;
        setCantidadSociosSeleccionados(selectedCount);
    }, [dataSocio]);



    // Función para manejar cambios en los campos del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let montoTotal = 0;

        if (name === "cantidadAcciones") {
            montoTotal = Number(value) * montoAccion;
        }


        setFormData({
            ...formData,
            [name]: value,
            monto_colones: name === "cantidadAcciones" ? montoTotal : 0
        });

    };


    const cancelarClick = () => {
        navegate.push("/home")
    }

    // Función para manejar el cambio en el checkbox
    const handleCheckboxChange = (idSocio: number) => {
        // Actualizar el estado de los socios
        const updatedSocios = dataSocio.map((socio) =>
            socio.idSocio === idSocio
                ? { ...socio, selected: !socio.selected, acciones: socio.selected ? 0 : formData.cantidadAcciones } // Cambia el valor de selected
                : socio
        );
        setDataSocio(updatedSocios); // Establecer los datos actualizados
    };


    const selectedAllClick = () => {
        // Actualizar el estado de los socios
        const updatedSocios = dataSocio.map((socio) => ({
            ...socio,
            selected: true, // Cambia el valor de
            acciones: formData.cantidadAcciones
        }))
        setDataSocio(updatedSocios); // Establecer los datos actualizados
    }

    const clearAllClick = () => {
        // Actualizar el estado de los socios
        const updatedSocios = dataSocio.map((socio) => ({
            ...socio,
            selected: false, // Cambia el valor de
            acciones: 0
        }))
        setDataSocio(updatedSocios); // Establecer los datos actualizados

    }

    const savedData = () => {

        try {
            const selectedSocios = dataSocio.filter((socio) => socio.selected);
            if (selectedSocios.length === 0) {
                toast.error("Debe seleccionar al menos un socio");
                return;
            } else {

                setValorFinal(selectedSocios.length)
                let valorAvance = 0;

                selectedSocios.forEach(async (socio) => {


                    const socioData = {
                        socioId: socio.idSocio,
                        fecha: formData.fecha,
                        cantidadAcciones: Number(socio.acciones),
                        periodo: formData.periodo.toString(),
                        mes: formData.mes.toString(),
                        monto_colones: socio.acciones * montoAccion,
                        pesoMultiplicador: formData.pesoMultiplicador,

                    }
                    await saveAccion(socioData)
                    valorAvance++
                    setValorAvance(valorAvance)




                })

            }
        } catch (error) {
            toast.error("Error al guardar los datos" + error)
        }

    }

    return (

        <div className="container dark:bg-amber-100/90  pb-3  px-3.5 sm:max-w-2xl ">

            <div className="space-y-5">
                <h1 className="pt-5 text-base/7 font-semibold text-gray-900">Registrar Acciones a los Socios</h1>

                {/* Grid Detalle de Accion */}
                <div className=" grid  grid-cols-3  sm:grid-cols-5 gap-x-6 gap-y-5 sm:gap-y-10 border p-3 border-gray-400">
                    <p className=" col-span-2 sm:col-span-5 text-left form-label ">Definir detalle de la acción</p>

                    {/*Fecha */}
                    <div className="col-span-3 sm:col-span-2">
                        <label className="block text-sm/6 font-medium text-gray-900" htmlFor="fecha">Fecha (Aplica)</label>
                        <div className="mt-1">
                            <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <input
                                    className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/*Cantidad */}
                    <div className="col-span-1">
                        <label className="block text-sm/6 font-medium text-gray-900" htmlFor="cantidad">Cantidad</label>
                        <div className="mt-1">
                            <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <input
                                    className="block min-w-0 grow text-center bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    type="number"
                                    name="cantidadAcciones"
                                    value={formData.cantidadAcciones}
                                    onChange={handleChange}
                                    min={0}
                                    max={5}
                                />
                            </div>
                        </div>
                    </div>

                    {/*Periodo */}
                    <div className="col-span-1">
                        <label className="block text-sm/6 font-medium text-gray-900" htmlFor="periodo">Periodo</label>
                        <div className="mt-1">
                            <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <input
                                    className="block min-w-0 grow text-center bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    type="number"
                                    name="periodo"
                                    value={formData.periodo}
                                    onChange={handleChange}
                                    min={2023}
                                    max={2050}
                                    pattern="[0-9]{4}"
                                    title="Solo números de 4 dígitos"
                                />
                            </div>
                        </div>
                    </div>

                    {/*Mes */}
                    <div className="col-span-1">
                        <label className="block text-sm/6 font-medium text-gray-900" htmlFor="mes">Mes</label>
                        <div className="mt-1">
                            <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <input
                                    className="block min-w-0 grow text-center bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    type="number"
                                    name="mes"
                                    value={formData.mes}
                                    onChange={handleChange}
                                    min={1}
                                    max={12}
                                />
                            </div>
                        </div>
                    </div>

                    {/*Monto x Accion */}
                    <div className=" col-span-3 sm:col-span-2">
                        <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto_colones">Monto x Accion</label>
                        <div className="mt-1">
                            <div className="flex items-center  bg-slate-400/30 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <input
                                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    type="text"
                                    name="monto_colones"
                                    value={montoAccion.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/*Total monto acciones */}
                    <div className="col-span-2">
                        <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto_colones">Total monto Acciones</label>
                        <div className="mt-1">
                            <div className="flex items-center  bg-slate-400/30 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <input
                                    className="block min-w-0 grow    py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    type="text"
                                    name="monto_colones"
                                    value={formData.monto_colones.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/*Multiplicador */}
                    <div className="col-span-1">
                        <label className="block text-sm/6 font-medium text-gray-900" htmlFor="pesoMultiplicador">Multiplicador</label>
                        <div className="mt-1">
                            <div className="flex items-center  bg-slate-400/30 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <input
                                    className="block min-w-0 grow  text-center py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    type="number"
                                    name="pesoMultiplicador"
                                    value={multiplicador}
                                    disabled
                                />
                            </div>
                        </div>

                    </div>

                </div> {/* fin grid detalle accion */}

                {/* Botón aplicar acciones */}
                <div className="mt-0 flex items-center justify-end gap-x-6 ">
                    <button
                        className="w-1/3 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={selectedAllClick} >
                        Aplicar todos
                    </button>

                    <button
                        className="w-1/3 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"

                        onClick={clearAllClick} >
                        Limpiar todos
                    </button>


                </div>
                <div className=" grid  grid-cols-4  gap-x-6 gap-y-0  border p-3 border-gray-400">

                    <div className="col-span-4 grid grid-cols-4 ">
                        <p className="form-label">Lista de Socios</p>
                        <p className="form-label col-start-3 col-span-2 text-end">Seleccionados: {cantidadSociosSeleccionados} de {cantidadSociosTotal}</p>
                    </div>


                    <div className="col-span-4 max-h-60 overflow-y-scroll">
                        <table className="table-auto w-full ">
                            <thead className="sticky -top-0 uppercase bg-[#6b7280] text-[#e5e7eb]" >
                                <tr>
                                    <th className="w-[80px] py-1 border  border-gray-300 text-center font-bold p-4" >Check</th>
                                    <th className="w-[150px] py-1 border  border-gray-300 text-center font-bold p-4">Cedula</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">Nombre</th>
                                    <th className="w-[100px] py-1 border  border-gray-300 text-center font-bold p-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-500 ">
                                {dataSocio && dataSocio.map((socio) => (
                                    <tr key={socio.idSocio} className="py-0   even:bg-slate-400/20" >
                                        <td className="py-0 border  border-gray-300 text-center  p-4">
                                            <input
                                                type="checkbox"
                                                checked={socio.selected} // Marca el checkbox si 'selected' es true
                                                onChange={() => handleCheckboxChange(socio.idSocio)} // Llama a la función de cambio
                                            />
                                        </td>

                                        <td className="py-0 border  border-gray-300 text-center  p-4">{socio.cedula}</td>
                                        <td className="py-0 border  border-gray-300 text-center  p-4">{socio.nombre}</td>
                                        <td className="py-0 border  border-gray-300 text-center  p-4">{socio.acciones}</td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                    </div>

                </div>

                <div className=" flex flex-col   gap-2 border-b p-3 border-b-gray-400">
                    <ProgressBar valorAvance={valorAvance} valorFinal={valorFinal} />
                </div>



                {/* Botón de Submit */}
                <div className="mt-3 flex items-center justify-end gap-x-6 ">
                    <button
                        className="w-1/3 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"

                        onClick={savedData} >
                        Guardar
                    </button>
                    <button
                        className="w-1/3 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"

                        onClick={cancelarClick} type="reset">
                        Cancelar
                    </button>

                </div>

            </div>
        </div>

    );
}


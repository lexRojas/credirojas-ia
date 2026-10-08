'use client'

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getVistaSaldoPrestamosBySocioId } from "@/app/api/prestamo/actions";
import ModalBrowse from "@/components/ModalBrowse";
import { getSocios } from "@/app/api/socio/actions";
import { Pagos, saldo_prestamos, Socio } from "@/types/types";
import { deletePago, getPagosByPrestamoId, savePago } from "@/app/api/abonos/actions";
// import { pagos_tipoCuota } from "@prisma/client";
import { calcularProximaCuota } from "@/lib/calculos";
import { TipoCuota } from "@prisma/client";


interface proximaCuotaDetail {
    montoCuotaCapital: number;
    interesOrdinario: number;
    interesMoratorio: number;
    monto: number;
    diasAtraso: number;
    prestamoId: number;
    socioId: number;
}



export default function PrestamoForm() {

    // Estado para almacenar los datos del formulario
    const socioTemplate = {
        socioId: 0,
        cedula: "",
        nombre: "...",
    }


    const blankForm = {
        idPagos: 0,
        prestamoId: 0,
        socioId: 0,
        fechaProyectada: new Date().toLocaleDateString("en-CA"),
        fechaReal: new Date().toLocaleDateString("en-CA"),
        diasAtraso: 0,
        monto: 0,
        montoCuotaCapital: 0,
        interesOrdinario: 0,
        interesMoratorio: 0,
        tipoCuota: "ORDINARIA",
    }


    const [formData, setFormData] = useState(blankForm);
    const [socioData, setSocioData] = useState<Socio[]>()
    const [socioForm, setSocioForm] = useState(socioTemplate)
    const [dataPrestamos, setDataPrestamos] = useState<saldo_prestamos[]>()
    const [editing, setEditing] = useState(false)
    const [currentPrestamo, setCurrentPrestamo] = useState<saldo_prestamos>()
    const [dataPagos, setDataPagos] = useState<Pagos[]>()
    const [error, setError] = useState<Record<string, string>>({})
    const [isError, setIsError] = useState(false)


    const saldoAnteriorPrestamo = useRef(-1)

    // carga socios para el browse
    useEffect(() => {
        const fetchSocio = async () => {
            try {
                const socio = await getSocios();
                setSocioData(socio);

            } catch (error) {
                console.log(error);
            } finally {

            }
        };

        fetchSocio()

    }, [])


    // Función para manejar cambios en los campos del formulario
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Copia del estado anterior
        const newFormData = { ...formData };

        if (name === "monto") {
            const montoNum = Number(value);


            // Calculamos el nuevo monto de capital
            const nuevoMontoCapital = montoNum - formData.interesOrdinario - formData.interesMoratorio;

            const saldoEstimado = saldoAnteriorPrestamo.current - nuevoMontoCapital;
            console.log("saldo estimado:", saldoEstimado)
            // Validación de saldo
            if (saldoEstimado < 0) {
                setError({ monto: "Monto de abono (Capital) no puede ser mayor que el saldo" });
                setIsError(true)

            } else {
                if (montoNum < (formData.interesMoratorio + formData.interesOrdinario)) {
                    setError({ monto: "Monto de abono no puede ser menor que intereses" });
                    setIsError(true)

                } else {
                    setError({ monto: "" });
                    setIsError(false)
                }
            }

            // Actualizamos campos relacionados
            newFormData.montoCuotaCapital = nuevoMontoCapital;
            newFormData.monto = montoNum;
        }

        if (name === "fechaProyectada" || name === "fechaReal") {



            const fechaProyectada = name === "fechaProyectada" ? value : formData.fechaProyectada;
            const fechaReal = name === "fechaReal" ? value : formData.fechaReal;


            const res = await refrescarProximaCuota(currentPrestamo!, fechaProyectada, fechaReal)

            if (res) {
                newFormData.montoCuotaCapital = res.montoCuotaCapital;
                newFormData.interesOrdinario = res.interesOrdinario;
                newFormData.interesMoratorio = res.interesMoratorio;
                newFormData.monto = res.monto;
                newFormData.prestamoId = res.prestamoId;
                newFormData.socioId = res.socioId;
                newFormData.diasAtraso = res.diasAtraso ?? 0;

            }
        }



        // Actualización general del campo que cambió
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newFormData as any)[name] = type === "number" ? Number(value) : type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

        // Finalmente actualizamos el estado una sola vez
        setFormData(newFormData);
    };


    //***DEFINO VALORES DEL MODAL ************ */
    const [isModalOpen, setIsModalOpen] = useState(false);

    // columnas del modal 
    const columns = {
        cedula: 'Cédula',
        nombre: 'Nombre',
    };

    // campo de filtro del modal 
    const filterField = 'nombre'; // Filter by name

    // funcion call back cuando el modal es seleccionado 
    const modalCallBack = async (selectedItem: Socio | null) => {

        setIsModalOpen(false);
        if (selectedItem) {

            setSocioForm({
                ...socioForm,
                socioId: selectedItem.idSocio,
                cedula: selectedItem.cedula!,
                nombre: selectedItem.nombre,
            })

            setFormData({
                ...formData,
                socioId: selectedItem.idSocio,
            })

            const prestamosSocio = await getVistaSaldoPrestamosBySocioId(selectedItem.idSocio);
            if (prestamosSocio) {
                setDataPrestamos(prestamosSocio)
            } else {
                setDataPrestamos([])
            }

        }

    }

    // Funcion para abrir el modal 
    const callModal = () => {
        if (socioData!) {
            setIsModalOpen(true);
        }
    }



    const refrescarProximaCuota = async (prestamo: saldo_prestamos, fechaProyectada?: string, fechaReal?: string): Promise<proximaCuotaDetail | null> => {

        /** Calculo de proxima cuota */

        const res = await calcularProximaCuota({
            plazoTotal: prestamo.plazo,
            plazoRestante: prestamo.plazo - prestamo.pagos,
            porcentajeInteresOrdinario: 5,
            porcentajeInteresMoratorio: 5,
            saldoActual: prestamo.saldoCapital,
            fechaProyectadaPago: fechaProyectada ?? new Date().toLocaleDateString("en-CA"),
            fechaReal: fechaReal ?? new Date().toLocaleDateString("en-CA"),
            modeloInteres: "ALEMAN",
            fechaGenerada: prestamo.fecha

        })

        if (res)
            return ({
                montoCuotaCapital: res.montoAmortizacionCapital,
                interesOrdinario: res.montoInteresOrdinario,
                interesMoratorio: res.montoInteresMoratorio,
                monto: res.montoAmortizacionCapital + res.montoInteresOrdinario + res.montoInteresMoratorio,
                diasAtraso: res.diasAtraso ?? 0,
                prestamoId: prestamo.idPrestamo,
                socioId: prestamo.socioId,
            })


        return null

    }




    // Seleccion del prestamo a abonar  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const seleccionarPrestamo = async (prestamo: saldo_prestamos, index: number) => {

        setCurrentPrestamo(prestamo)
        saldoAnteriorPrestamo.current = prestamo.saldoCapital

        const res = await refrescarProximaCuota(prestamo, formData.fechaProyectada, formData.fechaReal)

        if (res) {
            setFormData({
                ...formData,
                montoCuotaCapital: res.montoCuotaCapital,
                interesOrdinario: res.interesOrdinario,
                interesMoratorio: res.interesMoratorio,
                monto: res.monto,
                diasAtraso: res.diasAtraso ?? 0,
                prestamoId: res.prestamoId,
                socioId: res.socioId,
            })
        }

        const pagos = await getPagosByPrestamoId(prestamo.idPrestamo)
        if (pagos)
            setDataPagos(pagos)
        else
            setDataPagos([])

        setEditing(true)
    }

    // aplicar el pago al prestamo seleccionado 
    const aplicarPago = async () => {
        try {


            const saldoEstimado = saldoAnteriorPrestamo.current - (formData.montoCuotaCapital)


            if (saldoEstimado < 0) {
                toast.error("Saldo no puede ser menor que cero")

                setError({ monto: "Saldo no puede ser menor que cero" })

                return
            } else {

                await savePago({
                    ...formData,
                    idPago: 0,
                    tipoCuota: "ORDINARIA" as TipoCuota,
                })


                const pagos = await getPagosByPrestamoId(formData.prestamoId)
                if (pagos) {
                    setDataPagos(pagos)

                    const newPrestamoData = dataPrestamos?.map(prestamo => {
                        if (prestamo.idPrestamo === currentPrestamo?.idPrestamo) {
                            const actualizado = {
                                ...prestamo,
                                pagos: prestamo.pagos + 1,
                                saldoCapital: prestamo.saldoCapital - formData.montoCuotaCapital,
                            }

                            setCurrentPrestamo(actualizado)
                            saldoAnteriorPrestamo.current = actualizado.saldoCapital

                            return actualizado
                        } else {
                            return prestamo
                        }
                    })
                    setDataPrestamos(newPrestamoData)
                }
                else {
                    setDataPagos([])
                    toast.success("Registrado correctamente")
                }
            }
        } catch (e) {
            toast.error("Error al registrar el pago --> " + e)
        }

    }

    // Eliminar el pago al prestamo seleccionado
    const eliminarAbono = async (idPago: number) => {
        try {
            const response = await deletePago(idPago)
            if (response) {

                const newDataPrestamos = await getVistaSaldoPrestamosBySocioId(formData.socioId)
                if (newDataPrestamos) {
                    setDataPrestamos(newDataPrestamos)
                }

                setDataPagos(dataPagos?.filter(pago => pago.idPago !== idPago))
                toast.success("Abono eliminado correctamente")


            } else {
                toast.error("Error al eliminar el abono")
            }
        } catch {
            toast.error("Error al eliminar el abono")
        }
    }

    return (
        <div className="container dark:bg-amber-100/90  pb-3 px-3.5 sm:max-w-4xl ">

            <div className="space-y-5 sm:space-y-5 ">
                <h1 className="pt-5 text-base/7 font-semibold text-gray-900">Registro de Abonos a Préstamos</h1>
                <div className="flex flex-col border-b border-gray-900/40 pb-12">


                    {/** ENCABEZADO DE FORMULARIO */}
                    <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-4 sm:grid-cols-6  sm:gap-x-4">
                        {/* Cedula */}
                        <div className="col-span-2 sm:col-span-1 ">
                            <label className="block text-sm/6 font-medium text-gray-900" htmlFor="cedula">Cédula</label>
                            <div className="mt-1">
                                <div className="grid grid-cols-1">
                                    <input
                                        type="number"
                                        name="cedula"
                                        value={socioForm.cedula}
                                        onChange={handleChange}
                                        className={`col-start-1 row-start-1 appearance-none  ${editing ? " bg-amber-950/10" : " bg-white"}  py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                                        required
                                        disabled={editing}
                                    />
                                    <svg
                                        onClick={callModal}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className=" col-start-1 row-start-1 mr-2 size-6 self-center justify-self-end  cursor-pointer  text-gray-500 sm:size-6">
                                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {/* Nombre */}
                        <div className="col-span-2 sm:col-span-3 ">
                            <div className="block text-sm/6 font-medium text-gray-900">Nombre</div>
                            <div className="mt-1">
                                <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                    {socioForm.nombre}
                                </div>
                            </div>
                        </div>

                        {/* Fecha Proyectada  */}
                        <div className="col-span-2 sm:col-span-2">
                            <label className="block text-sm/6 font-medium text-gray-900" htmlFor="motivo">Fecha Proyectada</label>
                            <div className="mt-1">
                                <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                    <input
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                        type="date"
                                        name="fechaProyectada"
                                        value={formData.fechaProyectada}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div> {/* Fin del grid */}


                    {/** TABLA DE PRESTAMOS */}
                    <div className=" mt-5 max-h-60 overflow-y-scroll">
                        <p>Detalle de préstamos</p>
                        <table className="table-auto w-full ">
                            <thead className="sticky -top-0 uppercase bg-[#6b7280] text-[#e5e7eb]" >
                                <tr>
                                    <th className="w-[80px] py-1 border  border-gray-300 text-center font-bold p-4" >ID</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">FECHA</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">MOTIVO</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">MONTO</th>
                                    <th className="hidden sm:table-cell py-1 border  border-gray-300 text-center font-bold p-4">PAGOS</th>
                                    <th className="hidden sm:table-cell py-1 border  border-gray-300 text-center font-bold p-4">SALDO</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-500 ">
                                {dataPrestamos && dataPrestamos.map((prestamo, index) => (
                                    <tr key={index}
                                        className={`py-0  ${currentPrestamo?.idPrestamo === prestamo.idPrestamo &&
                                            "bg-amber-400/50"}  hover:bg-amber-400/50 hover:cursor-pointer`}
                                        onClick={() => seleccionarPrestamo(prestamo, index)}
                                    >
                                        <td className="py-1 border  border-gray-300 text-center  p-4" >{prestamo.idPrestamo} </td>
                                        <td className="py-1 border  border-gray-300 text-center  p-4">{prestamo.fecha} </td>
                                        <td className="py-1 border  border-gray-300 text-left  p-4">{prestamo.motivo}  </td>
                                        <td className="py-1 border  border-gray-300 text-right  p-4"> {prestamo.monto.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}  </td>
                                        <td className="hidden sm:table-cell py-1 border  border-gray-300 text-center  p-4"> {prestamo.pagos} de {prestamo.plazo}  </td>
                                        <td className="py-1 border  border-gray-300 text-right  p-4"> {prestamo.saldoCapital.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}  </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                        <span
                            className="text-blue-900 text-sm/6 animate-pulse "
                        > Para que la cuota se actualice debe dar click al prestamo de su elección</span>
                    </div>


                    {/** DEFINICION DEL PAGO */}
                    <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-4 sm:grid-cols-6  sm:gap-x-4">
                        {/* Fecha Proyectada  */}
                        <div className="col-span-2 sm:col-span-2">
                            <label className="block text-sm/6 font-medium text-gray-900" htmlFor="fechaReal">Fecha Pago</label>
                            <div className="mt-1">
                                <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                    <input
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                        type="date"
                                        name="fechaReal"
                                        value={formData.fechaReal}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-2">
                            <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto">Monto Pago</label>
                            <div className="mt-1">
                                <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                    <input
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                        type="number"
                                        name="monto"
                                        value={formData.monto}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {error.monto && <span className="text-red-500 text-sm/6">
                                    {error.monto}</span>
                                }
                            </div>
                        </div>

                        <div className=" col-span-2 sm:col-start-1 sm:col-span-2">
                            <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto">Monto Capital</label>
                            <div className="mt-1">
                                <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                    {formData.montoCuotaCapital.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                </div>
                            </div>
                        </div>


                        <div className=" col-span-2  sm:col-span-2">
                            <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto">Interés Ordinario</label>
                            <div className="mt-1">
                                <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                    {formData.interesOrdinario.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-2">
                            <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto">Interés Moratorio</label>
                            <div className="mt-1">
                                <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                    {formData.interesMoratorio.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                </div>
                            </div>

                        </div>
                        <div className="mt-2 col-span-2 sm:col-start-1 sm:col-span-2 flex ">
                            <button
                                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold 
                                text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2
                                 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                                 disabled:bg-amber-950/10 disabled:cursor-not-allowed disabled:text-gray-400 "
                                onClick={aplicarPago}
                                type="button"
                                disabled={isError}
                            >
                                Aplicar Abono
                            </button>
                        </div>


                    </div> {/* Fin del grid */}



                    {/** TABLA DE PAGOS */}
                    <div className=" mt-5 max-h-60 overflow-y-scroll">
                        <p>Detalle de abonos</p>
                        <table className="table-auto w-full ">
                            <thead className="sticky -top-0 uppercase bg-[#6b7280] text-[#e5e7eb]" >
                                <tr>
                                    <th className="w-[80px] py-1 border  border-gray-300 text-center font-bold p-4" >ID</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">FECHA</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">MONTO</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">ACCION</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-500 ">
                                {dataPagos && dataPagos.map((pago, index) => (
                                    <tr key={index}>
                                        <td className="py-1 border  border-gray-300 text-center  p-4" >{pago.idPago} </td>
                                        <td className="py-1 border  border-gray-300 text-center  p-4">{pago.fechaReal} </td>
                                        <td className="py-1 border  border-gray-300 text-right  p-4"> {pago.monto.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}  </td>
                                        <td className="py-1 border  border-gray-300 text-center  p-4">

                                            <button
                                                className="rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow-xs hover:bg-indigo-300"
                                                onClick={() => { eliminarAbono(pago.idPago) }}
                                                type="button"
                                            >
                                                Eliminar
                                            </button>



                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>

                </div> {/* Fin del border-b */}
            </div >

            <ModalBrowse
                isOpen={isModalOpen}
                data={socioData!}
                title="Lista de Socios"
                columns={columns}
                filterField={filterField}
                onClose={modalCallBack} />

        </div >

    );
}

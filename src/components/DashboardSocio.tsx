'use client'

import { getSocioDashboardData } from "@/app/api/dashboard/actions"


import money_png from "../../public/images/money2.png"
import prestamos_png from "../../public/images/prestamos.png"

import Image from "next/image"
import ProgressBar from "./ProgressBar"
import { ChangeEvent, useEffect, useState } from "react"
import { CuotaProyectada, GenerarProyeccionInput, generarProyeccionPagos } from "@/lib/calculos"
import { formatDateOnly } from "@/lib/date"
import ModalSolicitudPrestamo from "./prestamo/ModalSolicitud"
import Dividendos from "./dividendos/Dividendos"
import Loading from "./loading/Loading"
import socio from "../../public/images/person.png"


interface SocioData {
    idSocio: number;
    cedula: string;
    nombre: string;
    acciones: Accion[];
    prestamos: Prestamo[];
}

interface Accion {
    idAccion: number;
    fecha: string; // Formato de fecha dependiendo de la base de datos
    cantidadAcciones: number;
    periodo: string | null;
    mes: string | null;
    pesoMultiplicador: number | null;
    monto_colones: number;
}

interface Prestamo {
    idPrestamo: number;
    fecha: string; // Formato de fecha dependiendo de la base de datos
    monto: number;
    plazo: number;
    motivo: string | null;
    modalidad: string;
    saldoCapital: number;
    saldoInteresOrdinario: number;
    saldoInteresMoratorio: number;
    pagos: Pago[];
}

interface Pago {
    idPago: number;
    fechaProyectada: string; // Formato de fecha dependiendo de la base de datos
    fechaReal: string | null; // Formato de fecha dependiendo de la base de datos
    monto: number;
    interesOrdinario: number;
    tipoCuota: string;
    interesMoratorio: number;
}

interface frmSimuladorInput {
    monto: number;
    plazo: number;
}



export default function DashboardSocio() {


    const blankSimuladorInput: frmSimuladorInput = {
        monto: 0,
        plazo: 0
    }


    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<SocioData | null>(null)
    const [capacidadDeEndeudamiento, setCapacidadDeEndeudamiento] = useState<number>(0);
    const [deudasTotales, setDeudasTotales] = useState<number>(0);
    const [saldo_x_Endeudamiento, setSaldo_x_Endeudamiento] = useState<number>(0);
    const [socioId, setSocioId] = useState(0)
    const [smallScreen, setSmallScreen] = useState(false)
    const [showSimulador, setShowSimulador] = useState(false)
    const [showSolicitud, setShowSolicitud] = useState(false)
    const [proyeccion, setProyeccion] = useState<CuotaProyectada[] | null>(null)

    const [formSimulador, setFormSimulador] = useState<frmSimuladorInput>(blankSimuladorInput)



    const handleSimuladorForm = (e: ChangeEvent<HTMLInputElement>) => {


        const { name, value } = e.target

        setFormSimulador((prev) => (
            {
                ...prev,
                [name]: value

            }
        ))


    }



    useEffect(() => {

        const generarProyeccion = async () => {
            const input: GenerarProyeccionInput = {

                monto: formSimulador.monto,
                plazoMeses: formSimulador.plazo,
                tasaInteresMensual: 5,
                modelo: "ALEMAN",
                fechaSolicitud: "2025-01-01",
                fechaPrimerPago: "2025-01-01"
            }

            const p = generarProyeccionPagos(input)
            setProyeccion(p)
            console.log(p)

        }

        generarProyeccion()






    }, [formSimulador])






    useEffect(() => {
        // Función para manejar el cambio de tamaño de la ventana
        const handleResize = () => {
            const { innerWidth } = window;

            // Cambia el estado si el ancho es menor a 300px
            if (innerWidth < 400) {
                setSmallScreen(true);
            } else {
                setSmallScreen(false);
            }
        };

        // Añadir el evento de resize
        window.addEventListener('resize', handleResize);

        // Ejecutar la función en la carga inicial
        handleResize();

        // Limpieza del evento cuando el componente se desmonta
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);







    useEffect(() => {

        const loadData = async () => {
            setLoading(true)

            const id = sessionStorage.getItem('idSocio')

            const socioId = id ? parseInt(id, 10) : 0;
            setSocioId(socioId)



            const data = await getSocioDashboardData(socioId ?? 0)

            const capacidadDeEndeudamiento = data?.acciones.reduce((sumatoria, item) => (sumatoria + item.monto_colones * item.pesoMultiplicador!), 0) ?? 0
            const deudasTotales = data?.prestamos.reduce((sumatoria, item) => (sumatoria + item.saldoCapital), 0) ?? 0
            const saldo_x_Endeudamiento = capacidadDeEndeudamiento - deudasTotales

            console.log(capacidadDeEndeudamiento, deudasTotales, saldo_x_Endeudamiento)


            setCapacidadDeEndeudamiento(capacidadDeEndeudamiento ?? 0)
            setDeudasTotales(deudasTotales ?? 0)
            setSaldo_x_Endeudamiento(saldo_x_Endeudamiento)


            setData(data)

            setLoading(false)
        }

        loadData()


        return () => {

        }





    }, [])



    if (socioId === null)
        return (<>  </>)



    if (data === null)
        return (<>  </>)

    if (loading) {
        return (<Loading />)
    } else {
        const totalProximasCuotas = data.prestamos.reduce((total, prestamo) => {
            const plazoRestante = Math.max(prestamo.plazo - prestamo.pagos.length, 0)

            if (prestamo.saldoCapital <= 0 || plazoRestante === 0) {
                return total
            }

            const proximaFechaPago = new Date()
            proximaFechaPago.setDate(1)
            proximaFechaPago.setMonth(proximaFechaPago.getMonth() + 1)
            const fechaPrimerPago = [
                proximaFechaPago.getFullYear(),
                String(proximaFechaPago.getMonth() + 1).padStart(2, "0"),
                String(proximaFechaPago.getDate()).padStart(2, "0"),
            ].join("-")

            const proyeccionPrestamo = generarProyeccionPagos({
                monto: prestamo.saldoCapital,
                plazoMeses: plazoRestante,
                tasaInteresMensual: 5,
                modelo: "ALEMAN",
                fechaSolicitud: prestamo.fecha,
                fechaPrimerPago,
            })

            return total + (proyeccionPrestamo[0]?.montoCuota ?? 0)
        }, 0)

        return (
            <div className="flex flex-col mt-3 max-w-3xl mx-auto gap-2 p-1">

                {/* DETALLE DE SOCIO  */}
                <div className="flex flex-row gap-1 border p-2 rounded-xl  shadow-md shadow-amber-950/50 bg-white/50">
                    <div>
                        <Image src={socio} width={100} height={100} alt="persona" />
                    </div>

                    <div className="flex flex-1 flex-col gap-1 p-2" >
                        <p className="text-2xl font-bold  mb-2">Dashboard Socio</p>
                        <hr />

                        <p>Nombre: {data?.nombre}</p>
                        <p>Cedula: {data?.cedula}</p>
                    </div>
                </div>
                {/* DETALLE DE ENDEUDAMIENTO  */}
                <div className="relative flex flex-col gap-1 border p-4 rounded-xl  shadow-md shadow-amber-950/50 bg-blue-200/60">

                    <div className=" sm:absolute  top-3 right-3  animate-pulse duration-1000  flex gap-2">
                        <button
                            onClick={() => setShowSimulador(!showSimulador)}
                            className="bg-blue-300 shadow rounded-2xl border px-2.5 hover:bg-amber-500"> Simulador</button>
                        <button
                            onClick={() => setShowSolicitud(!showSolicitud)}
                            className="bg-blue-300 shadow rounded-2xl border px-2.5 hover:bg-amber-500">Solicitar préstamo</button>

                    </div>
                    <p className="text-2xl font-bold  ">Monto disponible para préstamos</p>



                    <div className="border  dark:text-black bg-amber-100 border-amber-900/30 shadow-lg  rounded-lg  flex justify-center p-3  mt-2 font-bold text-xl">
                        <p>
                            {saldo_x_Endeudamiento
                                ? saldo_x_Endeudamiento.toLocaleString("es-CR", { style: "currency", currency: "CRC" })
                                : 'No disponible'}
                        </p>

                    </div>

                    <div className="flex flex-col flex-1 mt-3">
                        <p className="text-zinc-600 dark:text-zinc-400" >Porcentaje de endeudamiento:</p>
                        <ProgressBar valorFinal={capacidadDeEndeudamiento ?? 1} valorAvance={deudasTotales ?? 0} />
                    </div>

                    {showSimulador && <div className="mt-5">
                        <hr />
                        <div>
                            <div className="flex w-full">

                                <input
                                    className="bg-blue-200 dark:bg-blue-950   text-center rounded-2xl p-3 mt-3 w-full border-2 border-blue-950  hover:border-red-600"
                                    type="number"
                                    name="monto"
                                    value={formSimulador.monto == 0 ? '' : formSimulador.monto}
                                    onChange={handleSimuladorForm}
                                    placeholder="Digite el monto" />
                            </div>
                            <div className="flex w-full">
                                <input
                                    className="bg-blue-200 dark:bg-blue-950 text-center rounded-2xl p-3 mt-3 w-full border-2 border-blue-950  hover:border-red-600"
                                    type="number"
                                    name="plazo"
                                    value={formSimulador.plazo == 0 ? '' : formSimulador.plazo}
                                    onChange={handleSimuladorForm}
                                    min={1}
                                    max={24}
                                    placeholder="Digite el plazo (meses)" />
                            </div>
                        </div>
                        <hr className="my-3" />
                        <div className="flex flex-col w-full p-4 gap-2 ">
                            {proyeccion && (
                                <div>
                                    <table className="table-auto w-full">
                                        <thead className="sticky -top-0 bg-gray-600 text-gray-100 uppercase">
                                            <tr>
                                                <th className="w-4 md:w-10 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">#</th>
                                                <th className="w-20 md:w-24 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">Cuota</th>
                                                <th className="w-20 md:w-32 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">Capital</th>
                                                <th className="w-20 md:w-24 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">Interés</th>
                                                {!smallScreen && <th className="w-20 md:w-32 py-1 border border-gray-300 text-center  font-bold p-4 text-xs  sm:text-base   ">Saldo</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white text-gray-500">
                                            {proyeccion!.map((pago, index) => (
                                                <tr
                                                    key={index}
                                                    className="py-0 even:bg-slate-400/20 border border-gray-300"
                                                >
                                                    <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{index + 1}</td>
                                                    <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base" >{pago.montoCuota.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                                    <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{pago.amortizacionCapital.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                                    <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{pago.interes.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                                    {!smallScreen && <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{pago.saldoPendiente.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="flex  justify-evenly font-bold dark:text-black bg-amber-100 border rounded-lg mt-3 p-3" >
                                        <p>Total Prestamo: {proyeccion!.reduce((sumatoria, item) => (sumatoria + item.interes + item.amortizacionCapital), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                                        <p>Total Intereses: {proyeccion!.reduce((sumatoria, item) => (sumatoria + item.interes), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                                        <p>Tasa interés neta: {(proyeccion!.reduce((sumatoria, item) => (sumatoria + item.interes), 0) / formSimulador.monto * 100).toFixed(2)}%</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>}

                </div>
                {/* TARJETA DE ACCIONES  */}
                <div className="flex  flex-col  md:flex-row  gap-1 border p-4 rounded-xl  shadow-md shadow-amber-950/50 bg-green-100/50">

                    <div className="mx-auto">
                        <Image src={money_png} width={100} height={100} alt="persona" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-2">
                        <p className="text-2xl font-bold mb-2">Acciones</p>
                        <hr />

                        <div className="flex justify-between">
                            <p>Cantidad de acciones:</p>
                            <p>{data?.acciones.reduce((sumatoria, item) => (sumatoria + item.cantidadAcciones), 0)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Monto Ahorrado:</p>
                            <p className="font-bold ">{data?.acciones.reduce((sumatoria, item) => (sumatoria + item.monto_colones), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                        </div>
                    </div>

                </div>


                {/* DETALLE DE ACCIONES  */}
                <div className="flex flex-col gap-1 border  p-1 md:p-4 rounded-xl  shadow-md shadow-amber-950/50 bg-green-100/50 ">

                    <p className="text-2xl font-bold mb-2">Detalle de Acciones:</p>

                    <div>
                        <table className="min-w-full border-collapse rounded-xl overflow-hidden text-xs  md:text-base ">
                            <thead className="bg-green-800 text-white text-xs  md:text-base">
                                <tr className="rounded-2xl">
                                    <th className="px-2 md:px-4 py-2 font-bold text-center">ID</th>
                                    <th className="px-2 md:px-4 py-2 font-bold text-center">Periodo</th>
                                    <th className="px-2 md:px-4 py-2 font-bold text-center">Mes</th>
                                    <th className="px-2 md:px-4 py-2 font-bold text-center hidden md:block">Fecha</th>
                                    <th className="px-2 md:px-4 py-2 font-bold text-center">Cantidad Acciones</th>
                                    <th className="px-2 md:px-4 py-2 font-bold text-center">Monto</th>
                                    <th className="px-2 md:px-4 py-2 font-bold text-center">Tipo</th>
                                </tr>
                            </thead>
                            <tbody className="dark:bg-green-100 dark:text-black bg-white text-xs  md:text-base">
                                {data?.acciones.map((item) => (
                                    <tr key={item.idAccion} className="border-b text-xs  md:text-base">
                                        <td className="px-2 md:px-4 py-2">{item.idAccion}</td>
                                        <td className="px-2 md:px-4 py-2">{item.periodo}</td>
                                        <td className="px-2 md:px-4 py-2">{item.mes}</td>
                                        <td className="px-2 md:px-4 py-2 hidden md:block">{formatDateOnly(item.fecha)}</td>
                                        <td className="px-2 md:px-4 py-2 text-center">{item.cantidadAcciones}</td>
                                        <td className="px-2 md:px-4 py-2 text-right">
                                            {item.monto_colones.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                        </td>
                                        <td className="px-4 py-2 text-center">x{item.pesoMultiplicador}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>

                </div>

                {/* TARJETA DE PRESTAMOS  */}
                <div className="flex flex-col  md:flex-row gap-1 border p-4 rounded-xl  shadow-md shadow-amber-950/50 bg-red-200/60">
                    <div className="mx-auto">
                        <Image src={prestamos_png} width={100} height={100} alt="persona" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-2">
                        <p className="text-2xl font-bold mb-2">Préstamos</p>
                        <hr />
                        <div className="flex justify-between">
                            <p>Cantidad de préstamos:</p>
                            <p>{data?.prestamos.length}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Monto Solicitado:</p>
                            <p>{data?.prestamos.reduce((sumatoria, item) => (sumatoria + item.monto), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Monto pagado:</p>
                            <p>{data?.prestamos.reduce((sumatoria, item) => (sumatoria + item.monto - item.saldoCapital), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Saldo &rArr; </p>
                            <p>{data?.prestamos.reduce((sumatoria, item) => (sumatoria + item.saldoCapital), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Próximas cuotas: * Puede variar</p>
                            <p>{totalProximasCuotas.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                        </div>
                        <hr />
                        <div className="flex justify-between">
                            <p>Intereses ordinarios  </p>
                            <p>{data?.prestamos.reduce((sumatoria, item) => (sumatoria + item.saldoInteresOrdinario), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                        </div>

                        <div className="flex justify-between">
                            <p>Intereses moratorios  </p>
                            <p>{data?.prestamos.reduce((sumatoria, item) => (sumatoria + item.saldoInteresMoratorio), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                        </div>

                    </div>

                </div>
                {/* DETALLE DE DIVIDENDOS  */}

                <Dividendos socioId={socioId} />




                <ModalSolicitudPrestamo
                    isOpen={showSolicitud}
                    onClose={() => setShowSolicitud(false)}
                    limiteCredito={saldo_x_Endeudamiento}
                    socio={data}
                />



            </div>
        )

    }

}

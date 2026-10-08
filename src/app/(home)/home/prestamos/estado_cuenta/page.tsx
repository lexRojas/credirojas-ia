'use client'

import { getVistaEstadoCuentaP } from "@/app/api/prestamo/actions"
import { generateReport } from "@/lib/report"
import { estado_cuenta } from "@/types/types"
import React from "react"
import { useEffect, useState } from "react"



export default function BrowseSocios() {




    const [data, setData] = useState<estado_cuenta[]>([])
    const [dataFiltered, setDataFiltered] = useState<estado_cuenta[]>([])
    const [currentPage, setCurrentPage] = useState(1);


    const itemsPerPage = 10;



    useEffect(() => {

        const fetchEstadosCuenta = async () => {
            try {
                const estados = await getVistaEstadoCuentaP()
                console.log(estados)
                setData(estados!)
                setDataFiltered(estados!)
            } catch (error) {
                console.log(error)
            }
        }
        fetchEstadosCuenta()
    }, [])



    // Calcula los índices de los elementos a mostrar según la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataFiltered.slice(indexOfFirstItem, indexOfLastItem);

    // Maneja el cambio de página
    const handleNext = () => {
        if (currentPage < Math.ceil(data.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };


    const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filter = e.target.value;
        const filteredData = data.filter((socio) =>
            socio.nombre.toLowerCase().includes(filter.toLowerCase())
        );
        setDataFiltered(filteredData)
        setCurrentPage(1)

    }






    const generarReporte = async (socio: estado_cuenta) => {


        // await generateReport("7fd8da3e34ea66580973b969528797d8641518e79b751fdf2d9fe8d98bc6fa64", socio)
        await generateReport("ab5af0186e7ed831bd2e33602ba5983fd05b0090822e1a1a9640b4cb7b6edeb3", socio)



    }

    return (

        <div className="container dark:bg-amber-100/90  dark:text-black pb-3  flex flex-col items-center justify-center p-2 w-full  pt-2.5">
            <div className="mb-5 w-full md:w-1/3 md:mr-auto md:ml-0 ">
                <label
                    className="block text-left text-sm/6 font-medium text-gray-900"
                    htmlFor="findfilter"
                >
                    Filtrar por nombre
                </label>
                <div className="grid grid-cols-1 ">
                    <input
                        type="search"
                        name="findfilter"
                        className=" col-start-1 row-start-1 appearance-none  bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        placeholder="Buscar Socio"
                        onChange={handleFilter}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className=" col-start-1 row-start-1 mr-2 size-6 self-center justify-self-end  pointer-events-none  text-gray-500 sm:size-6">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                    </svg>
                </div>





            </div>



            {/* Tabla de estado de cuenta */}
            <div className="table-container w-full sm:max-w-6xl">
                {currentItems.map((socio) => (
                    <div key={socio.idSocio} className="bg-gray-100 mb-6 border rounded-lg shadow-sm overflow-hidden">
                        {/* Nivel 1: Socio */}
                        <div className="bg-gray-100 p-2  flex justify-around font-extrabold ">
                            <div className="flex justify-center">
                                <h1>ESTADO DE CUENTA DEL SOCIO</h1>
                            </div>
                            <div className="w-40 flex justify-end">
                                <button
                                    className="bg-blue-950 hover:bg-blue-400 text-white hover:text-black  rounded-xl py-1 px-2 ml-"
                                    onClick={() => generarReporte(socio)}> Estado Cuenta </button>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-2 font-semibold flex justify-between">
                            <span>{socio.cedula} - {socio.nombre}</span>
                            <span>Monto total préstamos: {socio.prestamos.reduce((acc, p) => acc + p.monto, 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</span>
                            <span>Saldo total préstamos: {socio.prestamos.reduce((acc, p) => acc + p.saldoCapital, 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</span>
                        </div>

                        {/* Nivel 2: Préstamos */}
                        <table className="table-auto w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-950/60 text-left  text-white text-sm font-medium">
                                    <th className="p-2">ID Préstamo</th>
                                    <th className="p-2">Motivo</th>
                                    <th className="p-2">Monto</th>
                                    <th className="p-2">Plazo</th>
                                    <th className="p-2">Modalidad</th>
                                    <th className="p-2">Saldo Capital</th>
                                    <th className="p-2">Saldo Interés Ordinario</th>
                                    <th className="p-2">Saldo Interés Moratorio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {socio.prestamos.map((p) => (
                                    <React.Fragment key={p.idPrestamo}>
                                        <tr className="bg-blue-200 hover:bg-gray-100 cursor-pointer">
                                            <td className="p-2">{p.idPrestamo}</td>
                                            <td className="p-2">{p.motivo}</td>
                                            <td className="p-2">{p.monto.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                            <td className="p-2">{p.plazo}</td>
                                            <td className="p-2">{p.modalidad}</td>
                                            <td className="p-2">{p.saldoCapital.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                            <td className="p-2">{p.saldoInteresOrdinario.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                            <td className="p-2">{p.saldoInteresMoratorio.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                        </tr>

                                        {/* Nivel 3: Pagos */}
                                        <tr>
                                            <td colSpan={8} className="pl-10">
                                                <table className="table-auto w-full border-t border-gray-300">
                                                    <thead>
                                                        <tr className="bg-green-500/40 text-center text-xs font-medium [&_th]:p-1" >
                                                            <th>ID Pago</th>
                                                            <th>Fecha Proyectada</th>
                                                            <th>Fecha Real</th>
                                                            <th>Monto Abono</th>
                                                            <th>Capital</th>
                                                            <th>Interés Ordinario</th>
                                                            <th>Interés Moratorio</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {p.pagos.map((pg, index) => (
                                                            <tr key={index} className="hover:bg-gray-50 text-xs   [&_td]:p-1">
                                                                <td className="text-center">{index + 1}</td>
                                                                <td >{pg.fechaProyectada}</td>
                                                                <td >{pg.fechaReal ?? "-"}</td>
                                                                <td className="bg-yellow-300/30 text-right">{(pg.abonoTotal).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                                                <td className="text-right" >{pg.monto.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                                                <td className="text-right" >{pg.interesOrdinario.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                                                <td className="text-right" >{pg.interesMoratorio.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* Paginación */}
            <div className="flex  w-full justify-center items-center gap-2 mt-2">
                <button onClick={handlePrev} disabled={currentPage === 1}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
                    </svg>
                </button>
                <span >Página {currentPage} de {Math.ceil(data.length / itemsPerPage)}</span>
                <button onClick={handleNext} disabled={currentPage === Math.ceil(data.length / itemsPerPage)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                    </svg>
                </button>
            </div>
        </div>
    )


}
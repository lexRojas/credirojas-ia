'use client'

import { getVistaEstadoAcciones } from "@/app/api/acciones/actions"
import jsonToExcel from "@/lib/excel"
import { sociosConAcciones_type } from "@/types/types"
import React from "react"
import { useEffect, useState } from "react"



export default function BrowseSociosAcciones() {




    const [data, setData] = useState<sociosConAcciones_type[]>([])
    const [dataFiltered, setDataFiltered] = useState<sociosConAcciones_type[]>([])
    const [currentPage, setCurrentPage] = useState(1);


    const itemsPerPage = 10;



    useEffect(() => {

        const fetchEstadosCuenta = async () => {
            try {
                const estados = await getVistaEstadoAcciones()
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






    const generarReportEmail = async (socio: sociosConAcciones_type) => {
 

        try {

            const response = await fetch('/api/email/estado_acciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: socio }),
            });

            if (response.ok) {
                console.log("enviado!!!!")
            }

        }
        catch (error) {
            console.log(error)
        }


    }

    const generarReportXLS = async (socio: sociosConAcciones_type) => {
        console.log(socio)

        try {
            // Iterar sobre cada socio
            const accionesAplanadas = socio.acciones.map(accion => ({
                idSocio: socio.idSocio,
                nombre: socio.nombre,
                cedula: socio.cedula,
                correo: socio.correo,
                idAccion: accion.idAccion,
                fecha: accion.fecha,
                cantidadAcciones: accion.cantidadAcciones,
                periodo: accion.periodo,
                pesoMultiplicador: accion.pesoMultiplicador,
                monto_colones: accion.monto_colones,
                mes: accion.mes,
            }));

            jsonToExcel(accionesAplanadas, "acciones_x_socio.xls")

        }
        catch (error) {
            console.log(error)
        }


    }

    return (

        <div className="container dark:bg-amber-100/90  pb-3  flex flex-col items-center justify-center p-2 w-full  pt-2.5">
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
            <div className="table-container dark:text-black w-full sm:max-w-3xl">
                {currentItems.map((socio) => (
                    <div key={socio.idSocio} className="bg-gray-100 mb-6 border rounded-lg shadow-sm overflow-hidden">
                        {/* Nivel 1: Socio */}
                        <div className="bg-gray-100 p-2  flex  font-extrabold ">
                            <div className="flex flex-1 justify-center">
                                <h1>ESTADO DE CUENTA DEL SOCIO</h1>
                            </div>
                            <div className="flex w-40    justify-center gap-1">
                                <div className="w-20 flex justify-end">
                                    <button
                                        className="w-full bg-blue-950 hover:bg-blue-400 text-white hover:text-black  rounded-xl py-1 px-2 disabled:bg-gray-300"
                                        onClick={() => generarReportEmail(socio)}
                                    > Send </button>
                                </div>
                                <div className="w-20 flex justify-end">
                                    <button
                                        className="w-full bg-blue-950 hover:bg-blue-400 text-white hover:text-black  rounded-xl py-1 px-2 disabled:bg-gray-300"
                                        onClick={() => generarReportXLS(socio)}
                                    > XLS </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex p-1 pl-2 font-bold gap-2">
                            <p>{socio.cedula}</p>
                            <p>&rArr;</p>
                            <p >{socio.nombre}</p>
                        </div>


                        {/* Nivel 2: Préstamos */}
                        <table className="table-auto w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-950/60 text-left  text-white text-sm font-medium">
                                    <th className="p-2">ID Accion</th>
                                    <th className="p-2">Periodo</th>
                                    <th className="p-2">Mes</th>
                                    <th className="p-2">Fecha</th>
                                    <th className="p-2">Cantidad Acciones</th>
                                    <th className="p-2">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {socio.acciones.map((a) => (
                                    <tr key={a.idAccion}
                                        className="bg-blue-200 hover:bg-gray-100 cursor-pointer">
                                        <td className="p-2">{a.idAccion}</td>
                                        <td className="p-2">{a.periodo}</td>
                                        <td className="p-2">{a.mes}</td>
                                        <td className="p-2">{a.fecha}</td>
                                        <td className="p-2 text-center">{a.cantidadAcciones}</td>
                                        <td className="p-2">{a.monto_colones.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                    </tr>

                                ))}

                                <tr className="bg-yellow-100 ">
                                    <td
                                        colSpan={4}
                                        className=" font-bold text-right p-2">TOTAL DE ACCIONES Y MONTO  &rArr; </td>

                                    <td className="p-2 text-center font-bold">{socio.acciones.reduce((sumatoria, item) => (sumatoria + item.cantidadAcciones), 0)}</td>
                                    <td className="p-2 font-bold">{socio.acciones.reduce((sumatoria, item) => (sumatoria + item.monto_colones), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                </tr>




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
'use client'

import { getMaestroSocios,  maestroSociosTemplate } from "@/app/api/socio/actions"
import { useEffect, useState } from "react"




export default function BrowseSocios() {




    const [data, setData] = useState<maestroSociosTemplate[]>([])
    const [dataFiltered, setDataFiltered] = useState<maestroSociosTemplate[]>([])
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;



    useEffect(() => {

        const fetchSocios = async () => {
            try {
                const socios: maestroSociosTemplate[] = await getMaestroSocios()
                setData(socios)
                setDataFiltered(socios)
            } catch (error) {
                console.log(error)
            }
        }
        fetchSocios()
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





    return (

        <div className="container flex flex-col items-center justify-center p-2 w-full  pt-2.5">
            <div className="mb-5 w-full md:w-1/3 md:mr-auto md:ml-0 ">
                <label
                    className="block text-left text-sm/6 font-medium dark:text-yellow-200 text-gray-900"
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



            {/* Tabla de socios */}
            <div className="table-container w-full dark:bg-amber-200/40">
                <table className="table-auto mx-auto w-full">
                    <thead>
                        <tr className="dark:bg-amber-950 dark:text-white uppercase text-base/7 font-semibold text-gray-900/50 border-b border-gray-900/20">
                            <th className="hidden sm:table-cell">Cedula</th>
                            <th >Nombre</th>
                            <th className="hidden sm:table-cell">Fecha Ing</th>
                            <th className="hidden sm:table-cell">Fecha Sal</th>
                            <th className="hidden sm:table-cell">Cant. Acc</th>
                            <th className="hidden sm:table-cell">Monto Ahorrado</th>
                            <th className="hidden sm:table-cell">Disponible Créd.</th>
                            <th className="hidden sm:table-cell">Monto Prestado</th>
                            <th className="hidden sm:table-cell">Saldo Prestamos</th>
                            <th className=" bg-yellow-300">Saldo Disponible</th>

                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((socio) => (
                            <tr key={socio.idSocio}
                                className="border-b border-gray-900/20  even:bg-amber-800/5  hover:bg-amber-200/50 hover:text-black  cursor-pointer  "

                            >
                                <td className="p-2 hidden sm:table-cell"> {socio.cedula}</td>
                                <td className="p-2  uppercase ">{socio.nombre}</td>
                                <td className="p-2 hidden sm:table-cell"> {socio.fechaIngreso}</td>
                                <td className="p-2 hidden sm:table-cell">{socio.fechaSalida}</td>
                                <td className="p-2 hidden sm:table-cell text-center">{socio.total_acciones}</td>
                                <td className="p-2 hidden sm:table-cell text-right"> {socio.monto_acciones.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                <td className="p-2 hidden sm:table-cell text-right">{socio.monto_disponible.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                <td className="p-2 hidden sm:table-cell text-right">{socio.monto_prestamos.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                <td className="p-2 lowercase hidden sm:table-cell text-right">{socio.saldo_capital.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                <td className="p-2 lowercase  bg-yellow-100 text-right">{socio.saldo_disponible.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
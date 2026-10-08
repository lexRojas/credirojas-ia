'use client'

import { aplicarDividendosPeriodo, bloquearDividendosPeriodo, getDividendosPeriodoSaved, getDividendosPeriodoSavedType, setDividendosPeriodo, } from "@/app/api/dividendos/actions"
import Loading from "@/components/loading/Loading"
import { useEffect, useState } from "react"



export default function BrowseSocios() {




    const [data, setData] = useState<getDividendosPeriodoSavedType[]>([])
    const [dataFiltered, setDataFiltered] = useState<getDividendosPeriodoSavedType[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [periodo, setPeriodo] = useState(new Date().getFullYear().toString());
    const [nombrefilter, setNombreFilter] = useState("");
    const [periodoBloqueado, setPeriodoBloqueado] = useState(false);


    const itemsPerPage = 10;


    useEffect(() => {

        const loadDividendos = async () => {
            setLoading(true)
            const data = await getDividendosPeriodoSaved()
            setData(data)
            setDataFiltered(data.filter((socio) => socio.periodo === periodo))

            setPeriodoBloqueado(
                data.some((s) => s.periodo === periodo && s.periodoBloqueado)
            );


            setCurrentPage(1)
            setLoading(false)
        }
        loadDividendos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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


    const aplicarFiltros = (periodo: string, nombre: string) => {
        const filteredData = data.filter((socio) =>
            (periodo === "" || socio.periodo === periodo) &&
            (nombre === "" || socio.nombre.toLowerCase().includes(nombre.toLowerCase()))
        );

        setDataFiltered(filteredData);

        setPeriodoBloqueado(
            filteredData.some((s) => s.periodo === periodo && s.periodoBloqueado)
        );

        setCurrentPage(1);
    };


    const handleNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNombreFilter(value);
        aplicarFiltros(periodo, value);
    };




    const handlePeriodo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPeriodo(value);
        aplicarFiltros(value, nombrefilter);
    };


    const calcularPeriodo = async () => {

        setLoading(true)
        await setDividendosPeriodo(periodo)
        const socios = await getDividendosPeriodoSaved()
        setData(socios)
        setDataFiltered(socios.filter((socio) => socio.periodo === periodo))
        setLoading(false)
        setCurrentPage(1)
    }

    const changeRadio = (idSocio: number, type: string) => {

        const socios = data.map((socio) => {
            if (socio.idSocio === idSocio && socio.periodo === periodo) {
                return { ...socio, capitalizado: type === "capitalizar" }
            }
            return socio
        })
        setDataFiltered(socios.filter((socio) => socio.periodo === periodo))
        setData(socios)

    }

    const aprobarCalculo = async () => {

        setLoading(true)

        const sociosPeriodo = data.filter((socio) => socio.periodo === periodo)
        await aplicarDividendosPeriodo(sociosPeriodo)

        setLoading(false)



    }
    const bloquearCalculo = async () => {

        setLoading(true)
        await bloquearDividendosPeriodo(periodo)
        const socios = await getDividendosPeriodoSaved()
        setData(socios)
        setDataFiltered(socios.filter((socio) => socio.periodo === periodo))
        setPeriodoBloqueado(true)
        setLoading(false)
    }



    if (loading) {
        return (

            <Loading />

        )


    }


    return (

        <div className="container flex flex-col items-center justify-center p-2 w-full  pt-2.5">
            {/* Cuadro de Opciones y filtros  */}
            <div className="flex flex-col md:flex md:flex-row gap-3 w-full">
                {/* Cuadro de filtro */}
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
                            value={nombrefilter}
                            onChange={handleNombre}
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
                {/* cuadro de periodo  */}
                <div className="mb-5 w-full md:w-1/4 md:mr-auto md:ml-0">
                    <label
                        className="block text-left text-sm/6 font-medium dark:text-yellow-200 text-gray-900"
                        htmlFor="findPeriodo"
                    >
                        Filtrar por periodo
                    </label>
                    <div className=" ">
                        <input
                            type="number"
                            name="findPeriodo"
                            className="    bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            value={periodo}
                            placeholder="Periodo"
                            onChange={handlePeriodo}
                        />
                    </div>

                </div>
                <div className="flex gap-1 border border-amber-800 flex-1 rounded-2xl p-2 ">
                    <button
                        className={`${periodoBloqueado ? "bg-gray-400 text-black" : "bg-green-900 text-white hover:bg-green-500 cursor-pointer"}   border-2 rounded-2xl border-white   p-1 flex-1 flex items-center justify-center `}
                        type="button"
                        onClick={() => calcularPeriodo()}
                        disabled={periodoBloqueado}

                    > CALCULAR
                    </button>
                    <button
                        className={`${periodoBloqueado ? "bg-gray-400 text-black" : "bg-blue-900  text-white hover:bg-blue-500 cursor-pointer"}   border-2 rounded-2xl border-white   p-1 flex-1 flex items-center justify-center `}
                        type="button"
                        onClick={() => aprobarCalculo()}
                        disabled={periodoBloqueado}
                    > APROBAR CALCULO
                    </button>
                    <button
                        className={`${periodoBloqueado ? "bg-gray-400 text-black" : "bg-red-900 text-white hover:bg-red-500 cursor-pointer "} border-2 rounded-2xl border-white   p-1 flex-1 flex items-center justify-center`}
                        type="button"
                        onClick={() => bloquearCalculo()}
                        disabled={periodoBloqueado}
                    > CERRAR PERIODO
                    </button>

                </div>

            </div>

            {/* Tabla de socios */}
            <div className="table-container mt-5 w-full dark:bg-amber-200/40">
                <table className="table-auto mx-auto w-full">
                    <thead>
                        <tr className="dark:bg-amber-950 dark:text-white uppercase text-base/7 font-semibold text-gray-900/50 border-b border-gray-900/20">
                            <th >Nombre</th>
                            <th className="hidden sm:table-cell"># Acciones</th>
                            <th className="hidden sm:table-cell">Monto Ahorrado</th>
                            <th className="hidden sm:table-cell">Saldo Prestamos</th>
                            <th className="">Dividendos</th>
                            <th className="">Acciones</th>


                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((socio) => (
                            <tr key={socio.idSocio}
                                className={`border-b border-gray-900/20  ${periodoBloqueado ? (socio.capitalizado ? "bg-gray-400" : "bg-green-700") : "even:bg-amber-800/5  hover:bg-amber-200/50 hover:text-black"} `}
                            >
                                <td className="p-2  uppercase ">{socio.nombre}</td>
                                <td className="p-2 hidden sm:table-cell">{socio.cantidad_acciones}</td>
                                <td className="p-2 hidden sm:table-cell"> {socio.monto_acciones.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                <td className="p-2 lowercase hidden sm:table-cell">{socio.saldo_capital.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                <td className="p-2 ">{socio.monto.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                <td className="p-2 flex gap-2" >
                                    <div className={`${!socio.capitalizado && periodoBloqueado? "hidden" : ""}`}>
                                        <input
                                            type="radio"
                                            value="capitalizar"
                                            checked={socio.capitalizado}
                                            name={`socio${socio.idSocio}`}
                                            onChange={() => changeRadio(socio.idSocio, "capitalizar")}
                                            disabled={periodoBloqueado}
                                        />
                                        <span >Capitalizar</span></div>

                                    <div className={`${socio.capitalizado && periodoBloqueado? "hidden" : ""}`}>
                                        <input
                                            type="radio"
                                            value="pagar"
                                            checked={!socio.capitalizado}
                                            name={`socio${socio.idSocio}`}
                                            onChange={() => changeRadio(socio.idSocio, "pagar")}
                                            disabled={periodoBloqueado}
                                        /> <span className={`${!socio.capitalizado && periodoBloqueado? "text-amber-300 animate-pulse" : ""}  `}>Pagar</span></div>
                                </td>

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
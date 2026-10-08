'use client';

import { useEffect, useState } from 'react';
import { getAuditoriaSocioPrestamos2, SocioAuditoriaPrestamoOutput } from '@/app/api/dashboard/actions';

export default function AuditoriaSocios() {
    // Estado para almacenar los datos de la auditoría

    const [data, setData] = useState<SocioAuditoriaPrestamoOutput[]>([]);
    // Estado para el periodo seleccionado

    // obtengo el año actual 
    const fechaActual = new Date();
    const añoActual = fechaActual.getFullYear();



    const [periodo, setPeriodo] = useState<number>(añoActual);

    // useEffect para cargar los datos del periodo inicial y cuando cambie el periodo
    useEffect(() => {
        const fetchData = async () => {
            const result = await getAuditoriaSocioPrestamos2(periodo);
            setData(result || []);
        };
        fetchData();
    }, [periodo]); // Dependencia para recargar los datos al cambiar el periodo

    // Cambiar el periodo seleccionado
    const handlePeriodoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPeriodo(Number(event.target.value));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Titulo*/}
            <h1 className='text-xl font-bold'>Auditoría de Préstamos por Socio</h1>
            <hr className='mb-4' />

            {/* Selector de periodo */}
            <div className="mb-4 w-2/12">
                <label htmlFor="periodo" className="block text-gray-700 text-lg font-medium mb-2">
                    Selecciona el periodo
                </label>
                <select
                    id="periodo"
                    value={periodo}
                    onChange={handlePeriodoChange}
                    className=" bg-amber-100 border border-gray-300 rounded-md p-2 w-full"
                >
                    {/* Generar opciones de 2025 a 2035 */}
                    {Array.from({ length: 11 }, (_, i) => 2025 + i).map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tabla de auditoría */}




            <div>

                {data.length > 0 ? (
                    data.map((item) => (
                        <div key={item.idSocio} className='mt-5'>
                            <p className='font-bold'>{item.nombre}</p>

                            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th className="px-4 py-2 text-center w-3/12">Motivo</th>
                                        <th className="px-4 py-2 text-center">Ene</th>
                                        <th className="px-4 py-2 text-center">Feb</th>
                                        <th className="px-4 py-2 text-center">Mar</th>
                                        <th className="px-4 py-2 text-center">Abr</th>
                                        <th className="px-4 py-2 text-center">May</th>
                                        <th className="px-4 py-2 text-center">Jun</th>
                                        <th className="px-4 py-2 text-center">Jul</th>
                                        <th className="px-4 py-2 text-center">Ago</th>
                                        <th className="px-4 py-2 text-center">Sep</th>
                                        <th className="px-4 py-2 text-center">Oct</th>
                                        <th className="px-4 py-2 text-center">Nov</th>
                                        <th className="px-4 py-2 text-center">Dic</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {item.prestamos.length > 0 ? (
                                        item.prestamos.map((prestamo, index) => (
                                            <tr key={index} className='[&_td]:px-4 [&_td]:py-2 [&_td]:text-center [&_td]:border [&_td]:border-blue-600/20'>
                                                <td >{prestamo[0]}</td>
                                                <td className={prestamo[1] > 0 ? 'bg-green-600' : ''}>{prestamo[1] == 0 ? '-' : `${prestamo[1]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[2] > 0 ? 'bg-green-600' : ''}>{prestamo[2] == 0 ? '-' : `${prestamo[2]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[3] > 0 ? 'bg-green-600' : ''}>{prestamo[3] == 0 ? '-' : `${prestamo[3]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[4] > 0 ? 'bg-green-600' : ''}>{prestamo[4] == 0 ? '-' : `${prestamo[4]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[5] > 0 ? 'bg-green-600' : ''}>{prestamo[5] == 0 ? '-' : `${prestamo[5]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[6] > 0 ? 'bg-green-600' : ''}>{prestamo[6] == 0 ? '-' : `${prestamo[6]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[7] > 0 ? 'bg-green-600' : ''}>{prestamo[7] == 0 ? '-' : `${prestamo[7]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[8] > 0 ? 'bg-green-600' : ''}>{prestamo[8] == 0 ? '-' : `${prestamo[8]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[9] > 0 ? 'bg-green-600' : ''}>{prestamo[9] == 0 ? '-' : `${prestamo[9]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[10] > 0 ? 'bg-green-600' : ''}>{prestamo[10] == 0 ? '-' : `${prestamo[10]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[11] > 0 ? 'bg-green-600' : ''}>{prestamo[11] == 0 ? '-' : `${prestamo[11]} de ${prestamo[13]}`}</td>
                                                <td className={prestamo[12] > 0 ? 'bg-green-600' : ''}>{prestamo[12] == 0 ? '-' : `${prestamo[12]} de ${prestamo[13]}`}</td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={13} className="px-4 py-2 text-center">No se encontraron datos para el periodo seleccionado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron socios.</p>
                )}



            </div>
        </div >
    );
}

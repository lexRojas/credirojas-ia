'use client';

import { useEffect, useState } from 'react';
import { getAuditoriaSocioAcciones } from '@/app/api/dashboard/actions';

export default function AuditoriaSocios() {
    // Estado para almacenar los datos de la auditoría
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[]>([]);
    // Estado para el periodo seleccionado

    // obtengo el año actual 
    const fechaActual = new Date();
    const añoActual = fechaActual.getFullYear();



    const [periodo, setPeriodo] = useState<string>(añoActual.toString());

    // useEffect para cargar los datos del periodo inicial y cuando cambie el periodo
    useEffect(() => {
        const fetchData = async () => {
            const result = await getAuditoriaSocioAcciones(periodo);
            console.log(result)
            setData(result || []);
        };
        fetchData();
    }, [periodo]); // Dependencia para recargar los datos al cambiar el periodo

    // Cambiar el periodo seleccionado
    const handlePeriodoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPeriodo(event.target.value);
    };

    return (
        <div className="container mx-auto px-4 py-8">
                        {/* Titulo*/}
            <h1 className='text-xl font-bold'>Auditoría de Acciones por Socio</h1>
            <hr className='mb-4'/>

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
            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="px-4 py-2 text-center">Socio ID</th>
                        <th className="px-4 py-2 text-center">Cédula</th>
                        <th className="px-4 py-2 text-center">Nombre</th>
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
                        <th className="px-4 py-2 text-center">Total</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {data.length > 0 ? (
                        data.map((item) => (
                            <tr key={item.idSocio}>
                                <td className="px-4 py-2 text-left border border-blue-600/20">{item.idSocio}</td>
                                <td className="px-4 py-2 text-left border border-blue-600/20">{item.cedula}</td>
                                <td className="px-4 py-2 text-left border border-blue-600/20">{item.nombre}</td>
                                {Array.from({ length: 12 }, (_, index) => {
                                    const mes = index + 1;
                                    const value = item[`m${mes}` as keyof typeof item] || 0;
                                    const backgroundColor = value > 0 ? 'bg-green-200' : '';
                                    return (
                                        <td
                                            key={mes}
                                            className={`px-4 py-2 text-center ${backgroundColor} border border-blue-600/20`}
                                        >
                                            {value > 0 ? value : ''}
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-2 text-center bg-yellow-200 font-bold">{item.total || 0}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={16} className="px-4 py-2 text-center">No se encontraron datos para el periodo seleccionado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

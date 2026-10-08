/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { getProyeccionDividendos } from '@/app/api/dividendos/actions';
import { useEffect, useState } from 'react'
import Image from 'next/image';
import dividendos_png from "@/../public/images/dividendos.png"




interface DividendosProps {
    socioId: number;
}

interface ProyeccionDividendos {
    dividendos_actuales: number;
    intereses_totales: number;
    porcentaje_dividendos: number;
    intereses_futuros: number;
    dividendos_futuros: number;
    dividendos_capitalizados: number;
};



export default function Dividendos(props: DividendosProps) {

    // Variables de estado 
    const { socioId, } = props;
    const [loading, SetLoading] = useState(false)
    const [dividendos, SetDividendos] = useState<ProyeccionDividendos>()




    useEffect(() => {
        SetLoading(true)
        const fetchDividendos = async () => {
            try {

                const data: ProyeccionDividendos = await getProyeccionDividendos(socioId)

                SetDividendos(data)


            } catch (error) {
                console.error('Error al obtener los dividendos:', error);
            }

        };
        fetchDividendos();
        SetLoading(false)
    }, [socioId]);




    return (
        <div className="flex flex-col  md:flex-row gap-1 border p-4 rounded-xl  shadow-md shadow-amber-950/50 bg-cyan-900/50">
            <div className="mx-auto">
                <Image src={dividendos_png} width={100} height={100} alt="persona" />
            </div>
            <div className="flex flex-1 flex-col gap-1 p-2">
                <p className="text-2xl font-bold mb-2">Dividendos **</p>
                <hr />

                <div className="flex justify-between mt-2">
                    <p>Ingresos a la fecha:</p>
                    <p>{dividendos?.intereses_totales.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                </div>
                <div className="flex justify-between mt-2">
                    <p>Ingresos proyectados periodo actual:</p>
                    <p>{dividendos?.intereses_futuros.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                </div>
                <hr />

                <div className='relative border-2 rounded-lg mt-3 p-2 shadow-lg border-green-900 bg-green-200'>
                    <p
                        className='absolute ml-3 -top-2.5 z-10 bg-white px-2 py-0.5 rounded shadow-2xl text-xs border-green-900 border-2 dark:text-black'
                    >DIVIDENDOS CAPITALIZADOS
                    </p>


                    <div className="flex flex-col  mt-3  text-2xl font-bold gap-2 dark:text-black">
                        <p className='text-center'>{dividendos?.dividendos_capitalizados.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                    </div>
                </div>


                <div className='relative border-2 rounded-lg mt-3 p-2 shadow-lg border-amber-600 bg-amber-100'>
                    <p
                        className='absolute ml-3 -top-2.5 z-10 bg-white px-2 py-0.5 rounded shadow-2xl text-xs border-amber-600 border-2 dark:text-black'
                    >DIVIDENDOS ACTUALES
                    </p>


                    <div className="flex flex-col  mt-3  text-2xl font-bold gap-2 dark:text-black">
                        <p className='text-center'>{dividendos?.dividendos_actuales.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                    </div>
                </div>

                <div className='relative border-2 rounded-lg mt-3 p-2 shadow-lg border-blue-600 bg-blue-100'>
                    <p
                        className='absolute ml-3 -top-2.5 z-10 bg-white px-2 py-0.5 rounded shadow-2xl text-xs border-blue-600 border-2 dark:text-black'
                    >DIVIDENDOS PROYECTADOS
                    </p>
                    <div className="flex flex-col  mt-3  text-2xl font-bold gap-2 dark:text-black">
                        <p className='text-center'> {dividendos?.dividendos_futuros.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                    </div>
                </div>

                <div className='mt-2 text-xs text-amber-900 dark:text-amber-100'>
                    <p> ** Los dividendos mostrados son un cálculo con los valores que se tienen a la fecha,
                        no deben considerarse como definitivos, debido a que los mismos pueden variar
                        debido a salidas o entradas de socios, a pagos de contado, etc.</p>
                </div>


            </div>

        </div>

    )




}
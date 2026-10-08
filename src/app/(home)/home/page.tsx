'use client'

import { getDashboardData, getDashboardDataSocios } from '@/app/api/dashboard/actions';
import BarChart from '@/components/graficos/BarChart'
import Loading from '@/components/loading/Loading';
import styles from '@/styles/dashboard.module.css';
import localFont from 'next/font/local';
import { useState, useEffect } from 'react';



const bonaNovaBold = localFont({
  src: '../../../../public/fonts/BonaNovaSC-Bold.ttf',
  weight: '700',
  style: 'normal',
  display: 'swap',
  variable: '--font-bonaNovaBold',
});

//Roboto-Regular
const robotoRegular = localFont({
  src: '../../../../public/fonts/Roboto-Regular.ttf',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-robotoRegular',
});

interface datosType {
  f0: number,
  f1: string,
  f2: number
}

interface datoResumen {
  f0: number,
  f1: number,
  f2: number,
  f3: number
}




export default function Home() {



  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardInfo] = useState<datoResumen[] | undefined>(undefined);
  const [dashboardDataSocios, setDashboardSociosInfo] = useState<datosType[] | undefined>(undefined);

  useEffect(() => {


    const loadData = async () => {
      setLoading(true)
      const data = await getDashboardData(new Date().getFullYear());
      setDashboardInfo(data);
      const dataSocios = await getDashboardDataSocios(new Date().getFullYear());
      setDashboardSociosInfo(dataSocios);

      setLoading(false)
    };
    loadData();


  }, []);

  if (loading) {
    return (

      <Loading />

    )


  }

  return (
    <div className='flex flex-col '>
      <div className='flex sm:flex-row sm:flex-wrap flex-col sm:justify-between mb-7'>
        <div className=''>
          <h1 className={bonaNovaBold.className + " text-5xl pb-1.5"}>CrediRojas </h1>
        </div>
        <div className='' >
          <h1 className={bonaNovaBold.className + " text-2xl min-w-[324px] sm:text-5xl pb-1.5"}>Periodo: {new Date().getFullYear()} </h1>
        </div>
      </div>

      <hr className='mb-7' />

      <div className="flex flex-row flex-wrap gap-4 gap-y-8 justify-center sm:justify-around">

        {/** Cantidad de socios */}
        <div className='dark:text-black min-w-40'>
          <div className={styles.card}>
            <h1 className={styles.cardTitle}>Socios:</h1>
            <p className={robotoRegular.className}> {dashboardData && dashboardData[0].f0}</p>
          </div>
        </div>

        {/** Monto total Ahorrado */}
        <div className='dark:text-black min-w-80'>
          <div className={styles.card}>
            <h1 className={styles.cardTitle}>Monto total Ahorrado:</h1>
            <p className={robotoRegular.className}> {dashboardData && dashboardData[0]!.f1.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</p>
          </div>
        </div>

        {/** Monto Total Prestado */}
        <div className='dark:text-black min-w-80'>
          <div className={styles.card}>
            <h1 className={styles.cardTitle}>Monto Total Prestado:</h1>
            <p className={robotoRegular.className}> {dashboardData && dashboardData[0]!.f2.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</p>
          </div>
        </div>

        {/** Monto Ingresos */}
        <div className='dark:text-black min-w-80'>
          <div className={styles.card}>
            <h1 className={styles.cardTitle}>Monto Ingresos:</h1>
            <p className={robotoRegular.className}> {dashboardData && dashboardData[0]!.f3.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</p>
          </div>
        </div>

      </div>

      {/** Mostrar gráfico solo si los datos están disponibles */}

      <BarChart datos={dashboardDataSocios!} />

    </div>
  );
}

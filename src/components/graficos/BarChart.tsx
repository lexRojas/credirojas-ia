'use client'

import React from 'react';
import { Chart } from 'react-google-charts'
import styles from '@/styles/dashboard.module.css';




interface props {
  datos: {
    f0: number,
    f1: string,
    f2: number
  }[]
}


export default function App({ datos }: props) {



  const data = datos.length > 0 ?
    datos!.map((item) => {

      return [
        item.f1,
        item.f2
      ]



    }) :
    [{ label: "", valor: 0 }]


  const new_data = [["Socios", "Colones"], ...data]





  // Different options for non-material charts
  const options = {

    chartArea: { width: "50%" },
    legend: { position: "bottom" },
    bar: {
      groupWidth: "50%",

    },

    hAxis: {
      title: "Miles de colones",
      minValue: 0,
    },
    vAxis: {
      title: "Socios",
      textStyle: {
        fontSize: 10,
      }
    },


  };



  return (

    <div className=' items-center justify-center mt-10 w-full md:w-4/6 mx-auto'>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Monto acciones por socio</p>
        <Chart
          // Bar is the equivalent chart type for the material design version.
          chartType="BarChart"
          width="100%"
          height="500px"
          data={new_data}
          options={options}
        />
      </div>
    </div>
  );
}



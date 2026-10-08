'use client'
import Simulador from "@/components/Simulador";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {


  const router = useRouter();



  // Estado del formulario
  const [dataForm, setDataForm] = useState({
    nombre: "",
    monto: 0,
    plazo: 0,
    fecha: new Date().toISOString().split("T")[0]
  });


  //Presentar Simulador 
  const [showSimulador, setShowSimulador] = useState(false);




  // Función para actualizar los campos
  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setDataForm(prev => ({
      ...prev,
      [id]: value
    }));
  };





  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setShowSimulador(true);




  };


  const closeModal = () => {
    router.push('/home');

  }



  if (showSimulador) {

    return (
      <div>

        <div className=" mb-5 left-2 top-2 z-10 flex items-center justify-center">
          <button className="w-40 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition" onClick={() => setShowSimulador(false)}> Simular de nuevo </button>
        </div>

        <Simulador nombre={dataForm.nombre} input={{ monto: dataForm.monto, plazoMeses: dataForm.plazo, tasaInteresMensual: 5, modelo: "ALEMAN", fechaSolicitud: new Date().toISOString().split("T")[0], fechaPrimerPago: dataForm.fecha }} />

      </div>)

  } else {


    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-500/50 text-black  dark:bg-amber-100/90  pb-3  z-50">
        <div className="absolute w-11/12 md:w-1/4  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  rounded-lg shadow-lg p-4 bg-white z-20">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-semibold mb-1 p-4">Simulador de Crédito</h1>
            <hr className="border w-full my-4" />

            <div className="absolute top-4 right-4 ">
              <button
                className="text-red-500 hover:text-red-700"
                type="button"
                onClick={() => closeModal()}
              >Close </button>

            </div>


            <form className="grid grid-cols-2 gap-4 w-full max-w-md" onSubmit={handleSubmit}>
              {/* Nombre */}
              <div className="col-span-2">
                <label htmlFor="nombre" className="block text-sm/6 font-medium text-gray-900">
                  Nombre:
                </label>
                <div className="mt-1">
                  <div className="flex items-center bg-slate-400/30 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      type="text"
                      id="nombre"
                      placeholder="Nombre"
                      required
                      value={dataForm.nombre}
                      onChange={handleChanges}
                      className="block min-w-0 grow text-center py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              {/* Monto */}
              <div>
                <label htmlFor="monto" className="block text-sm/6 font-medium text-gray-900">
                  Monto:
                </label>
                <div className="mt-1">
                  <div className="flex items-center bg-slate-400/30 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      type="number"
                      id="monto"
                      required
                      value={dataForm.monto}
                      onChange={handleChanges}
                      className="block min-w-0 grow text-center py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              {/* Plazo */}
              <div>
                <label htmlFor="plazo" className="block text-sm/6 font-medium text-gray-900">
                  Plazo:
                </label>
                <div className="mt-1">
                  <div className="flex items-center bg-slate-400/30 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      type="number"
                      id="plazo"
                      required
                      value={dataForm.plazo}
                      onChange={handleChanges}
                      className="block min-w-0 grow text-center py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              {/* Fecha 1er pago */}
              <div>
                <label htmlFor="fechaPrimerPago" className="block text-sm/6 font-medium text-gray-900">
                  Fecha 1er Pago:
                </label>
                <div className="mt-1">
                  <div className="flex items-center bg-slate-400/30 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      type="date"
                      id="fecha"
                      required
                      value={dataForm.fecha}
                      onChange={handleChanges}
                      className="block min-w-0 grow text-center py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              {/* Botón */}
              <div className="mt-auto ">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                >
                  Simular
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

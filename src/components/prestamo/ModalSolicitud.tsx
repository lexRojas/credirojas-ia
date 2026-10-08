'use client'

import { useState } from "react";

import icon from '@/../public/images/icon.png'
import Image from "next/image";

import { formTypeSolicitud, saveSolicitud } from "@/app/api/solicitudes/actions";
import { todayCR } from "@/lib/date";




interface modalProps {
    isOpen: boolean;
    onClose: () => void;
    limiteCredito: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socio: any;
}

export default function ModalSolicitudPrestamo(props: modalProps) {

    const [formData, setFormData] = useState({
        motivo: '',
        monto: 0,
        plazo: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };


    const save = async (inputData: formTypeSolicitud) => {

        const response = await saveSolicitud(inputData)
        console.log(response)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para enviar la solicitud
        console.log("Solicitud enviada:", formData);
        props.onClose(); // Cerrar modal después de enviar

        const newSolicitud: formTypeSolicitud = {
            socioId: props.socio.idSocio,
            fechaSolicitud: todayCR(),
            detalle: formData.motivo,
            aprobada: false,
            fechaAprobacion: "",
            cerrada: false,
            motivo: formData.motivo,
            monto: formData.monto,
            plazo: formData.plazo
        }

        save(newSolicitud)







    };

    if (!props.isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="container relative bg-blue-200  dark:bg-amber-100/90 pb-3 px-3.5 sm:max-w-xl">
                <div className="absolute top-3 right-3 ">
                    <Image src={icon} width={50} height={50} alt="persona" />
                </div>

                <form onSubmit={handleSubmit} method="post">
                    <div className="space-y-5 sm:space-y-5">
                        <h1 className="pt-5 text-base/7 font-semibold text-gray-900">Solicitud de Préstamo</h1>
                        <div className="border-b border-gray-900/40 pb-12">
                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                                {/* Motivo del prestamo */}
                                <div className="col-span-full">
                                    <label className="block text-sm/6 font-medium text-gray-900" htmlFor="motivo">
                                        Motivo del préstamo
                                    </label>
                                    <div className="mt-1">
                                        <div className="flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                            <input
                                                className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                                type="text"
                                                name="motivo"
                                                value={formData.motivo}
                                                onChange={handleChange}
                                                placeholder="Razones de la solicitud"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Monto del prestamo */}
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto">
                                        Monto del préstamo (Límite: {props.limiteCredito.toLocaleString("es-CR", { style: "currency", currency: "CRC" })})
                                    </label>
                                    <div className="mt-1">
                                        <div className="flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                            <input
                                                className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                                type="number"
                                                name="monto"
                                                value={formData.monto == 0 ? '' : formData.monto}
                                                placeholder="Monto a solicitar"
                                                onChange={handleChange}
                                                min={0}
                                                max={props.limiteCredito}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Plazo en meses */}
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900" htmlFor="plazo">
                                        Plazo en meses
                                    </label>
                                    <div className="mt-1">
                                        <div className="flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                            <input
                                                className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                                type="number"
                                                name="plazo"
                                                value={formData.plazo == 0 ? '' : formData.plazo}
                                                placeholder="Plazo meses"
                                                onChange={handleChange}
                                                min={1}
                                                max={24}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Botones */}
                        <div className="mt-6 flex items-center justify-end gap-x-6">
                            <button type="button" onClick={props.onClose} className="text-sm font-semibold leading-6 text-gray-900">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Solicitar Préstamo
                            </button>
                        </div>
                        <div className="mt-3 border border-yellow-900/50  bg-yellow-100 shadow p-2">
                            <p className="dark:text-black" ><strong>Importante:</strong> Todos las solicitudes de préstamos que generan, son enviadas por correo a los socios para que ellos por medio de votación secreta decidan si su préstamo será aprobado o no.</p>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

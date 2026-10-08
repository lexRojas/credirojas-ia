/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { getSocios } from "@/app/api/socio/actions";
import { cerrarSolicitud, listaSolicitudesPendientes } from "@/app/api/solicitudes/actions"
import { formatDateOnly } from "@/lib/date";
import { useEffect, useState } from "react"


interface Voto {
    idVoto: number;
    socioId: number;
    solicitudId: number;
    fecha: string;
    hora: string | null;
    observacion: string | null;
    aprueba: boolean;
    deniega: boolean;
}

interface Socio {
    idSocio: number;
    nombre: string;
}

interface Solicitud {
    idSolicitud: number;
    socioId: number;
    fechaSolicitud: string;
    detalle: string | null;
    monto_solicitado: number;
    aprobada: boolean;
    fechaAprobacion: string | null;
    cerrada: boolean;
    votos: Voto[];
    socio: Socio;
}



export default function Page() {

    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
    const [cantidadSocios, setCantidadSocios] = useState(0)


    useEffect(() => {
        const loadSolicitudes = async () => {
            const data: Solicitud[] = await listaSolicitudesPendientes();
            setSolicitudes(data);
        };


        const loadCantidadSocios = async () => {
            const data = await getSocios();

            const cantidad = data.filter((socio) => (socio.fechaSalida == "")).length;
            setCantidadSocios(cantidad);
        }




        loadSolicitudes(); // Carga inicial
        loadCantidadSocios();

        const intervalId = setInterval(loadSolicitudes, 5000); // Carga cada 5 segundos

        return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
    }, []);


    useEffect(() => {

        const loadSolicitudes = async () => {

            const data = await listaSolicitudesPendientes()



            setSolicitudes(data)


        }
        loadSolicitudes()




    }, [])


    const cerrar = async (idSolicitud: number) => {

        await cerrarSolicitud(idSolicitud)
        setSolicitudes(
            solicitudes.filter((solicitud) => solicitud.idSolicitud !== idSolicitud)

        )


    }




    return (
        <div>


            {/* Tabla con solicitudes pendientes  */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-4 text-center">ID Solicitud</th>
                            <th className="py-3 px-4 text-center">Socio</th>
                            <th className="py-3 px-4 text-center">Fecha Solicitud</th>
                            <th className="py-3 px-4 text-center">Detalle</th>
                            <th className="py-3 px-4 text-center">Monto</th>
                            <th className="py-3 px-4 text-center">Plazo</th>
                            <th className="py-3 px-4 text-center flex flex-col justify-center "><div>
                                <div className="flex-1 text-center border-b">Votos</div>
                                <div className="flex gap-1 justify-center">
                                    <div className="flex flex-1  ">
                                        <p className="text-center w-full">Si</p>
                                    </div>
                                    <div className="flex flex-1 ">
                                        <p className="text-center w-full">No</p>
                                    </div>
                                    <div className="flex flex-1 ">
                                        <p className="text-center w-full">??</p>
                                    </div>

                                </div>

                            </div></th>
                            <th className="py-3 px-4 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {solicitudes.map((solicitud: any) => (
                            <tr key={solicitud.idSolicitud} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-4">{solicitud.idSolicitud}</td>
                                <td className="py-3 px-4">{solicitud.socio.nombre}</td>
                                <td className="py-3 px-4">{formatDateOnly(solicitud.fechaSolicitud)}</td>
                                <td className="py-3 px-4">{solicitud.detalle}</td>
                                <td className="py-3 px-4 text-right">{solicitud.monto_solicitado.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                <td className="py-3 px-4 text-center">{solicitud.plazo} {solicitud.plazo > 1 ? "meses" : "mes"}</td>
                                <td className="py-3 px-4">
                                    <div className="flex flex-1 gap-x-1">
                                        <div className="flex flex-1 border-2 border-green-600  ">
                                            <p className="text-center w-full">


                                                {solicitud.votos.filter((voto: any) => voto.aprueba).length}


                                            </p>
                                        </div>
                                        <div className="flex flex-1 border-2 border-red-600  ">
                                            <p className="text-center w-full">
                                                {solicitud.votos.filter((voto: any) => voto.deniega).length}
                                            </p>
                                        </div>
                                        <div className="flex flex-1 border-2 border-gray-600  ">
                                            <p className="text-center w-full">

                                                {cantidadSocios - solicitud.votos.filter((voto: any) => voto.aprueba).length - solicitud.votos.filter((voto: any) => voto.deniega).length}
                                            </p>
                                        </div>

                                    </div>


                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                                        onClick={() => cerrar(solicitud.idSolicitud)}>
                                        Cerrar Solicitud
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>






        </div>
    )

}

import { GenerarProyeccionInput, generarProyeccionPagos } from "@/lib/calculos";


interface props {
    nombre: string;
    input: GenerarProyeccionInput;
}




export default function Simulador(props: props) {
    const input = props.input;
    const nombre = props.nombre;



    const proy = generarProyeccionPagos(input);

    return (
        <div className="container dark:bg-amber-100/90  pb-3  w-full sm:max-w-1/2 mx-auto  p-4">
            <div className="flex flex-col items-center justify-center mt-10">
                <div className="flex justify-center w-full border bg-green-950">
                    <p className="text-white">PROYECCION DE CREDITO</p>
                </div>

                <div className="flex flex-col w-full p-4 gap-2">
                    <div className="flex w-full">
                        <p className="w-20 font-semibold">Nombre:</p>
                        <p className="flex-1">{nombre}</p>
                    </div>

                    <div className="flex w-full">
                        <p className=" w-20 font-semibold">Monto:</p>
                        <p className="flex-1">{input.monto.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                    </div>

                    <div className="flex w-full">
                        <p className="w-20  font-semibold">Plazo:</p>
                        <p className="flex-1">{'' + input.plazoMeses + ' meses'}</p>
                    </div>
                </div>

                <div className="flex flex-col w-full p-4 gap-2 ">

                    {proy && (
                        <div>
                            <table className="table-auto w-full  ">
                                <thead className="sticky -top-0 bg-gray-600 text-gray-100 uppercase">
                                    <tr>
                                        <th className="w-4 md:w-10 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">#</th>
                                        <th className="w-[85px] md:w-32 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">Fecha</th>
                                        <th className="w-20 md:w-24 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">Cuota</th>
                                        <th className="w-20 md:w-32 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">Capital</th>
                                        <th className="w-20 md:w-24 py-1 border border-gray-300 text-center font-bold p-4 text-xs  sm:text-base">Interés</th>
                                        <th className="w-20 md:w-32 py-1 border border-gray-300 text-center  font-bold p-4 text-xs  sm:text-base">Saldo</th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white text-gray-500">
                                    {proy.map((pago, index) => (
                                        <tr
                                            key={index}
                                            className="py-0 even:bg-slate-400/20 border border-gray-300"
                                        >
                                            <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{index + 1}</td>
                                            <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{pago.fechaPago}</td>
                                            <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base" >{pago.montoCuota.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                            <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{pago.amortizacionCapital.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                            <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{pago.interes.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                            <td className=" border border-gray-300 text-center p-0 md:p-4 text-xs  sm:text-base">{pago.saldoPendiente.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex  justify-evenly font-bold dark:text-black bg-amber-100 border rounded-lg mt-3 p-3" >
                                <p>Total Prestamo: {proy!.reduce((sumatoria, item) => (sumatoria + item.interes + item.amortizacionCapital), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                                <p>Total Intereses: {proy!.reduce((sumatoria, item) => (sumatoria + item.interes), 0).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                                <p>Tasa interés neta: {(proy!.reduce((sumatoria, item) => (sumatoria + item.interes), 0) / input.monto * 100).toFixed(2)}%</p>
                            </div>
                        </div>
                    )}



                </div>



            </div>
        </div>
    );
}

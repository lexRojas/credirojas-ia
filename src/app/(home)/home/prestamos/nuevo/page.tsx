'use client'

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getSaldoCapitalPrestamoByIdSocio, getPrestamoBySocioId, savePrestamo } from "@/app/api/prestamo/actions";
import { prestamo_modalidad } from "@prisma/client";
import ModalBrowse from "@/components/ModalBrowse";
import { getSocios } from "@/app/api/socio/actions";
import { Prestamo, Socio } from "@/types/types";
import { getResumenAccionesByIdSocio } from "@/app/api/acciones/actions";
import ToggleButton from "@/components/ToggleButton";
import { generateReport } from "@/lib/report";
import { addMonths } from "@/lib/tools";


export default function PrestamoForm() {

    const navegate = useRouter()


    const montoSolicitadoAnterior = useRef(0)


    // Estado para almacenar los datos del formulario

    const socioTemplate = {
        socioId: 0,
        cedula: "",
        nombre: "...",
        estado_civil: "...",
        profesion: "...",
        direccion: "...",
        fecha: "...",
        acciones: 0,
        montoAhorrado: 0,
        montoDisponible: 0,
    }


    const blankForm = {
        idPrestamo: 0,
        socioId: 0,
        cedula: "",
        fecha: "",
        fecha_inicio_pago: "",
        monto: 0,
        plazo: 1,
        motivo: "",
        modalidad: "ALEMAN",
        saldoCapital: 0,
        saldoInteresOrdinario: 0,
        saldoInteresMoratorio: 0,
    }


    const [formData, setFormData] = useState(blankForm);
    const [socioData, setSocioData] = useState<Socio[]>()
    const [socioForm, setSocioForm] = useState(socioTemplate)
    const [dataPrestamos, setDataPrestamos] = useState<Prestamo[]>()
    const [editing, setEditing] = useState(false)
    const [toggleModalidad, setToggleModalidad] = useState(false)



    // Estado para almacenar los errores del formulario
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchSocio = async () => {
            try {
                const socio = await getSocios();
                setSocioData(socio);

            } catch (error) {
                console.log(error);
            } finally {

            }
        };

        fetchSocio()

    }, [])


    // Función para manejar cambios en los campos del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: e.target.type === 'number' ?
                Number(value)
                :
                e.target.type === 'checkbox' ?
                    e.target.value
                    :
                    value,
        });

    };

    //Rutina de validacion de formulario
    const validateForm = () => {

        const newErrors: Record<string, string> = {}

        if (formData.monto > (socioForm.montoDisponible + montoSolicitadoAnterior.current)) newErrors.monto = "Monto mayor al disponible"
        if (formData.plazo <= 0) newErrors.plazo = "Plazo mayor a 0"

        setErrors(newErrors);
        return Object.entries(newErrors).length == 0
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await savePrestamo({
                ...formData,
                idPrestamo: editing ? formData.idPrestamo : 0,
                modalidad: formData.modalidad as prestamo_modalidad,
                saldoCapital: formData.monto,
                saldoInteresOrdinario: 0,
                saldoInteresMoratorio: 0,
            }
            ); // Suponiendo que esta función manda los datos al servidor

            toast.success("Registrado correctamente.");
            setFormData(blankForm)
            setSocioForm(socioTemplate)
            setDataPrestamos([])
            setErrors({});
            setEditing(false)



            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            montoSolicitadoAnterior.current = 0;
        }
    };

    const cancelarClick = () => {
        if (editing) {
            setEditing(false)
            setFormData(blankForm)
            setSocioForm(socioTemplate)
            setToggleModalidad(false)
            setDataPrestamos([])
        } else {
            navegate.push("/home")
        }
    }

    //***DEFINO VALORES DEL MODAL ************ */

    const [isModalOpen, setIsModalOpen] = useState(false);


    const columns = {
        cedula: 'Cédula',
        nombre: 'Nombre',
    };

    const filterField = 'nombre'; // Filter by name


    const modalCallBack = async (selectedItem: Socio | null) => {

        setIsModalOpen(false);
        if (selectedItem) {

            const { saldoCapital } = await getSaldoCapitalPrestamoByIdSocio(selectedItem.idSocio)
            const { montoAhorrado, cantidadAcciones, montoDisponible } = await getResumenAccionesByIdSocio(selectedItem.idSocio)
            const saldoDisponible = montoDisponible - saldoCapital

            setSocioForm({
                ...socioForm,
                socioId: selectedItem.idSocio,
                cedula: selectedItem.cedula!,
                nombre: selectedItem.nombre,
                fecha: selectedItem.fechaIngreso!,
                estado_civil: selectedItem.estado_civil!,
                profesion: selectedItem.profesion!,
                direccion: selectedItem.direccion!,
                acciones: cantidadAcciones,
                montoAhorrado: montoAhorrado,
                montoDisponible: saldoDisponible,
            })

            setFormData({
                ...formData,
                socioId: selectedItem.idSocio,
                cedula: selectedItem.cedula!,
                fecha: new Date().toLocaleDateString("en-CA")
            })

            const prestamosSocio = await getPrestamoBySocioId(selectedItem.idSocio);
            if (prestamosSocio) {
                setDataPrestamos(prestamosSocio)
            } else {
                setDataPrestamos([])
            }
            setErrors({});

        }

    }

    const callModal = () => {


        if (socioData!) {
            setIsModalOpen(true);
        }


    }


    //******************************************* */

    const editarPrestamo = (prestamo: Prestamo) => {
        setFormData({
            ...formData,
            idPrestamo: prestamo.idPrestamo,
            socioId: prestamo.socioId,
            fecha: prestamo.fecha,
            fecha_inicio_pago: prestamo.fecha_inicio_pago!,
            monto: prestamo.monto,
            plazo: prestamo.plazo,
            motivo: prestamo.motivo!,
            modalidad: prestamo.modalidad as string,
            saldoCapital: prestamo.saldoCapital,

        }
        )

        montoSolicitadoAnterior.current = prestamo.monto

        setToggleModalidad(prestamo.modalidad == "FRANCES")

        setEditing(true)
    }

    const toggleClickHandler = (value: boolean) => {

        setFormData({
            ...formData,
            modalidad: value ? "FRANCES" : "ALEMAN"
        })
        setToggleModalidad(value)
    }

    const generarPagareClick = async () => {


        const fechaProy = new Date(formData.fecha_inicio_pago + "T00:00:00");


        const data = {
            deudor: {
                nombre: socioForm.nombre,
                direccion: socioForm.direccion,
                estado_civil: socioForm.estado_civil,
                profesion: socioForm.profesion,
                domicilio: socioForm.direccion,
                cedula: socioForm.cedula
            },
            pago: {
                monto_total: formData.monto,
                numero_cuotas: formData.plazo,
                valor_cuota: formData.monto / formData.plazo,
                fecha_pago: fechaProy.getDate(),
                fecha_primer_cuota: formData.fecha_inicio_pago,
                fecha_ultima_cuota: addMonths(fechaProy, formData.plazo-1).toLocaleDateString("en-CA").split("T")[0],
            },
            documento: {
                lugar_suscripcion: "Guápiles, Pococí, Limón",
                hora: new Date().getHours(),
                minuto: new Date().getMinutes(),
                dia: new Date().getDate(),
                mes: ["enero", "febrero", "narzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][new Date().getMonth()],
                anio: new Date().getFullYear(),
            }
        }

        const REPORT_ID = "7940288fe7095ef233f18bd37bb52275b695e5444b056555e386cdc6bcd2a7ac"


        await generateReport(REPORT_ID, data)

    }


    return (
        <div className="container dark:bg-amber-100/90  pb-3  px-3.5 sm:max-w-4xl ">
            <form onSubmit={handleSubmit} method="post">
                <div className="space-y-5 sm:space-y-5 ">
                    <h1 className="pt-5 text-base/7 font-semibold text-gray-900">Registro de Préstamos</h1>
                    <div className="border-b border-gray-900/40 pb-12">
                        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-4 sm:grid-cols-6  sm:gap-x-4">
                            {/* Cedula */}
                            <div className="col-span-2 sm:col-span-1 ">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="cedula">Cédula</label>
                                <div className="mt-1">
                                    <div className="grid grid-cols-1">
                                        <input
                                            type="number"
                                            name="cedula"
                                            value={formData.cedula}
                                            onChange={handleChange}
                                            className={`col-start-1 row-start-1 appearance-none  ${editing ? " bg-amber-950/10" : " bg-white"}  py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                                            required
                                            disabled={editing}


                                        />
                                        <svg
                                            onClick={callModal}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className=" col-start-1 row-start-1 mr-2 size-6 self-center justify-self-end  cursor-pointer  text-gray-500 sm:size-6">
                                            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                                        </svg>

                                    </div>

                                </div>
                            </div>
                            {/* Nombre */}
                            <div className="col-span-2 sm:col-span-3 ">
                                <div className="block text-sm/6 font-medium text-gray-900">Nombre</div>
                                <div className="mt-1">
                                    <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                        {socioForm.nombre}
                                    </div>
                                </div>
                            </div>
                            {/* Correo */}
                            <div className="col-span-1 sm:col-span-2">
                                <div className="block text-sm/6 font-medium text-gray-900">Fecha Ingreso</div>
                                <div className="mt-1">
                                    <div className="mt-1">
                                        <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                            {socioForm.fecha}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Teléfono */}
                            <div className="col-span-1 sm:col-span-2">
                                <div className="block text-sm/6 font-medium text-gray-900"># Acciones</div>
                                <div className="mt-1">
                                    <div className="mt-1">
                                        <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                            {socioForm.acciones}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Fecha Nacimiento */}
                            <div className=" sm:col-span-2">
                                <div className="block text-sm/6 font-medium text-gray-900">Monto Ahorrado</div>
                                <div className="mt-1">
                                    <div className="mt-1">
                                        <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                            {socioForm.montoAhorrado.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Fecha Ingreso  */}
                            <div className="sm:col-span-2">
                                <div className="block text-sm/6 font-medium text-gray-900">Monto Disponible</div>
                                <div className="mt-1">
                                    <div className="mt-1">
                                        <div className="block min-w-0 grow border-b border-b-amber-950/50  bg-amber-950/10 py-1.5 pr-3 pl-2 text-base text-gray-900 sm:text-sm/6" >
                                            {socioForm.montoDisponible.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Roll  */}
                            <div className="col-span-2 sm:col-span-4">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="motivo">Motivo del Préstamo</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="text"
                                            name="motivo"
                                            value={formData.motivo}
                                            onChange={handleChange}
                                            placeholder="Razones por las cuales hace la solicitud"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Monto */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="monto">Monto Solicitado</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="number"
                                            name="monto"
                                            value={formData.monto}
                                            onChange={handleChange}
                                            min={0}
                                            required
                                        />
                                    </div>
                                    {errors.monto && (
                                        <div className="text-red-500 text-sm/5">{errors.monto}</div>
                                    )}
                                </div>
                            </div>
                            {/* Plazo en meses */}
                            <div className="sm:col-span-1">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="plazo">Plazo Meses</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="number"
                                            name="plazo"
                                            value={formData.plazo}
                                            onChange={handleChange}
                                            min={1}
                                            required
                                        />
                                    </div>
                                    {errors.plazo && (
                                        <div className="text-red-500 text-sm/5">{errors.plazo}</div>
                                    )}


                                </div>
                            </div>
                            {/* Fecha primer pago */}
                            <div className="sm:col-span-1">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="fecha_inicio_pago">Fecha Pago</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="date"
                                            name="fecha_inicio_pago"
                                            value={formData.fecha_inicio_pago}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {errors.plazo && (
                                        <div className="text-red-500 text-sm/5">{errors.plazo}</div>
                                    )}


                                </div>
                            </div>
                            {/* Modalidad */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="password">Modalidad</label>
                                <div className="mt-1">
                                    <div className="flex  gap-2 justify-around my-auto ">



                                        <div className="flex  justify-center gap-1  min-w-0 grow  py-1.5 pr-3 pl-1 text-base text-gray-900 sm:text-sm/6">
                                            <ToggleButton value={toggleModalidad} toggleClick={toggleClickHandler} />
                                            <span >{toggleModalidad ? "FRANCES" : "ALEMAN"} </span>
                                        </div>



                                    </div>
                                </div>


                            </div>
                            {/* Botón de Submit */}
                            <div className="col-span-2 sm:col-span-2 mt-3 flex align-baseline justify-evenly sm:justify-end gap-x-6">
                                <button
                                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    type="submit">
                                    {editing ? "Actualizar" : "Registrar Préstamo"}
                                </button>
                                <button
                                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    onClick={cancelarClick}
                                    type="button">
                                    Cancelar
                                </button>
                                <button
                                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    onClick={generarPagareClick}
                                    type="button">
                                    Pagare
                                </button>

                            </div>
                        </div> {/* Fin del grid */}
                    </div> {/* Fin del border-b */}
                    <div className="  max-h-60 overflow-y-scroll">
                        <table className="table-auto w-full ">
                            <thead className="sticky -top-0 uppercase bg-[#6b7280] text-[#e5e7eb]" >
                                <tr>
                                    <th className="w-[80px] py-1 border  border-gray-300 text-center font-bold p-4" >ID</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">FECHA</th>
                                    <th className="py-1 border  border-gray-300 text-center font-bold p-4">MOTIVO</th>
                                    <th className="hidden sm:table-cell py-1 border  border-gray-300 text-center font-bold p-4">MONTO</th>
                                    <th className="hidden sm:table-cell py-1 border  border-gray-300 text-center font-bold p-4">PLAZO</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-500 ">
                                {dataPrestamos && dataPrestamos.map((prestamo, index) => (
                                    <tr key={index}
                                        className="py-0   even:bg-slate-400/20 hover:bg-amber-400/50 hover:cursor-pointer"
                                        onClick={() => editarPrestamo(prestamo)}
                                    >
                                        <td className="py-0 border  border-gray-300 text-center  p-4" >{prestamo.idPrestamo} </td>
                                        <td className="py-0 border  border-gray-300 text-center  p-4">{prestamo.fecha} </td>
                                        <td className="py-0 border  border-gray-300 text-left  p-4">{prestamo.motivo}  </td>
                                        <td className="py-0 border  border-gray-300 text-right  p-4"> {prestamo.monto.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}  </td>
                                        <td className="py-0 border  border-gray-300 text-center  p-4"> {prestamo.plazo}  </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div >
            </form>

            <ModalBrowse
                isOpen={isModalOpen}
                data={socioData!}
                title="Lista de Socios"
                columns={columns}
                filterField={filterField}
                onClose={modalCallBack} />

        </div>

    );
}


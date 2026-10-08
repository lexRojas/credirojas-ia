'use client'

import { useEffect, useState } from "react";
import { getSocioById, saveSocio, updateSocio } from "@/app/api/socio/actions"
import { Rol, } from "@/types/types";
import { getRoles } from "@/app/api/rol/actions";

import { SocioSchema } from "@/lib/zod-schemas";
import { toast } from "react-toastify";
import { hashPassword } from "@/lib/auth";


interface SocioProps {
    idSocio?: number;
    modo?: string;
    onClose?: () => void;
}


export default function SocioForm({ idSocio, modo, onClose }: SocioProps) {



    // Estado para almacenar los datos del formulario

    const blankForm = {
        idSocio: 0,
        nombre: "",
        cedula: "",
        correo: "",
        direccion: "",
        estado_civil: "",
        profesion: "",
        telefono: "",
        fechaNacimiento: "",
        fechaIngreso: "",
        fechaSalida: "",
        username: "",
        password: "",
        rolId: 1,
        montoAccion: 1,
        multiplicador: 1,
    }


    const [formData, setFormData] = useState(blankForm);
    const [errors, setErrors] = useState<Record<string, string[]>>({});



    //Variable que maneja los roles 
    const [roles, setRoles] = useState<Rol[]>()

    useEffect(() => {


        // Al cambiar el modo y idSocio, se obtiene el socio solo si estamos en modo "EDIT"
        if (modo === "EDIT" && idSocio) {
            const fetchSocio = async (id: number) => {
                try {
                    const socio = await getSocioById(id);
                    if (!socio) {
                        setFormData(blankForm);
                    } else {
                        setFormData({
                            idSocio: socio.idSocio,
                            nombre: socio.nombre,
                            cedula: socio.cedula!,
                            correo: socio.correo,
                            direccion: socio.direccion!,
                            estado_civil: socio.estado_civil!,
                            profesion: socio.profesion!,
                            telefono: socio.telefono!,
                            fechaNacimiento: socio.fechaNacimiento!,
                            fechaIngreso: socio.fechaIngreso!,
                            fechaSalida: socio.fechaSalida!,
                            username: socio.username,
                            password: socio.password,
                            rolId: socio.rolId!,
                            montoAccion: socio.montoAccion,
                            multiplicador: socio.multiplicador!,
                        });
                    }
                } catch (error) {
                    console.log(error);
                } finally {

                }
            };
            fetchSocio(idSocio); // Fetch the socio by id
        } else {
            // Si es "NEW", no se hace nada
            setFormData(blankForm);
        }

        const fetchRoles = async () => {
            try {
                const roles = await getRoles()
                setRoles(roles)
            } catch (error) {
                console.log(error)
            }
        }
        fetchRoles()


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modo, idSocio])

    // Función para manejar cambios en los campos del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "rolId" ? parseInt(value) : value,
        });

    };

    //Rutina de validacion de formulario
    const validateForm = () => {
        const result = SocioSchema.safeParse(formData);

        if (!result.success) {
            const zodErrors: Record<string, string[]> = {};
            result.error.issues.forEach((err) => {
                const key = err.path[0] as string;
                if (!zodErrors[key]) zodErrors[key] = [];
                zodErrors[key].push(err.message);
            });
            setErrors(zodErrors);
            return false;
        }

        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {


            const password = await hashPassword(formData.password)

            if (modo === "EDIT") {
                await updateSocio({ ...formData, password: password! }); // Suponiendo que esta función manda los datos al servidor
                if (onClose) onClose()
            } else {
                await saveSocio({ ...formData, password: password! }); // Suponiendo que esta función manda los datos al servidor
                setFormData(blankForm)
            }
            toast.success("Registrado correctamente.");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // const cancelarClick = () => {
    //     navegate.push("/home")
    // }

    const cerrar = () => {
        if (modo !== "EDIT") {
            setFormData(blankForm)
        } else {
            if (onClose) onClose()
        }
    }


    return (
        <div className="container dark:bg-amber-100/90  pb-3  px-3.5 sm:max-w-2xl  ">
            <form onSubmit={handleSubmit} method="post">
                <div className="dark:text-white space-y-10 sm:space-y-10">
                    <h1 className="pt-5 text-base/7 font-semibold text-gray-900">Registrar Socio</h1>
                    <div className="border-b border-gray-900/40 pb-12">
                        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-8 sm:grid-cols-6">
                            {/* Cedula */}
                            <div className="col-span-2 ">
                                <label className="block text-sm/6 font-medium text-gray-900  " htmlFor="cedula">Cédula</label>
                                <div className="mt-1">
                                    <div className={`flex items-center ${modo == "EDIT" ? " bg-slate-400/30" : "bg-white"}  pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600`}>
                                        <input
                                            className={`block min-w-0 grow   py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6`}
                                            type="number"
                                            name="cedula"
                                            value={formData.cedula}
                                            onChange={handleChange}
                                            required
                                            disabled={modo === "EDIT"}
                                        />
                                    </div>
                                    {errors.cedula &&
                                        errors.cedula.map((error) => (
                                            <div className="text-red-500 text-sm/4 mt-1" key={error}>
                                                {error}
                                            </div>
                                        ))}
                                </div>
                            </div>
                            {/* Nombre */}
                            <div className="col-span-2  sm:col-span-4">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="nombre">Nombre</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.nombre && <div className="text-red-500 text-sm/4 mt-1"> {errors.nombre}</div>}
                                </div>
                            </div>
                            {/* Estado civil */}
                            <div className="col-span-2  sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="estado_civil">Estado Civil</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="text"
                                            name="estado_civil"
                                            value={formData.estado_civil}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.nombre && <div className="text-red-500 text-sm/4 mt-1"> {errors.nombre}</div>}
                                </div>
                            </div>
                            {/* Ocupacion */}
                            <div className="col-span-2  sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="profesion">Ocupación</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="text"
                                            name="profesion"
                                            value={formData.profesion}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.nombre && <div className="text-red-500 text-sm/4 mt-1"> {errors.nombre}</div>}
                                </div>
                            </div>
                            {/* Direccion */}
                            <div className="col-span-2  sm:col-span-6">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="direccion">Direccion</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.nombre && <div className="text-red-500 text-sm/4 mt-1"> {errors.nombre}</div>}
                                </div>
                            </div>
                            {/* Correo */}
                            <div className="col-span-2 sm:col-span-4">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="correo">Correo</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="email"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.correo &&
                                        errors.correo.map((error) => (
                                            <div className="text-red-500 text-sm/4 mt-1" key={error}>
                                                {error}
                                            </div>
                                        ))}
                                </div>
                            </div>
                            {/* Teléfono */}
                            <div className="col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="telefono">Teléfono</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.telefono && <div className="text-red-500 text-sm/4 mt-1" >{errors.telefono}</div>}
                                </div>
                            </div>
                            {/* Fecha Nacimiento */}
                            <div className=" sm:col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="date"
                                            name="fechaNacimiento"
                                            value={formData.fechaNacimiento}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Fecha Ingreso  */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="fechaIngreso">Fecha de Ingreso</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="date"
                                            name="fechaIngreso"
                                            value={formData.fechaIngreso}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Roll  */}
                            <div className="col-span-2">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="rolId">Rol de Socio</label>
                                <div className="mt-1 grid grid-cols-1">
                                    <select
                                        className="col-start-1 row-start-1 w-full appearance-none  bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        name="rolId"
                                        value={formData.rolId}
                                        onChange={handleChange}
                                    >
                                        {roles && roles.map((rol) => (
                                            <option key={rol.idRol} value={rol.idRol}>{rol.descripcion} </option>
                                        ))}
                                    </select>
                                    <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4">
                                        <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {/* Usuario */}
                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="username">Nombre Usuario</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {errors.username && <div className="text-red-500 text-sm/4 mt-1" >{errors.username}</div>}
                                </div>
                            </div>
                            {/* Contraseña */}
                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900" htmlFor="password">Password</label>
                                <div className="mt-1">
                                    <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <input
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {errors.password && <div className="text-red-500 text-sm/4 mt-1" >{errors.password}</div>}
                                </div>
                            </div>

                        </div> {/* Fin del grid */}
                    </div> {/* Fin del border-b */}
                    {/* Botón de Submit */}
                    <div className="mt-3 flex items-center justify-end gap-x-6">
                        <button
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="submit">
                            {modo === "NEW" ? "Registrar Socio" : "Actualizar Socio"}
                        </button>
                        <button
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            onClick={cerrar}
                            type="button">
                            Cancelar
                        </button>
                    </div>
                </div >
            </form>
        </div>

    );
}

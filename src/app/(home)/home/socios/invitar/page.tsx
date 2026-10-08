"use client";

import { sendMailInvitacionSocio } from "@/app/api/socio/actions";
import { useState } from "react";
import { toast } from "react-toastify";

interface SocioInvitacionProps {
  onClose?: () => void;
}

type FormData = {
  cedula: string;
  nombre: string;
  correo: string;
};

export default function SocioInvitacionForm({ onClose }: SocioInvitacionProps) {
  const blankForm: FormData = {
    cedula: "",
    nombre: "",
    correo: "",
  };

  const [formData, setFormData] = useState<FormData>(blankForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validación simple (mismo enfoque que tu ejemplo)
  const validateForm = () => {
    const nextErrors: Record<string, string[]> = {};

    if (!formData.cedula?.trim()) nextErrors.cedula = ["La cédula es requerida."];
    if (!formData.nombre?.trim()) nextErrors.nombre = ["El nombre es requerido."];

    if (!formData.correo?.trim()) {
      nextErrors.correo = ["El correo es requerido."];
    } else {
      // Validación básica de email (puedes reemplazar por Zod si ya lo tienes)
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo);
      if (!emailOk) nextErrors.correo = ["El correo no tiene un formato válido."];
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Aquí llamas tu acción real, ej:
      // await enviarInvitacionSocio(formData)
      // Por ahora solo simulo:
      console.log("Invitación:", formData);


      const input = {
        data: {
          cedula: formData.cedula,
          nombre: formData.nombre,
          correo: formData.correo
        }
      }


      await sendMailInvitacionSocio(input)

      toast.success("Invitación enviada correctamente.");
      setFormData(blankForm);
      if (onClose) onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al enviar invitación.";
      toast.error(message);
    }
  };

  const cerrar = () => {
    setFormData(blankForm);
    if (onClose) onClose();
  };

  return (
    <div className="container dark:bg-amber-100/90 pb-3 px-3.5 sm:max-w-2xl">
      <form onSubmit={handleSubmit} method="post">
        <div className="dark:text-white space-y-10 sm:space-y-10">
          <h1 className="pt-5 text-base/7 font-semibold text-gray-900">
            Enviar invitación a nuevo socio
          </h1>

          <div className="border-b border-gray-900/40 pb-12">
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-8 sm:grid-cols-6">
              {/* Cedula */}
              <div className="col-span-2">
                <label
                  className="block text-sm/6 font-medium text-gray-900"
                  htmlFor="cedula"
                >
                  Cédula
                </label>
                <div className="mt-1">
                  <div className="flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                      type="number"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      required
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
              <div className="col-span-2 sm:col-span-4">
                <label
                  className="block text-sm/6 font-medium text-gray-900"
                  htmlFor="nombre"
                >
                  Nombre
                </label>
                <div className="mt-1">
                  <div className="flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.nombre &&
                    errors.nombre.map((error) => (
                      <div className="text-red-500 text-sm/4 mt-1" key={error}>
                        {error}
                      </div>
                    ))}
                </div>
              </div>

              {/* Correo */}
              <div className="col-span-2 sm:col-span-6">
                <label
                  className="block text-sm/6 font-medium text-gray-900"
                  htmlFor="correo"
                >
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <div className="flex items-center bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      required
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
            </div>
          </div>

          {/* Botones */}
          <div className="mt-3 flex items-center justify-end gap-x-6">
            <button
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              type="submit"
            >
              Enviar invitación
            </button>

            <button
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              type="button"
              onClick={cerrar}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

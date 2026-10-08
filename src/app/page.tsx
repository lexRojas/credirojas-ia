'use client'



import { useState } from "react";
import { validarPassword } from "@/app/api/usuarios/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from '../../public/images/logo.png'



export default function Home() {


  const navegate = useRouter()


  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    

    const verificarAcceso = async () => {
      try {
        const response = await validarPassword(formData);

        if (response.success) {

          sessionStorage.setItem('username', formData.username);
          sessionStorage.setItem('rol', response.rol!.toString())
          sessionStorage.setItem('idSocio', response.idSocio!.toString())

          if (response.rol === 1)
            navegate.push("/socio")
          else
            navegate.push("/home")


        } else {
          toast.error("Acceso denegado");
        }
      } catch (error) {
        console.error("Error al verificar el acceso:", error)
      }
    }

    verificarAcceso();
  };


  const olvideMiContraseña = () => {

    navegate.push("/forgot")


  }



  return (
    <div className="container w-full md:w-1/4 mx-auto h-screen flex flex-col items-center justify-center ">
      <div className=" flex flex-col items-center justify-center  w-full ">
        <header className="mb-3.5 flex flex-col items-center justify-center w-full  ">
          <Image src={logo} width={150} alt="Logo" className="logo-login" />
          {/* <h1 className="happy">CrediRojas</h1> */}
          <h1 className="pt-4 font-bold text-xl/1 text-center text-gray-400">Ingreso al Sistema</h1>
        </header>

        <div className="mt-3 w-full p-5
        ">
          <form onSubmit={handleSubmit} method="post">
            {/* USUARIO */}
            <div className="border-b border-gray-900/40 pb-12 grid grid-cols-1 gap-x-6 gap-y-2 ">
              <div>
                <label
                  className="block text-sm/6 font-medium text-gray-900"
                  htmlFor="usuario">
                  Usuario </label>
                <div className="mt-1">
                  <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required>
                    </input>
                  </div>
                </div>
              </div>
              {/* PASSWORD */}
              <div >
                <label
                  className="block text-sm/6 font-medium text-gray-900"
                  htmlFor="password">
                  Password </label>
                <div className="mt-1">
                  <div className="flex items-center  bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required>
                    </input>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTON */}

            <div className="mt-5 grid grid-cols-1 w-full gap-y-2">
              <button
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                type="submit"  >
                Ingresar
              </button>
              <button
                className=" px-3 py-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
                type="button"
                onClick={olvideMiContraseña} >
                Olvide mi contraseña
              </button>
            </div>



          </form>



        </div>


      </div>
    </div>
  );
}

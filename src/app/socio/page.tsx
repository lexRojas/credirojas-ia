'use client'

import DashboardSocio from "@/components/DashboardSocio";
import { useRouter } from "next/navigation"




const Page = () => {

    const navegate = useRouter()


    const irReglamento = () => {
        navegate.push("/reglamento")

    }

    return (

        <div>


            <DashboardSocio />
            {/* VER REGLAMENTO  */}
            <div className="max-w-3xl mx-auto flex flex-col  md:flex-row gap-1 border p-4 rounded-xl  shadow-md shadow-amber-950/50 bg-amber-50">
                <button
                    className="bg-blue-950 p-2 rounded-xl text-white font-bold px-3 mx-auto hover:text-yellow-500 cursor-pointer "
                    type="button"
                    onClick={irReglamento}>VER REGLAMENTO </button>
            </div>

        </div>

    )
}

export default Page;
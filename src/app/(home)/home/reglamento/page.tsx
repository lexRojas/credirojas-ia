'use client'

import { useRouter } from "next/navigation";

import ReglamentoCredirojas from "@/components/staticPages/Reglamento";




export default function Reglamento() {

    const navegate = useRouter()



    const irDashboard = () => {

        navegate.back()

    }

    return (
        <div>
            <div>
                <ReglamentoCredirojas />
            </div>
            <div className="flex w-full">
                <button
                    className="bg-blue-950 rounded-xl px-3 py-2 text-white hover:text-amber-400 mx-auto"
                    type="button"
                    onClick={irDashboard}
                >
                    Volver al Dashboard
                </button>
            </div>
        </div>
    )
}
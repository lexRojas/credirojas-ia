import Image from "next/image";
import img from "@/../public/images/construccion.jpg"



export default function Construccion() {


    return (
        <div className="flex flex-col justify-center items-center h-screen space-y-8">
            <h1 className="text-3xl font-semibold text-amber-950">Estamos trabajando mientras tu duermes...!</h1>
            <Image src={img} width={500} alt="logo construccion" />
        </div>
    )


}
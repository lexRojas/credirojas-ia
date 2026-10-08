
import { prisma } from "@/lib/prisma";
import { todayCR } from "@/lib/date";
import Image from "next/image";
import funlogo from "../../../public/images/fun.png";
import ups from "../../../public/images/ups.png";
import grinch from "../../../public/images/grinch.webp";

// (Opcional) evitar caching de esta página
export const dynamic = "force-dynamic";

export default async function Page({
    searchParams,
}: {
    searchParams: { token?: string, code: string };
}) {
    try {
        const { token, code } = await searchParams;



        if (!token || token.trim().length === 0) {
            return (
                <InvalidTokenCard
                    message="Token no proporcionado o inválido."
                />
            );
        }

        if (!code || code.trim().length === 0) {
            return (
                <InvalidTokenCard
                    message="Respuesta no proporcionado o inválido."
                />
            );
        }

        let aprobadoResult = false;
        let denegadoResult = false;

        if (code === '1') {
            aprobadoResult = true;
        } else {
            denegadoResult = true;
        }




        // Hash
        // OJO: hashToken debe ser una función pura/async disponible en server
        const { hashToken } = await import("@/lib/auth");
        const tokenHash = await hashToken(token);

        // Transacción para validar y consumir el token + crear voto
        const now = new Date();
        const result = await prisma.$transaction(async (tx) => {
            const vt = await tx.votacionToken.findFirst({
                where: {
                    tokenHash,
                    expiresAt: { gte: now },
                    // si agregas usedAt: { equals: null }
                },
            });

            if (!vt || vt.socioId == null) {
                return { ok: false as const, reason: "invalid-or-expired" };
            }

            // Crear el voto
            const voto = await tx.votacion.create({
                data: {
                    socioId: vt.socioId,
                    solicitudId: vt.idSolicitud,
                    fecha: todayCR(),
                    aprueba: aprobadoResult,
                    deniega: denegadoResult
                },
            });

            // Consumir token: eliminar o marcar usedAt
            await tx.votacionToken.delete({
                where: { id: vt.id }, // asumiendo que el model tiene 'id'
            });
            // Alternativa si agregas usedAt al modelo:
            // await tx.votacionToken.update({ where: { id: vt.id }, data: { usedAt: now } });

            return { ok: true as const, votoId: voto.idVoto };
        });

        if (!result.ok) {
            return (
                <InvalidTokenCard
                    message="¡Lo lamento! Es probable que el tiempo para votar haya vencido o el enlace sea inválido."
                />
            );
        }

        // Todo OK

        if (code === "1") return <SuccessCard />;
        if (code === "0") return <DenegateCard />;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // Log opcional: console.error("Votación error:", error);
        return (
            <div className="w-11/12 sm:max-w-lg mt-4 mx-auto p-6 border-2 rounded-2xl shadow-2xl bg-white">
                <h1 className="text-xl font-semibold mb-2">Se presentó un error en el servidor.</h1>
                <p className="text-sm text-gray-600 break-all">{String(error)}</p>
            </div>
        );
    }
}

// --- Componentes UI reutilizables ---

function InvalidTokenCard({ message }: { message: string }) {
    return (
        <div className="w-11/12 sm:max-w-lg mt-4 mx-auto p-6 border-2 rounded-2xl shadow-2xl bg-white">
            <div className="flex flex-col justify-center">
                <h1 className="text-2xl text-center font-semibold mb-4">
                    CrediRojas - Sistema de préstamos
                </h1>
                <hr />
                <div className="flex justify-center">
                    <Image src={ups} width={150} height={150} alt="Ups" />
                </div>
                <div className="flex flex-col text-center mt-4 font-bold text-2xl text-red-500">
                    <p>¡Lo lamento!</p>
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
}

function SuccessCard() {
    return (
        <div className="w-11/12 sm:max-w-lg mt-4 mx-auto p-6 border-2 rounded-2xl shadow-2xl bg-white">
            <div className="flex flex-col justify-center">
                <h1 className="text-2xl text-center font-semibold mb-4">
                    CrediRojas - Sistema de préstamos
                </h1>
                <hr />
                <div className="flex justify-center">
                    <Image src={funlogo} width={150} height={150} alt="Fun" />
                </div>
                <div className="flex flex-col text-center mt-4 animate-pulse font-bold text-2xl text-green-900">
                    <p>¡Muchas gracias!</p>
                    <p>Has hecho posible los sueños de un socio.</p>
                </div>
            </div>
        </div>
    );
}


function DenegateCard() {
    return (
        <div className="w-11/12 sm:max-w-lg mt-4 mx-auto p-6 border-2 rounded-2xl shadow-2xl bg-white">
            <div className="flex flex-col justify-center">
                <h1 className="text-2xl text-center font-semibold mb-4">
                    CrediRojas - Sistema de préstamos
                </h1>
                <hr />
                <div className="flex justify-center">
                    <Image src={grinch} width={150} height={150} alt="Fun" />
                </div>
                <div className="flex flex-col text-center mt-4 animate-pulse font-bold text-2xl text-green-900">
                    <p>Sé que no es una decisión fácil</p>
                    <p>Pero te informo que asi te ven los socios.</p>
                    <p className="text-blue-900">Por suerte el voto es secreto y nadie lo tiene que saber!.</p>
                </div>
            </div>
        </div>
    );
}

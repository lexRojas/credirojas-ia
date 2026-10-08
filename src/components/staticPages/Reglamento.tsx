"use client";

import { useEffect, useMemo, useState } from "react";
import logo from '@/../public/images/logo.png'
import Image from "next/image";


type Counts = {
    visible: number;
    total: number;
};

export default function ReglamentoCredirojas() {
    const [query, setQuery] = useState<string>("");
    const [counts, setCounts] = useState<Counts>({ visible: 0, total: 0 });

    const countLabel = useMemo(() => {
        if (!counts.total) return "";
        return counts.visible === counts.total
            ? `Mostrando ${counts.total} artículos.`
            : `Mostrando ${counts.visible} de ${counts.total} artículos (filtro activo).`;
    }, [counts]);

    useEffect(() => {
        const cards = Array.from(document.querySelectorAll<HTMLElement>(".doc-card"));
        const total = cards.length;

        const term = (query || "").trim().toLowerCase();
        let visible = 0;

        for (const card of cards) {
            const haystack = (card.dataset.search || "").toLowerCase();
            const match = !term || haystack.includes(term);
            card.classList.toggle("hidden", !match);
            if (match) visible++;
        }

        setCounts({ visible, total });
    }, [query]);

    return (
        <div className=" text-slate-900">
            <header className="border-b bg-white/80 backdrop-blur">
                <div className="mx-auto max-w-6xl px-2 py-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex justify-center">
                            <Image src={logo} alt="logo" width={100} />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-500">Documento</p>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reglamento de CrediRojas</h1>

                        </div>
                        <div className="w-full sm:w-80">
                            <label htmlFor="q" className="sr-only">Buscar</label>
                            <div className="relative">
                                <input id="q" type="search" placeholder="Buscar en el reglamento…"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100" value={query} onChange={(e) => setQuery(e.target.value)} />
                                <svg className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 21l-4.3-4.3"></path>
                                    <circle cx="11" cy="11" r="7"></circle>
                                </svg>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{countLabel}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-1 py-8">
                <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
                    <aside className="lg:sticky lg:top-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-semibold text-slate-700">Índice</h2>
                            <nav className="w-2.5 mt-3 text-sm md:flex ">
                                <a className="block rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50" href="#capitulo-i">Capítulo I</a>
                                <a className="block rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50" href="#capitulo-ii">Capítulo II</a>
                                <a className="block rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50" href="#capitulo-iii">Capítulo III</a>
                                <a className="block rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50" href="#capitulo-iv">Capítulo IV</a>
                                <a className="block rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50" href="#capitulo-v">Capítulo V</a>
                                <a className="block rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50" href="#capitulo-vi">Capítulo VI</a>

                            </nav>
                            <p className="mt-4 text-xs leading-relaxed text-slate-500">
                                Consejo: use el buscador para filtrar por “ART”, “Asamblea”, “multas”, “crédito”, etc.
                            </p>
                        </div>
                    </aside>

                    <section className="space-y-6">
                        <section id="capitulo-i" className="scroll-mt-24">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capítulo I</p>
                                <h2 className="mt-1 text-xl font-bold">Constitución, denominación social, duración, fines y artículos varios</h2>
                            </div>

                            <div className="mt-4 space-y-4">
                                <article className="doc-card" data-search="capitulo i art1 se constituye un nuevo grupo credirojas duración indefinido">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 1</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Se constituye un nuevo grupo con la denominación social “Credirojas” y con tiempo de duración indefinido.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="capitulo i art2 domicilio legal polideportivo rogelio alvarado guapiles pococi limon">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 2</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">El domicilio legal del grupo está ubicado en del polideportivo Rogelio Alvarado 1 km norte, entrada calle Lillian 400 mtr oeste. Guápiles. Pococí Limó.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="capitulo i art3 objetivos ahorrar para aprender calidad de vida necesidades básicas vulnerabilidad emprendimientos">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 3</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Los objetivos del grupo estarán siempre alineados con los del programa AHORRAR PARA APRENDER. Estos objetivos son los siguientes:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Contribuir de forma auto-sostenible a fortalecer y mejorar la calidad de vida de las familias de los socios que forman el grupo y de sus comunidades.</li>
                                            <li>Contribuir a satisfacer las necesidades básicas de las familias.</li>
                                            <li>Contribuir a reducir sus dependencias (su vulnerabilidad).</li>
                                            <li>Contribuir a mejorar sus emprendimientos.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="capitulo i art4 formación financiera administrativa autogobierno hábito del ahorro acceso al crédito autoestima derecho">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 4</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Para lograr los objetivos planteados por el programa, se fomentará en el grupo:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>La formación financiera y administrativa de los socios, así como las capacidades de autogobierno.</li>
                                            <li>El hábito del ahorro (acciones) a largo plazo.</li>
                                            <li>El acceso al crédito a las familias asociadas.</li>
                                            <li>La autoestima y derecho de los socios.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="capitulo i art5 gobernabilidad confianza mutua máximo socios cuarenta 40 nuevo grupo">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 5</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Se acuerda que, por mantener unas buenas condiciones de gobernabilidad y confianza mutua, el número máximo de socios del grupo será de cuarenta (40). En caso de que el interés generado por el grupo en otras personas exceda claramente esta cifra, se procederá a crear un nuevo grupo.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="capitulo i art6 actividades compra de acción ahorro concesión de crédito formación instrumento financiero bajo riesgo comercio">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 6</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">En el grupo se efectuarán principalmente las siguientes actividades:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Compra de acción (ahorro).</li>
                                            <li>Concesión de Crédito.</li>
                                            <li>Formación a los socios.</li>
                                            <li>Instrumento financiero de bajo riesgo.</li>
                                            <li>Se deja abierto a la posibilidad a actividades de comercio, siempre y cuando la mayoría de la asamblea este de acuerdo.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="capitulo i art7 obligatoriedad reglamento obligatorio cumplimiento todos los grupos socios">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 7. Obligatoriedad</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">El presente Reglamento es de obligatorio cumplimiento para todos los grupos y sus socios.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section id="capitulo-ii" className="scroll-mt-24">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capítulo II</p>
                                <h2 className="mt-1 text-xl font-bold">Dirección y administración del grupo</h2>
                            </div>

                            <div className="mt-4 space-y-4">
                                <article className="doc-card" data-search="capitulo ii art8 dirección administración órganos asamblea general junta directiva comité crédito nuevos socios tecnología recuperación vigilancia">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 8</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La dirección y administración del grupo estará a cargo de los órganos siguientes:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Asamblea General</li>
                                            <li>Junta Directiva</li>
                                            <li>Comité de Crédito</li>
                                            <li>Comité de Nuevos Socios</li>
                                            <li>Comité de tecnología</li>
                                            <li>Comité de Recuperación</li>
                                            <li>Junta de Vigilancia</li>
                                        </ol>
                                        <p className="mt-3 leading-relaxed text-slate-700">La Asamblea General y la Junta Directiva funcionan desde la constitución de todos los grupos. El resto de comités se implementarán a medida que vaya siendo necesarios.</p>
                                    </div>
                                </article>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-700">Sobre la Asamblea General</p>
                                </div>

                                <article className="doc-card" data-search="art9 asamblea general integrada todos socios">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 9</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Asamblea General estará integrada por todos los socios del grupo.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art10 asamblea general autoridad suprema voluntad colectiva">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 10</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Asamblea General, legalmente convocada y reunida, es la autoridad suprema del grupo y expresa la voluntad colectiva de la misma.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art11 sesiones ordinarias extraordinarias">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 11</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Las sesiones de Asamblea General podrán ser ordinarias y extraordinarias.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art12 asamblea general ordinaria una vez cada 3 meses">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 12</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Asamblea General Ordinaria se reunirá una vez cada 3 meses.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art13 asamblea general extraordinaria dos semanas anticipación equipo directivo">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 13</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Asamblea General extraordinaria se reunirá en cualquier tiempo, cuando se estime necesario. Si se necesita de una asamblea extraordinaria con el equipo directivo, se debe informar con al menos dos semanas de anticipación.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art14 asambleas local acordado seguridad evitar la calle">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 14</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Las asambleas ordinarias y extraordinarias se llevarán a cabo en el local acordado. Se deberá tener en cuenta las condiciones de seguridad del local, evitando la calle como zona de reunión.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art15 asambleas ordinarias elegir destituir miembros presupuesto planes informes aprobar solicitudes ingreso retiro expulsión sanciones modificar estatutos reglamentos">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 15</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Las asambleas generales ordinarias se reunirán para tratar uno(s) o más asuntos siguientes:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Elegir o destituir a los miembros del Consejo de Administración, Comité de Crédito, Comité de nuevos socios, Comité Tecnológico y los comités que no ejerza sus funciones.</li>
                                            <li>Debatir y aprobar el presupuesto y planes de trabajo.</li>
                                            <li>Conocer los informes del Consejo de Administración, Junta de Vigilancia, Comités y Auditoria.</li>
                                            <li>Aprobar o no aprobar las solicitudes de ingreso, retiro y expulsión de socios(as), así como imponer las sanciones respectivas.</li>
                                            <li>Aprobar y modificar estatutos y reglamentos.</li>
                                            <li>Otros asuntos relacionados con el funcionamiento del grupo.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art16 asamblea general ordinaria convocada junta directiva secretario presidente">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 16</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Asamblea General Ordinaria será convocada por la Junta Directiva a través del Secretario y Presidente.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art17 asamblea general extraordinaria asuntos urgente solución">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 17</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Asamblea General extraordinaria se reunirá para tratar asuntos que requieran urgente solución.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art18 asamblea general extraordinaria convocada junta directiva junta de vigilancia tercera parte socios">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 18</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La asamblea general extraordinaria será convocada por la Junta Directiva, la Junta de Vigilancia o por la tercera parte de los socios(as).</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art19 quórum ordinarias mitad socios mayores de edad mas uno representante carta electrónico justificar falta comprar acción pagar cuotas">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 19</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">El número mínimo de socios(as) que deberá asistir para celebrar asambleas ordinarias será la mitad de socios mayores de edad mas uno. Si un socio no puede asistir, podrá enviar un representante (esposo, esposa, hijos etc.) que deberá comprar la acción del representado, así como pagar sus cuotas mensuales (si la tiene). El representante deberá también llevar una carta o por medio electrónico donde quede justificada la falta del representado. Cada representante podrá representar a un único socio.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art20 máximo asambleas representado tres años exigir abandonar representante no puede solicitar préstamos no voto">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 20</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">El número máximo de Asambleas a las que un socio puede no asistir siendo representado será de tres (3) años. Si se excediera esta cifra al socio se le podría exigir abandonar el grupo. Un representante no puede solicitar préstamos, tampoco tiene derecho a voto y solo puede representar a un socio.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art21 asambleas extraordinarias quórum mitad socios mayores de edad mas uno segunda convocatoria los que asistan">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 21</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">El número de socios(as) requerido para celebrar asambleas extraordinarias será la mitad de socios mayores de edad mas uno en primera convocatoria y los que asistan en segunda convocatoria.</p>
                                    </div>
                                </article>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-700">Sobre el Consejo de Administración</p>
                                </div>

                                <article className="doc-card" data-search="art22 administración a cargo junta directiva electa por asamblea general">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 22</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La administración del grupo estará a cargo de la Junta Directiva electa por la Asamblea General en la forma establecida por el reglamento.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art23 junta directiva presidente secretario tesorero vocal i vocal ii">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 23</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Junta Directiva estará integrada por: Presidente, Secretario(a) y Tesorero(a). Opcionalmente se podrán elegir Vocal I y Vocal II.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art24 requisitos junta directiva mayor de edad identidad responsable honesto leer escribir operaciones básicas matemáticas parentesco vigilancia confianza llegar diez minutos antes">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 24</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Los requisitos para ser miembro de la Junta Directiva son:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Ser mayor de edad y tener documento de identidad.</li>
                                            <li>Ser responsable.</li>
                                            <li>Ser honesto(a).</li>
                                            <li>Saber leer, escribir y manejar las cuatro operaciones básicas de matemáticas. Preferiblemente no tener ningún parentesco con los miembros de la Junta Directiva de Vigilancia.</li>
                                            <li>Debe contar con la total confianza de todos los socios.</li>
                                            <li>Debe llegar diez minutos antes de la hora de comienzo de la reunión para poder preparar la asamblea.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art25 duración máxima cargo junta directiva tres años recomendable cambiar cada año">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 25</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La duración máxima en el cargo de la Junta Directiva será de tres (3) años. Lo recomendable es que cada año se cambie la Junta Directiva.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art26 funciones junta directiva cumplir estatutos reglamentos plans presupuesto informes comité créditos nuevos socios gestionar recursos contraer préstamos">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 26</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Son funciones de la Junta directiva:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Cumplir y hacer cumplir los estatutos y reglamentos.</li>
                                            <li>Elaborar y ejecutar planes de trabajo y presupuesto.</li>
                                            <li>Proporcionar informes financieros y de actividades a la Asamblea General.</li>
                                            <li>En el caso que no existiera un Comité de Créditos, el Presidente y el Secretario se encargarán de recibir y evaluar las solicitudes de préstamo.</li>
                                            <li>En el caso que no existiera un Comité de nuevos socios, recibir solicitudes de ingreso y retiro de socios(as).</li>
                                            <li>Gestionar recursos económicos y asesorías para el grupo con autorización de la Asamblea General.</li>
                                            <li>Contraer préstamos junto con el Comité de Crédito.</li>
                                            <li>Otras actividades autorizadas por la Asamblea General.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art27 funciones presidente dirigir sesiones agendas cumplir estatutos autorizar firmar documentos pago explicación de cuentas cobrar acciones">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 27</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Las funciones del Presidente de la Junta Directiva son:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Dirigir y liderar las sesiones.</li>
                                            <li>Elaborar agendas con el secretario(a).</li>
                                            <li>Cumplir y hacer cumplir los estatutos (Acta de Constitución y Libro de Actas) y reglamentes del grupo.</li>
                                            <li>Autorizar y firmar con el tesorero(a) todos los documentos de pago del grupo.</li>
                                            <li>Hacer explicación de cuentas a todas la Asamblea una vez cuadrada la caja.</li>
                                            <li>Cobrar las acciones.</li>
                                            <li>Cualquier otra actividad que le corresponda.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art28 funciones secretario actas libro de actas leer acta anterior convocar sesión correspondencia firmar archivar guardar documentos lista asistencia cobro multas">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 28</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Las funciones del secretario(a) son:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Elaborar actas indicando lo acontecido en el Libro de Actas y, al inicio de cada asamblea, leer el acta de la asamblea anterior.</li>
                                            <li>Convocar la sesión.</li>
                                            <li>Enviar y recibir la correspondencia.</li>
                                            <li>Firmar con el presidente(a) las actas.</li>
                                            <li>Archivar y guardar los documentos del grupo.</li>
                                            <li>Pasar lista de asistencia y cobro de multas.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art29 funciones tesorero guardar dinero a la vista nunca llevar dinero después de asamblea informes financieros ingresos pagos ayudante entregar préstamos firmar documentos cuadre de caja estados financieros presupuestos">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 29</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Las funciones del Tesorero(a) son:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Guardar cuidadosamente el dinero del grupo durante la Asamblea y a la vista de todos los socios. Nunca deberá llevarse dinero después de la Asamblea.</li>
                                            <li>Elaborar y presentar informes financieros a la Asamblea General y a los socios(as).</li>
                                            <li>Recibir los ingresos y realizar los pagos. Puede disponer de un ayudante.</li>
                                            <li>Entregar préstamos cuando la persona haya firmado los documentos correspondientes.</li>
                                            <li>Colaborar en el cuadre de caja de la Asamblea.</li>
                                            <li>Elaborar estados financieros y presupuestos.</li>
                                            <li>Realizar cualquier otra función relacionada con el cargo.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art30 funciones vocal i vocal ii sustituir miembro junta directiva ausencia actividades asignadas">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 30</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Son funciones del Vocal I y Vocal II:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Sustituir a cualquier miembro de la Junta Directiva en su ausencia.</li>
                                            <li>Otras actividades que le asigne la Junta Directiva y la asamblea.</li>
                                        </ol>
                                    </div>
                                </article>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-700">Sobre la Junta de Vigilancia</p>
                                </div>

                                <article className="doc-card" data-search="art31 junta de vigilancia tres socios presidente secretario vocal no pertenecer junta directiva">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 31</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Junta de Vigilancia estará integrada por tres socios(as) que no pertenezcan a la Junta de Directiva y que se organizarán en Presidente, Secretario(a) y Vocal.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art32 requisitos junta de vigilancia responsable honrado mayor de edad leer escribir operaciones básicas matemáticas">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 32</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Son requisitos para ser miembros de la Junta de Vigilancia los siguientes:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Ser responsable.</li>
                                            <li>Ser honrado(a).</li>
                                            <li>Ser mayor de edad.</li>
                                            <li>Saber leer, escribir y las operaciones básicas de matemáticas.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art33 junta de vigilancia nombrada por asamblea duración 1 a 3 años funciones velar buen funcionamiento control ingresos egresos supervisar investigar irregularidad revisar documentos préstamos balances presupuestos informes">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 33</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Junta de Vigilancia será nombrada por la Asamblea y la duración en el cargo será de 1 año a 3 años como máximo. Son funciones de la Junta de Vigilancia:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Velar por el buen funcionamiento del grupo.</li>
                                            <li>Llevar el control de los ingresos y egresos.</li>
                                            <li>Supervisar al Consejo de Administración.</li>
                                            <li>Investigar cualquier irregularidad que se detecte en el grupo.</li>
                                            <li>Revisar los documentos de préstamos, balances, presupuestos e informes de la Junta Directiva.</li>
                                            <li>Cualquier otra actividad relacionada con el cargo.</li>
                                        </ol>
                                    </div>
                                </article>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-700">Sobre los Comités de Apoyo</p>
                                </div>

                                <article className="doc-card" data-search="art34 asamblea general nombrará comité crédito recuperación tecnología nuevos socios apoyar gestión administrativa ejecución acuerdos actividades">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 34</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La Asamblea General nombrará al Comité de Crédito, Comité de Recuperación, Comité de Tecnología, y un comité de nuevos socios para apoyar la gestión administrativa o para la ejecución de acuerdos o actividades.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section id="capitulo-iii" className="scroll-mt-24">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capítulo III</p>
                                <h2 className="mt-1 text-xl font-bold">Sobre los socios(as)</h2>
                            </div>

                            <div className="mt-4 space-y-4">
                                <article className="doc-card" data-search="art35 requisitos ser socio no pertenecer a otro grupo menores de edad socios no crédito no voto antecedente penal responsable persona natural familia acciones 30%">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 35</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">El socio es la persona integrante del grupo. Los requisitos para ser socio(a) son:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>No pertenecer a otro grupo.</li>
                                            <li>Menores de edad puedes ser socios:</li>
                                            <li>Los socios menores de edad no podrán acceder a créditos ni tienen derecho a voto.</li>
                                            <li>No tener ningún tipo de antecedente penal o haber cometido algún acto delictivo u/o encontrarse en un proceso de investigación.</li>
                                            <li>Ser responsable.</li>
                                            <li>Ser persona natural actuando en representación de su familia directa, y si no la tiene, actuando individualmente.</li>
                                            <li>Adquirir mensualmente el número de acciones establecidas por la Asamblea General.</li>
                                            <li>Un socio(a) podrá tener un máximo del 30% de las acciones del capital social.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art36 deberes asistir sesiones ser puntales participar aceptar cargos cumplir obligaciones compra acción multa moratoria no cheque cumplir estatutos reglamentos acuerdos">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 36</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Son deberes de los socios:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Asistir a todas las sesiones respetando el número máximo de representaciones permitido.</li>
                                            <li>Ser puntales.</li>
                                            <li>Participar en todas las actividades del grupo.</li>
                                            <li>Aceptar cargos directivos si fuera elegidos.</li>
                                            <li>Cumplir con todas las obligaciones del grupo: asistencia puntual, compra como mínimo de una acción al mes, pago puntual y completo de deudas, pago de multas por retraso o no asistencia, pago de tasas moratorias sin procediera. No se permite pagar con cheque.</li>
                                            <li>Cumplir con los estatutos, reglamentos y acuerdos de la Asamblea General.</li>
                                        </ol>
                                        <p className="mt-3 text-sm text-slate-500">Si No</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art37 derechos participar voz voto elegir ser electo préstamos servicios al corriente obligaciones calcular monto máximo capacidad crédito tramos multiplicador retiro voluntario utilidades información dividendos beneficios capacitación asistencia técnica">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 37</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Son derechos de los socios:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Participar en sesiones con voz y voto. Un representante no podrá nunca votar por el representado.</li>
                                            <li>Elegir a ser electo en cargos directivos.</li>
                                            <li>Tener derecho a préstamos y a usar todos los servicios del grupo si estuviera al corriente con todas sus obligaciones. Un representado no tiene derecho a pedir préstamos.</li>
                                            <li>Para calcular el monto máximo que se puede conceder un préstamo se tendrán en cuenta las acciones acumuladas hasta la asamblea anterior respetando la máxima capacidad de crédito que se calcula en base a un escalado de diferentes tramos de multiplicador que se van aplicando a cada tramo creciente de ahorros. Esta regla solo podrá romperse en casos excepcionales en los que sobre el dinero en mesa.</li>
                                            <li>Poder retirarse voluntariamente comunicando al grupo y al monitor con un mes de antelación, con derecho a recibir utilidades calculadas a la fecha de liquidación.</li>
                                            <li>Solicitar y recibir información sobre el grupo.</li>
                                            <li>Recibir utilidades y beneficios del grupo.</li>
                                            <li>Recibir capacitación y asistencia técnica.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art38 retiro voluntario un mes anticipación escrito manifestar verbal devolver aportación disponibilidad fondos no demore 6 meses al día obligaciones grupo mora menos de 10 socios adultos invitar nuevos miembros dividendos repartir entrega general">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 38. Retiro de un grupo</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Si un integrante desea retirarse deberá solicitar el retiro voluntario al grupo con un mes de anticipación. Para ello debe llevar un escrito al grupo solicitando su retiro y deberá manifestarlo de forma verbal ante la Asamblea. Se le devolverá su aportación en función de la disponibilidad de fondos en las siguientes asambleas procurando que no demore más de 6 meses contados a partir de la fecha en la que le es aceptada su salida por La Asamblea siempre y cuando esté al día con sus obligaciones.</p>
                                        <p className="mt-3 leading-relaxed text-slate-700">Un socio solo se puede liquidar si el grupo no está en mora y si éste no queda con menos de 10 socios adultos tras su retiro. En caso de que el grupo vaya a quedar con menos socios se deberá invitar a nuevos miembros al grupo para que la liquidación se pueda efectuar.</p>
                                        <p className="mt-3 leading-relaxed text-slate-700">Los dividendos se repartirán al final en la entrega general.</p>
                                        <p className="mt-3 leading-relaxed text-slate-700">Un socio que se retira del grupo no puede volver a ingresar al mismo grupo, hasta después de 3 meses.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art39 calidad del socio se pierde retiro voluntario expulsión estado etílico alucinógeno droga mora dos veces no asistir 3 consecutivas no comprar acciones 3 veces malversación corrupción préstamos a no socios tasa superior expulsión inmediata indisciplina grave agresiones físicas fallecimiento beneficiarios valores a favor valores en contra propuestas recuperación capital familiares no respetar reglamento influir">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 39. La calidad del Socio(a) se pierde por</h3>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Retiro Voluntario</li>
                                            <li>Expulsión</li>
                                        </ol>
                                        <p className="mt-3 text-sm font-semibold text-slate-700">Causas (según el texto):</p>
                                        <ol className="mt-2 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Asistir a una asamblea ordinaria o extraordinaria en estado etílico o después de haber ingerido algún alucinógenos o droga.</li>
                                            <li>Caer en mora más de dos veces.</li>
                                            <li>No asistir a las reuniones 3 veces consecutivas sin justificar.</li>
                                            <li>No comprar acciones mas de 3 veces consecutivas. Justificación en el próximo mes pagar las cuotas pendientes.</li>
                                            <li>Malversación de fondos y actos de corrupción. Está expresamente prohibido el tomar préstamos del grupo para ser prestados a su vez a personas no socias a una tasa superior. La Junta Directiva deberá proceder a la expulsión inmediata de aquellos socios que incurran en esta práctica.</li>
                                            <li>Indisciplina grave o agresiones físicas.</li>
                                        </ol>
                                        <p className="mt-4 text-sm font-semibold text-slate-700">Fallecimiento (en caso de fallecer algún socio):</p>
                                        <ol className="mt-2 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>En caso de tener valores a favor los beneficiarios recibirán el valor de las acciones, ahorros y utilidades correspondientes a la fecha del deceso. En caso de no haber indicado el socio fallecido quienes son sus beneficiarios, el grupo contactará con los familiares.</li>
                                            <li>En caso se tener valores en contra: en primera instancia Credirojas dará propuestas al grupo para la recuperación del capital. En el caso de no lograrse una resolución, el grupo contactará con los familiares.</li>
                                        </ol>
                                        <p className="mt-4 leading-relaxed text-slate-700">No respetar el presente Reglamento o influir en otros socios para que no lo respeten.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art40 expulsión no implica incumplimiento obligaciones contraídas">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 40</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">La expulsión de un socio(a) no implica su incumplimiento de las obligaciones contraídas con el grupo hasta esa fecha.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art41 admisión nuevos socios presentarse recomendado confianza votación secreta 50% adultos más uno 3 meses sin préstamo multiplicador 2 solicitud virtual documentos secretario sesión extraordinaria virtual votación">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 41. Admisión de nuevos socios</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Para el ingreso de nuevos integrantes se debe cumplir con lo indicado en el articulo relativo a los requisitos para ser socios de un grupo además de lo siguiente:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Presentarse personalmente, recomendado por un socio, a la reunión y manifestar el interés de pertenecer al grupo.</li>
                                            <li>La Asamblea es la responsable de aceptar o rechazar el ingreso del nuevo integrante en base a los requisitos establecidos en el presente reglamento y el cumplimiento de la premisa básica obligatoria de ser una persona bien conocida por los socios actuales y de su confianza.</li>
                                            <li>La Asamblea someterá a votación la inclusión del nuevo socio y este se hará en votación secreta. Para ello se solicitará al candidato a socio a retirarse de la asamblea por unos minutos. El socio será aceptado si obtiene el 50% de votos adultos más uno.</li>
                                            <li>Los nuevos socios no tendrán acceso a préstamo hasta pasados 3 meses. El primer crédito que obtenga los socios será por el multiplicador de 2 y respetando siempre la máxima capacidad de crédito.</li>
                                            <li>En caso de ser virtual la solicitud del nuevo socio debe llenar los documentos y enviar al secretario, el secretario deberá convocar a una sesión extraordinaria virtual para dar a conocer el deseo de un nuevo socio y poder realizar la votación.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art42 sanciones impuntualidad falta interés no cumplir fecha de pago pagos planificados inasistencias faltas de respeto no pagar multas no cumplimiento reglas">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 42</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Los socios deberán ser sancionados por las causas siguientes:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Impuntualidad en la asistencia a las Asambleas.</li>
                                            <li>Falta de interés en las actividades del grupo.</li>
                                            <li>Por no cumplir con la fecha de pago o los pagos planificados ya sea de forma total o parcial.</li>
                                            <li>Inasistencias sin causa justificada e incumplimiento de estatutos y reglamentos.</li>
                                            <li>Faltas de respeto a alguno de los socios.</li>
                                            <li>No pagar las multas que deba al grupo.</li>
                                            <li>No cumplimiento de las reglas aquí descritas.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art43 sanciones multas tardanza no asistencia 500 1500 suspensión préstamos impagos mora interna pago parcial cuadre de caja 3 meses suspensión por no comprar acción 2 meses 3 a 5 meses suspensión beneficios utilidades deudas multas">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 43</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Las sanciones a aplicar será:</p>

                                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-semibold text-slate-700">a) Multas por tardanza y por no asistencia</p>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-700">La aplicación de estas multas es obligatoria en todos los grupos y parte de la metodología con el fin de promover la virtud de la puntualidad y el respeto al tiempo de los demás socios. El monto de estas multas deberá ser significativo con el fin de que tengan el efecto buscado sobre la puntualidad y asistencia. Se establecen los siguientes mínimos:</p>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="min-w-full text-left text-sm">
                                                    <thead className="text-xs uppercase text-slate-500">
                                                        <tr><th className="px-3 py-2">Tipo</th><th className="px-3 py-2">Mínimo</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        <tr><td className="px-3 py-2 text-slate-700">Multas por tardanza (ni justificada ni representada)</td><td className="px-3 py-2 font-semibold text-slate-900">500 colones</td></tr>
                                                        <tr><td className="px-3 py-2 text-slate-700">Multa por no asistencia (ni justificada ni representada)</td><td className="px-3 py-2 font-semibold text-slate-900">1,500 colones</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="mt-3 text-sm text-slate-700">La Asamblea General podrá decidir si establece multas superiores, pero nunca inferiores. Véase en el acta constitutiva.</p>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                                            <p className="text-sm font-semibold text-slate-700">b) Suspensión de préstamos por impagos</p>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-700">Si un socio cae en mora, no paga su cuota del mes con su dinero personal, cancela la cuota incompleta (a esto se lo conoce comúnmente como “pago parcial” o “mora interna”) o cancela tras el cuadre de caja, seria suspendido de su derecho a solicitar nuevos préstamos por el periodo mínimo de 3 meses tras la finalización de pago de su crédito, si la Asamblea General decide incrementar la sanción se puede dar. Esto debe quedar reflejado en el Libro de Actas.</p>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                                            <p className="text-sm font-semibold text-slate-700">c) Suspensión de préstamos por no comprar la acción mínima del mes</p>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-700">Si un socio no compra la acción del mes será suspendido de su derecho a solicitar un nuevo préstamo por el periodo mínimo de 2 meses tras la finalización del crédito actual. Si se tratara de un socio que no tuviese crédito activo, la sanción empezará a ejecutarse a partir de la asamblea en la que no compra acción. En el caso de un socio nuevo, que aún no cumple sus 3 meses para solicitar un préstamo, el tiempo de espera se extenderá de 3 a 5 meses desde que ingresó. Si la Asamblea General decide incrementar la sanción se puede dar. Esto debe quedar reflejado en el libro de actas.</p>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                                            <p className="text-sm font-semibold text-slate-700">d) Suspensión de beneficios y utilidades</p>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-700">Suspensión de beneficios y utilidades del grupo en caso no haya cancelado sus deudas y multas pendientes de pago.</p>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section id="capitulo-iv" className="scroll-mt-24">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capítulo IV</p>
                                <h2 className="mt-1 text-xl font-bold">De los recursos económicos</h2>
                            </div>

                            <div className="mt-4 space-y-4">
                                <article className="doc-card" data-search="art44 recursos económicos exclusivamente logro objetivos">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 44</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Los recursos económicos se emplearán exclusivamente para el logro de los objetivos del grupo.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art45 recursos económicos capital social acciones ahorro multas sobrantes utilidades no distribuidas fondo social reserva legal donaciones">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 45</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Los recursos económicos del grupo estarán constituidos por:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Capital social (acciones acumuladas).</li>
                                            <li>Ahorro (multas sobrantes).</li>
                                            <li>Utilidades no distribuidas.</li>
                                            <li>Fondo social y fondo de reserva legal.</li>
                                            <li>Donaciones.</li>
                                        </ol>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section id="capitulo-v" className="scroll-mt-24">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capítulo V</p>
                                <h2 className="mt-1 text-xl font-bold">De la disolución y liquidación del grupo</h2>
                            </div>

                            <div className="mt-4 space-y-4">
                                <article className="doc-card" data-search="art46 disolución acuerdo voluntario no cumplir objetivos índice morosidad 10% dos periodos consecutivos numero menor 5 operar con perdidas malas relaciones no respetar reglamento asambleas lugares peligrosos socios problemas legales">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 46</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">El grupo podrá disolverse en los casos siguientes:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Por acuerdo voluntario de los socios(as).</li>
                                            <li>Por no cumplir con los objetivos para los que fue creada.</li>
                                            <li>Por tener un índice de morosidad mayor al 10% en dos periodos consecutivos.</li>
                                            <li>Por tener un numero menor de 5 socios(as).</li>
                                            <li>Por operar con perdidas por mas de dos periodos consecutivos.</li>
                                            <li>Por malas relaciones entre los socios(as) que afecten el funcionamiento del grupo.</li>
                                            <li>Por no respetar el presente reglamento.</li>
                                            <li>Por decidir el grupo que las Asambleas se celebren en lugares peligrosos o de difícil acceso a determinadas horas el día.</li>
                                            <li>Por integrar a socios con problemas legales que puedan afectar al buen funcionamiento del grupo y poner en riesgo la seguridad de los miembros del equipo o grupo.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art47 disolución pasos solicitud escrito un mes anticipación junta vigilancia junta directiva recuperar cuentas préstamos socios deuda pagar capital a favor recibir capital pérdidas distribuir proporcionalmente acciones reintegrar">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 47</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">En el caso de disolución, los pasos a dar serán los siguientes:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>El grupo solicitará por escrito su solicitud de disolución y motivo en la asamblea ordinaria con un mes de anticipación.</li>
                                            <li>La Junta de vigilancia y la Junta Directiva serán los encargados de recuperar las cuentas y préstamos por cobrar si los hubiera.</li>
                                            <li>Los socios con deuda pendiente deberán pagar los préstamos y cuentas por pagar.</li>
                                            <li>Los socios con capital a favor recibirán su capital.</li>
                                            <li>Al resultar pérdidas en la liquidación, estas se distribuirán proporcionalmente a la distribución de las acciones de los socios(as), reintegrando al grupo el valor que les corresponda.</li>
                                        </ol>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section id="capitulo-vi" className="scroll-mt-24">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capítulo VI</p>
                                <h2 className="mt-1 text-xl font-bold">Disposiciones generales</h2>
                            </div>

                            <div className="mt-4 space-y-4">
                                <article className="doc-card" data-search="art48 disposiciones no incluidas resoluciones asamblea general libro de actas">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 48</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Las disposiciones no incluidas en este reglamento se regirán por las resoluciones emanadas de la Asamblea General y que serán debidamente registradas en el libro de actas.</p>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art49 solicitudes de crédito requisitos pertenecer al grupo máxima capacidad no sanción aplicación digital motivo proforma evidencias firmar contrato mutuo pagaré garantía copia cédula 2000000 40% capital social representado no préstamo obligatorio llenado documento virtual">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 49. Solicitudes de crédito</h3>
                                        <p className="mt-2 leading-relaxed text-slate-700">Los requisitos para solicitar crédito son:</p>
                                        <ol className="mt-3 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                            <li>Pertenecer al grupo.</li>
                                            <li>Respetar la máxima capacidad de crédito y no tener ninguna sanción vigente.</li>
                                            <li>Realizar la solicitud de préstamos por medio de la aplicación digital.</li>
                                            <li>Indicar al resto de socios el motivo por el que se solicita el préstamo (pago de deudas, salud, educación, vivienda, negocio, otros) dando un detalle del mismo y entregando proforma y/o evidencias de la compra/adquisición si el grupo lo estiman conveniente.</li>
                                            <li>Firmar contrato de mutuo dinerario.</li>
                                            <li>Firmar pagaré indicando una garantía si la Asamblea General lo estiman conveniente.</li>
                                            <li>Entregar una copia de la cedula o mostrar la cedula.</li>
                                            <li>Ningún socio que solicite un préstamo superior a 2,000,000 colones podrá tener en su poder mas del 40% del capital social del grupo. Esto puede causar la bajada del valor del préstamo independientemente de su capacidad de préstamo.</li>
                                            <li>Un socio representado no podrá llevarse un préstamo. Es obligatorio el llenado del documento y los mismos pueden ser virtuales.</li>
                                        </ol>
                                    </div>
                                </article>

                                <article className="doc-card" data-search="art50 ampliación de préstamos saldo pendiente ampliar meses 50% socios adultos más uno causa justificada comprobada solo intereses 70% socios más uno desastres naturales accidentes fortuitos periodos de gracia 2 meses enfermedad accidente familiar primer grado justificante médico catástrofes naturales fuerza mayor 90%">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <h3 className="text-base font-semibold">ARTÍCULO 50. Sobre la ampliación de préstamos</h3>
                                        <ol className="mt-3 list-[lower-alpha] space-y-2 pl-5 text-slate-700">
                                            <li>Un socio después de haber cancelado su cuota puede solicitar a la Asamblea General que el restante de sus cuotas (saldo pendiente) se amplie en los meses que considere conveniente. Esta opción deberá ser aprobada por el 50% de socios adultos más uno.</li>
                                            <li>Si un socio por causa justificada(*) y comprobada solo pagara los intereses de la cuota del mes y solicitara una ampliación de su deuda después, se puede dar con la aprobación del 70% de socios más uno. De lo contrario, caerá en mora y deberá pagar las respectivas penalizaciones.</li>
                                            <li>En caso de desastres naturales o accidentes fortuitos que afecten a toda la asamblea se puede otorgar periodos de gracia por no más de 2 meses. La reunión deberá realizarse para someter a votación esta acción y evaluar el estado del grupo.</li>
                                        </ol>

                                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-semibold text-slate-700">(*) Causas justificadas (exclusivamente)</p>
                                            <ol className="mt-2 list-[lower-alpha] space-y-1 pl-5 text-slate-700">
                                                <li>Enfermedad o accidente del socio o familiares de primer grado siempre y cuando se presente el justificante médico correspondiente.</li>
                                                <li>Catástrofes naturales.</li>
                                                <li>Otras causas de fuerza mayor con la aprobación del 90% de los socios del grupi.</li>
                                            </ol>
                                        </div>

                                        <p className="mt-4 text-sm text-slate-600">Quedando todo lo mencionado, se suscribe los nombres y firmas de los socios:</p>
                                    </div>
                                </article>
                            </div>
                        </section>


                        <footer className="pt-2 text-center text-xs text-slate-500">
                            <p>© Credirojas — Derechos reservados 2025.</p>
                        </footer>
                    </section>
                </div>
            </main >
        </div >
    );
}

'use client'

import { useState, useEffect, ReactNode } from "react";
import { FiUser, FiLayout, FiLogOut, FiMenu, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import icon from '@/../public/images/icon.png'
import Image from "next/image";
import { MdOutlineSavings } from "react-icons/md";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { useRouter } from "next/navigation";


// Definir la interfaz para los sub-ítems
interface SubItem {
    name: string;
    href: string;
}

// Definir la interfaz para los ítems del menú
interface MenuItem {
    name: string;
    icon: ReactNode;  // Los íconos son componentes React
    href?: string;  // `href` es opcional si hay subItems
    subItems?: SubItem[];  // Los sub-ítems son opcionales
}


const Sidebar = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isMovil, setIsMovil] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const navegate = useRouter()



    // Estado para almacenar el ancho de la ventana
    const [windowWidth, setWindowWidth] = useState<number | null>(null);

    useEffect(() => {
        // Verificamos que estamos en el lado del cliente y luego accedemos a window
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth <= 640) {
                setIsOpen(false);
            }
        };

        // Inicializar el ancho de la ventana al montar el componente
        if (typeof window !== "undefined") {
            setWindowWidth(window.innerWidth);
        }

        // Agregar event listener para cambios en el tamaño de la ventana
        window.addEventListener("resize", handleResize);

        // Limpiar el event listener cuando el componente se desmonte
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    useEffect(() => {
        if (windowWidth && windowWidth <= 640) {
            setIsMovil(true);
            setIsOpen(false);
        } else {
            setIsMovil(false);
        }

    }, [windowWidth]);


    const menuItems: MenuItem[] = [
        {
            name: "Dashboard",
            icon: <FiLayout className="w-6 h-6" />,
            subItems: [
                { name: "Socio", href: "/socio" },
                { name: "Administrador", href: "/home" },

            ]
        },
        {
            name: "Socios",
            icon: <FiUser className="w-6 h-6" />,
            subItems: [
                { name: "Nuevo", href: "/home/socios/signing" },
                { name: "Modificar", href: "/home/socios/browse" },
                { name: "Desafiliar", href: "/home/socios/desafiliar" },
                { name: "Asignacion de Beneficiarios", href: "/home/socios/beneficiarios" },
                { name: "Invitar nuevo socio", href: "/home/socios/invitar" },
                { name: "Ver mi Dashboard", href: "/home/socios/dashboard" },
            ]
        },
        {
            name: "Acciones",
            icon: <MdOutlineSavings className="w-6 h-6" />,
            subItems: [
                { name: "Asignar Acciones", href: "/home/socios/acciones" },
                { name: "Ver Acciones x Socio", href: "/home/socios/estado_acciones" }]
        },
        {
            name: "Prestamos",
            icon: <HiOutlineBanknotes className="w-6 h-6" />,
            subItems: [
                { name: "Generar", href: "/home/prestamos/nuevo" },
                { name: "Abonar", href: "/home/prestamos/abono" },
                { name: "Ampliar Plazo", href: "/home/construccion" },
                { name: "Simulador", href: "/home/prestamos/proyeccion" },
                { name: "Estados de cuenta", href: "/home/prestamos/estado_cuenta" },
            ]
        },
        {
            name: "Administración",
            icon: <MdOutlineAdminPanelSettings className="w-6 h-6" />,
            subItems: [
                { name: "Conciliación", href: "/home/administrador/conciliacion" },
                { name: "Auditoria Acciones", href: "/home/administrador/auditoria_acciones" },
                { name: "Auditoria Préstamos", href: "/home/administrador/auditoria_prestamos" },
                { name: "Solicitudes de préstamo", href: "/home/administrador/estado_solicitudes" },
                { name: "Maestro de socios", href: "/home/administrador/maestro_socios" },
                { name: "Ajustes Auxiliares", href: "/home/administrador/auxiliar" },
                { name: "Dividendos", href: "/home/administrador/dividendos" },

            ]
        },
        {
            name: "Logout",
            icon: <FiLogOut className="w-6 h-6" />,
            href: "/"
        }
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    const toggleExpand = (itemName: string) => {
        // setExpandedItems(prev => ({
        //     ...prev,
        //     [itemName]: !prev[itemName]
        // }));

        setExpandedItems(prev => ({
            [itemName]: !prev[itemName]
        }));

    };

    const process = (item: MenuItem | SubItem) => {
        if (item.href) {
            navegate.push(item.href);

            setIsOpen(false);
        }
        setActiveItem(findPath(item.name, menuItems, "") ?? "....!")

    };

    // Función para encontrar el camino (padre > hijo)
    const findPath = (itemName: string, menu: MenuItem[], parentPath: string = ""): string | null => {
        for (const item of menu) {
            const currentPath = parentPath ? `${parentPath} > ${item.name}` : item.name;

            // Si encontramos el ítem, devolvemos el camino
            if (item.name === itemName) {
                return currentPath;
            }

            // Si tiene subItems, buscamos recursivamente en los subItems
            if (item.subItems) {
                const subPath = findPath(itemName, item.subItems as MenuItem[], currentPath);
                if (subPath) {
                    return subPath;
                }
            }
        }
        return null; // Si no se encuentra el ítem
    };

    return (
        <div className="relative">
            <button
                className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                onClick={toggleSidebar}
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            {isOpen && isMovil && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 z-41`}
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside
                className={`sm:block  fixed top-0 left-0 h-full  bg-gray-900 text-white transition-all duration-300 ease-in-out w-64 ${isOpen && isMovil ? "" : "-translate-x-full"}  sm:translate-x-0 z-45`}
            >
                <div className="flex items-center justify-center h-20 bg-gray-800">
                    <Image className='logo-login-white' src={icon} width={50} alt="Logo" />
                    <span className={`hidden sm:block  ml-3 text-xl font-semibold whitespace-nowrap`}>
                        Credi Rojas v1.0
                    </span>
                </div>

                <nav className="mt-8 ">
                    <ul className="space-y-2 px-4">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => {
                                            process(item);
                                            if (item.subItems) toggleExpand(item.name);
                                        }}
                                        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200
                                        ${activeItem === item.name
                                                ? "bg-gray-800 text-white"
                                                : "text-gray-400 hover:bg-gray-800 hover:text-white"}
                                                    focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                        aria-label={item.name}
                                    >
                                        <span className="inline-flex items-center justify-center">
                                            {item.icon}
                                        </span>
                                        {(
                                            <>
                                                <span className="ml-3  text-sm font-medium flex-grow">{item.name}</span>
                                                {item.subItems && (
                                                    <span className="ml-auto">
                                                        {expandedItems[item.name] ?
                                                            <FiChevronDown className="w-4 h-4" /> :
                                                            <FiChevronRight className="w-4 h-4" />
                                                        }
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </button>
                                    {item.subItems && expandedItems[item.name] && (
                                        <ul className="ml-1 mt-2 bg-gray-100/10 space-y-2">
                                            {item.subItems.map((subItem) => (
                                                <li key={subItem.name}>
                                                    <button
                                                        onClick={() => process(subItem)}
                                                        className={`w-full p-2 text-right pr-4   text-sm rounded-md transition-colors duration-200
                              ${activeItem === subItem.name
                                                                ? "bg-gray-800 text-white"
                                                                : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
                                                    >
                                                        {subItem.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main
                className={`min-h-screen transition-all duration-300`}
            >

                <div className={`sticky top-0  z-40  bg-gray-600 h-20 px-8 ml-0 sm:ml-64 items-center flex justify-between`}>
                    <h1 className="text-[clamp(1rem,_0.5rem,_2rem)] ml-10 sm:ml-0 font-semibold text-white">{activeItem}</h1>
                </div>
                <div className={`block p-3 sm:p-8 ml-0 sm:ml-60`}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Sidebar;

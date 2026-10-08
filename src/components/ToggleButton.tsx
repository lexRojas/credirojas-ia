'use client'

import React, { useEffect, useState } from "react";

interface ToggleButtonProps {
    value: boolean; // El valor del toggle (encendido/apagado)
    toggleClick: (newValue: boolean) => void; // Función a llamar con el nuevo valor
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ value, toggleClick }) => {
    // Usamos el valor del prop 'value' para el estado inicial
    const [isOn, setIsOn] = useState(value);

    // Efecto para actualizar el estado local cuando 'value' cambia desde los props
    useEffect(() => {
        setIsOn(value);
    }, [value]);

    const handleToggle = () => {
        const newValue = !isOn; // Cambiar el estado
        setIsOn(newValue); // Actualiza el estado local
        toggleClick(newValue); // Llama a la función pasada por props
    };

    return (
        <div
            className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-all duration-300 ${isOn ? "bg-blue-500" : "bg-gray-400"
                }`}
            onClick={handleToggle}
        >
            <div
                className={`absolute w-6 h-6 bg-white rounded-full transition-all duration-300 transform ${isOn ? "translate-x-6" : "translate-x-0"
                    }`}
            />
        </div>
    );
};

export default ToggleButton;

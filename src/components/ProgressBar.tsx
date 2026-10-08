import React from 'react';

interface ProgressBarProps {
    valorAvance: number;  // Valor actual del avance
    valorFinal: number;   // Valor final (máximo)
}

const ProgressBar: React.FC<ProgressBarProps> = ({ valorAvance, valorFinal }) => {
    // Calcular el porcentaje de avance
    const porcentajeAvance = (valorAvance / valorFinal) * 100;

    return (
        <div className="w-full flex items-center justify-center relative">
            {/* Barra de progreso */}
            <div className="z-0 bg-yellow-50 w-full h-7 rounded-full">
                <div
                    className="z-10 h-full bg-green-500 rounded-full"
                    style={{ width: `${porcentajeAvance}%` }}
                ></div>
            </div>

            {/* Texto de avance centrado */}
            <div
                className="dark:text-black absolute top-0.5 left-1/2 transform -translate-x-1/2 z-20"

            >
                {porcentajeAvance.toFixed(2)}% Completado
            </div>
        </div>
    );
};

export default ProgressBar;

import React from 'react';
import '@/components/loading/style.css'

export default function Loading() {


    return (
        <>
            {/* Contenedor con el estilo aplicado */}
            <div className="ring">
                LOADING
                <span></span>
            </div>
        </>
    );
}

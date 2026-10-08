'use client'

import React from "react";
import { useState } from "react";

type ModalProps<T> = {
    isOpen: boolean;
    data: T[];  // Accepting dynamic data array
    columns: { [key: string]: string };
    filterField: keyof T;
    title: string;
    onClose: (selectedItem: T | null) => void;  // Callback with the selected item
};

export default function Modal<T>({ isOpen, data, columns, filterField, title = "Datos Disponibles", onClose }: ModalProps<T>) {
    const [filter, setFilter] = useState("");


    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
    };

    const filteredData = data?.filter((item) =>
        item[filterField]?.toString().toLowerCase().includes(filter.toLowerCase())
    );

    const handleRowClick = (item: T) => {
        onClose(item);  // Pass the selected item to the parent component
    };

    return (
        <>
            {isOpen && (
                <div className="fixed top-8 left-0 right-0 h-full  bg-gray-800/60  flex justify-center items-center z-50">
                    <div className="bg-white shadow-lg  p-4 rounded-lg w-9/10 h-9/12 max-w-3xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">{title}</h2>
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => onClose(null)}  // Close without selection
                            >
                                Close
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Filter..."
                                value={filter}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="overflow-x-hidden overflow-y-scroll  max-h-[calc(90%-3rem)]">
                            <table className="relative min-w-full table-auto text-sm">
                                <thead className="sticky -top-0 uppercase bg-[#6b7280] text-[#e5e7eb]">
                                    <tr>
                                        {Object.keys(columns).map((key) => (
                                            <th key={key} className="px-4 py-2 text-left border-b">
                                                {columns[key]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody >
                                    {filteredData.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleRowClick(item)}  // Select item on row click
                                        >
                                            {Object.keys(columns).map((key) => (
                                                <td key={key} className="px-4 py-2  uppercase border-b">
                                                    {item[key as keyof T] as React.ReactNode}  {/* Dynamically access field */}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

"use client";
import React from "react";
import { JSX } from "react/jsx-runtime";
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import Link from "next/link";
import AppNavbar from "../components/ui/Navbar";
import ProtectedRoute from "../components/ui/ProtectedRoute";

export default function Generator() {
    const [selectedContext, setSelectedContext] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [showContextDropdown, setShowContextDropdown] = useState(false);
    const [showColorDropdown, setShowColorDropdown] = useState(false);
    
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".dropdown-container")) {
                setShowContextDropdown(false);
                setShowColorDropdown(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const contactInfo = [
        {
            icon: "/figmaAssets/image-11.png",
            text: "3148328356",
        },
        {
            icon: "/figmaAssets/image-12.png",
            text: "github",
        },
        {
            icon: "/figmaAssets/image-13.png",
            text: "outfitgen@gmail.com",
            isLink: true,
        },
    ];

    return (
        <ProtectedRoute>
            <div className="flex flex-col min-h-screen bg-[#ffffff] w-full">
                <AppNavbar />

                <main className="flex-grow mt-[50px] flex flex-col items-center ">
                    <h2 className="text-3xl font-semibold text-center">
                        ¿Qué tipo de Outfit quieres hoy?
                    </h2>

                    {/* Sección gris principal */}
                    <section className="w-full bg-[#FCC4C4] py-12 flex flex-col items-center gap-10">
                        {/* Botón Generate */}
                        <Button
                        variant="outline-primary"
                        className="bg-white rounded-lg border-2 border-solid border-[#FCC4C4] px-8 py-3 text-lg font-patrick-hand-body-lg text-black"
                        >
                        Generate
                        </Button>
                        
                        <div className="w-[90%] max-w-6xl flex flex-row md:flex-row justify-between gap-8">
                            <div className="flex flex-col items-center justify-start p-8 rounded-lg border-2 border-solid border-[#FCC4C4] w-full md:w-1/4 gap-4">

                                <div className="relative dropdown-container">
                                    <button
                                        onClick={() => setShowContextDropdown(!showContextDropdown)}
                                        className="w-[100%] bg-white border border-gray-400 rounded-md p-2 flex justify-between items-center"
                                    >
                                        <span>{selectedContext ? selectedContext : "Contexto"}</span>
                                        <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 transition-transform ${
                                            showContextDropdown ? "rotate-180" : "rotate-0"
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showContextDropdown && (
                                        <div className="absolute mt-2 w-[100%] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                                        {["Formal", "Informal"].map((option) => (
                                            <div
                                            key={option}
                                            className={`p-2 cursor-pointer hover:bg-gray-100 ${
                                                selectedContext === option.toLowerCase() ? "bg-gray-200" : ""
                                            }`}
                                            onClick={() => {
                                                setSelectedContext(option.toLowerCase());
                                                setShowContextDropdown(false); // cerrar después de elegir
                                            }}
                                            >
                                            {option}
                                            </div>
                                        ))}
                                        </div>
                                    )}
                                    </div>

                                    {/* COLOR */}
                                    <div className="relative dropdown-container">
                                    <button
                                        onClick={() => setShowColorDropdown(!showColorDropdown)}
                                        className="w-[100%] bg-white border border-gray-400 rounded-md p-2 flex justify-between items-center"
                                    >
                                        <span>{selectedColor ? selectedColor : "Seleccionar color"}</span>
                                        <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 transition-transform ${
                                            showColorDropdown ? "rotate-180" : "rotate-0"
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showColorDropdown && (
                                        <div className="absolute mt-2 w-[100%] bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-[200px] overflow-auto">
                                        {["Rojo", "Azul", "Amarillo", "Verde", "Negro", "Blanco"].map((option) => (
                                            <div
                                            key={option}
                                            className={`p-2 cursor-pointer hover:bg-gray-100 ${
                                                selectedColor === option.toLowerCase() ? "bg-gray-200" : ""
                                            }`}
                                            onClick={() => {
                                                setSelectedColor(option.toLowerCase());
                                                setShowColorDropdown(false); // cerrar después de elegir
                                            }}
                                            >
                                            {option}
                                            </div>
                                        ))}
                                        </div>
                                    )}
                                    </div>
                            </div>

                            {/* Columna 2: Cards de atuendos */}
                            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg border-2 border-solid border-[#FCC4C4] w-full md:w-2/4 min-h-[250px]">
                                <p className="text-gray-700 text-center">
                                Aquí se mostrarán las prendas seleccionadas o generadas.
                                </p>
                            </div>

                            {/* Columna 3: Botones de acción */}
                            <div className="flex flex-col items-center justify-start p-6 rounded-lg border-2 border-solid border-[#FCC4C4] w-full md:w-1/4 gap-4">
                                <Link href="/virtual_wardrobe">
                                    <Button
                                        variant="outline-primary"
                                        className="bg-white rounded-lg border-2 border-solid border-[#FCC4C4] px-6 py-2"
                                        >
                                        Guardarropa
                                    </Button>
                                </Link>

                                <Button
                                    variant="outline-primary"
                                    className="bg-white rounded-lg border-2 border-solid border-[#FCC4C4] px-6 py-2"
                                    >
                                    Seleccionar ropa
                                </Button>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="w-full bg-black text-white py-10 flex flex-col items-center justify-center mt-auto">
                    <h3 className="text-2xl font-semibold mb-6">Contáctanos</h3>

                    <div className="flex flex-col items-center justify-center space-y-4">
                        {contactInfo.map((contact, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <img
                                    className="w-[41px] h-[41px] object-cover"
                                    alt="Contact icon"
                                    src={contact.icon}
                                />
                                {contact.isLink ? (
                                    <a
                                        className="font-patrick-hand-body-lg text-white text-xl underline hover:text-gray-300 transition-colors"
                                        href={`mailto:${contact.text}`}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        {contact.text}
                                    </a>
                                ) : (
                                    <div className="font-patrick-hand-body-lg text-white text-xl">
                                        {contact.text}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
};
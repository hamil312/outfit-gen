"use client";
import React, { useEffect } from "react";
import { JSX } from "react/jsx-runtime";
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import Link from "next/link";
import AppNavbar from "../components/ui/Navbar";
import Footer from "@/app/components/ui/Footer";
import ProtectedRoute from "../components/ui/ProtectedRoute";
import { BsStars } from "react-icons/bs";
import { clothingController } from "../controllers/ClothingController";
import { account } from "@/lib/appwrite";
import { Clothing } from "../models/Clothing";
import { outfitController } from "../controllers/OutfitController";

export default function Generator() {
    const [selectedContext, setSelectedContext] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [showContextDropdown, setShowContextDropdown] = useState(false);
    const [showColorDropdown, setShowColorDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [outfits, setOutfits] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [userClothes, setUserClothes] = useState<Clothing[]>([]);
    
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

    useEffect(() => {
        account.get().then(async (user) => {
            const clothes = await clothingController.getUserClothes();
            setUserClothes(clothes);
        });
    }, []);

    return (
        <ProtectedRoute>
            {showModal && (
                <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fadeIn">
                    {/* Contenedor centrado del modal */}
                    <div className="bg-white p-6 rounded-2xl w-[90%] max-w-sm shadow-2xl border border-gray-200 animate-scaleIn flex flex-col items-center"
                        style={{ marginLeft: '8vw' }}>
                    <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">
                        Selecciona una prenda
                    </h2>

                        <div className="grid grid-cols-3 gap-4 max-h-[280px] overflow-y-auto pr-1">
                            {userClothes.map((cloth) => (
                                <div
                                    key={cloth.$id}
                                    className="cursor-pointer rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden bg-gray-50"
                                    onClick={async () => {
                                        const result = await clothingController.generateOutfitWithBase(cloth.$id!);
                                        setOutfits([result]);
                                        setShowModal(false);
                                    }}
                                >
                                    <img
                                        src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${cloth.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                        className="w-full h-24 object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() => setShowModal(false)}
                            className="mt-6 w-full py-2 bg-pink-300 hover:bg-pink-400 text-white rounded-lg transition font-semibold hover:bg-[#991b1b] focus:ring-0"
                        >
                            Cerrar
                        </Button>

                    </div>

                </div>
            )}
            <div className="flex flex-col min-h-screen bg-[#ffffff] w-full">
                <AppNavbar />

                <main className="flex-grow mt-[50px] flex flex-col items-center ">
                    <h2 className="text-3xl font-semibold text-center">
                        ¿Qué tipo de Outfit quieres hoy?
                    </h2>

                    {/* Sección gris principal */}
                    <section className="w-full bg-[#e2e8f0] py-12 flex flex-col items-center gap-10">
                        {/* Botón Generate */}
                        <Button
                            variant="dark"
                            size="lg"
                            className="mb-6 border-2 hover:bg-[#5CA2AE] hover:border-[#5CA2AE] hover:text-white transition-colors flex items-center gap-2 mt-5"
                            onClick={async () => {
                                setLoading(true);
                                const results = await clothingController.generateOutfits(
                                    selectedColor.toLowerCase(),
                                    selectedContext.toLowerCase()
                                );
                                console.log("🧥 Resultados generados:", results);
                                setOutfits(results);
                                setLoading(false);
                            }}
                        >
                            {loading ? (
                                "Generando..."
                            ) : (
                                <>
                                    <BsStars size={18} className="text-white" />
                                    Generar
                                </>
                            )}
                        </Button>
                        <div className="w-[90%] max-w-6xl flex flex-row md:flex-row justify-between gap-8">
                            <div className="flex flex-col items-center justify-start p-8 rounded-lg w-full md:w-1/4 gap-4">

                                <div className="relative dropdown-container">
                                    <Button
                                        variant="outline-dark"
                                        onClick={() => setShowContextDropdown(!showContextDropdown)}
                                        className="min-w-[200px] w-full border-2 rounded-md hover:bg-[#5CA2AE] hover:border-[#5CA2AE] hover:text-white 
                                        transition-colors flex justify-center items-center text-center"
                                    >
                                        <span>{selectedContext ? selectedContext : "Seleccionar contexto"}</span>
                                    </Button>
                                    {showContextDropdown && (
                                        <div className="absolute mt-2 w-[100%] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                                        {["any","Formal", "Casual", "Sport"].map((option) => (
                                            <div
                                            key={option}
                                            className={`p-2 cursor-pointer hover:bg-gray-100 ${
                                                selectedContext === option ? "bg-gray-200" : ""
                                            }`}
                                            onClick={() => {
                                                setSelectedContext(option);
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
                                    <Button
                                        variant="outline-dark"
                                        onClick={() => setShowColorDropdown(!showColorDropdown)}
                                        className="min-w-[200px] w-full border-2 rounded-md hover:bg-[#5CA2AE] hover:border-[#5CA2AE] hover:text-white 
                                        transition-colors flex justify-center items-center text-center"
                                    >
                                        <span>{selectedColor ? selectedColor : "Seleccionar color"}</span>
                                    </Button>
                                    {showColorDropdown && (
                                        <div className="absolute mt-2 w-[100%] bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-[200px] overflow-auto">
                                        {["any","Rojo", "Azul", "Amarillo", "Verde", "Negro", "Blanco"].map((option) => (
                                            <div
                                            key={option}
                                            className={`p-2 cursor-pointer hover:bg-gray-100 ${
                                                selectedColor === option ? "bg-gray-200" : ""
                                            }`}
                                            onClick={() => {
                                                setSelectedColor(option);
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
                            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg w-full md:w-2/4 min-h-[250px] my-5">
                            {loading ? (
                                <p className="text-gray-700 text-center">Generando atuendos...</p>
                            ) : outfits.length === 0 ? (
                                <p className="text-gray-700 text-center">
                                Aquí se mostrarán las prendas seleccionadas o generadas.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {outfits.map((outfit, index) => (
                                    <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                                        {outfit.completo && outfit.calzado ? (
                                        <>
                                            <h4 className="font-semibold mb-2 text-center">Outfit completo</h4>
                                            <img
                                            src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${outfit.completo?.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                            alt={outfit.completo?.type || "Sin tipo"}
                                            className="w-full h-48 object-cover rounded-md mb-2"
                                            />
                                            <img
                                            src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${outfit.calzado?.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                            alt={outfit.calzado?.type || "Sin tipo"}
                                            className="w-full h-48 object-cover rounded-md"
                                            />
                                        </>
                                        ) : outfit.superior && outfit.inferior && outfit.calzado ? (
                                        <>
                                            <h4 className="font-semibold mb-2 text-center">Outfit sugerido</h4>
                                            <img
                                            src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${outfit.superior?.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                            alt={outfit.superior?.type || "Sin tipo"}
                                            className="w-full h-48 object-cover rounded-md mb-2"
                                            />
                                            <img
                                            src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${outfit.inferior?.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                            alt={outfit.inferior?.type || "Sin tipo"}
                                            className="w-full h-48 object-cover rounded-md mb-2"
                                            />
                                            <img
                                            src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${outfit.calzado?.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                            alt={outfit.calzado?.type || "Sin tipo"}
                                            className="w-full h-48 object-cover rounded-md"
                                            />
                                            <Button
                                                variant="dark"
                                                className="mt-3 w-full hover:bg-[#5CA2AE] hover:border-[#5CA2AE]"
                                                onClick={async () => {
                                                    try {
                                                        await outfitController.saveOutfit(outfit, `Outfit ${index + 1}`);
                                                        console.log("Outfit a guardar:", outfit);
                                                        alert("Outfit guardado correctamente");
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Error al guardar el outfit");
                                                    }
                                                }}
                                            >
                                                Guardar outfit
                                            </Button>
                                        </>
                                        ) : (
                                        <p className="text-center text-gray-600">Outfit incompleto</p>
                                        )}
                                    </div>
                                    ))}
                                </div>
                            )}
                            </div>

                            {/* Columna 3: Botones de acción */}
                            <div className="flex flex-col items-center justify-start p-6 rounded-lg w-full md:w-1/4 gap-4">
                                <Link href="/virtual_wardrobe">
                                    <Button
                                        variant="outline-dark"
                                        className="border-2 hover:bg-[#5CA2AE] hover:border-[#5CA2AE] hover:text-white transition-colors"
                                        >
                                        Guardarropa
                                    </Button>
                                </Link>

                                <Button
                                    variant="outline-dark"
                                    className="border-2 hover:bg-[#5CA2AE] hover:border-[#5CA2AE] hover:text-white transition-colors"
                                    onClick={() => setShowModal(true)}
                                >
                                    Seleccionar prenda
                                </Button>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
};
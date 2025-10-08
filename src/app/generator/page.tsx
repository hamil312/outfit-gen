"use client";
import React from "react";
import { JSX } from "react/jsx-runtime";
import Button from 'react-bootstrap/Button';
import { useState } from 'react';

export const Generator = (): JSX.Element => {
    const [selectedContext, setSelectedContext] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<string[]>([]);

    const handleSelectContext = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(event.target.selectedOptions, (o) => o.value);
        setSelectedContext(values);
    };

    const handleSelectColor = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(event.target.selectedOptions, (o) => o.value);
        setSelectedColor(values);
    };

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
        <div className="bg-[#ffffff] overflow-hidden w-full min-w-full h-[2836px] relative">
            <header className="w-full h-[110px] flex items-center justify-between bg-[#ffffff] shadow-small px-8">
            <div className="h-[100px] w-[100px] bg-white rounded-sm overflow-hidden border-2 border-solid border-[#1a1a1a] flex items-center justify-center">
                <img
                    className="w-[96.89%] h-[96.89%]"
                    alt="Vector"
                    src="/figmaAssets/vector-364.svg"
                />
                <img
                    className="w-[96.89%] h-[96.89%]"
                    alt="Vector"
                    src="/figmaAssets/vector-365.svg"
                />
            </div>

            <nav className="flex items-center gap-2">
                
                <Button
                    variant="primary"
                    className="bg-white rounded-lg border-2 border-solid border-[#1a1a1a] px-10 py-2"
                    onClick={() => window.location.href = "/generator"}
                    >
                    <span className="font-patrick-hand-body-lg text-black">Empieza a generar</span>
                </Button>
                <span className="font-patrick-hand-body-lg text-black">Acerca de</span>
                <span className="font-patrick-hand-body-lg text-black">Contactanos</span>
            </nav>

            <div className="flex items-center gap-4">
                <Button
                    className="bg-white rounded-lg border-2 border-solid border-[#1a1a1a] px-4 py-2"
                    variant="outline"
                    >
                    <span className="font-patrick-hand-body-lg text-black">Iniciar sesion</span>
                </Button>
                <Button
                    className="bg-white rounded-lg border-2 border-solid border-[#1a1a1a] px-4 py-2"
                    variant="outline"
                    >
                    <span className="font-patrick-hand-body-lg text-black">Registrarse</span>
                </Button>
                <div className="w-[58px] h-[58px] flex items-center justify-center bg-white rounded-full overflow-hidden border-2 border-solid border-[#1a1a1a]">
                <img
                    className="w-[54px] h-[44px]"
                    alt="Intersect"
                    src="/figmaAssets/intersect.svg"
                />
                </div>
            </div>
            </header>

            <main>
                <section className="absolute top-[150px] left-[calc(50.00%_-_500px)] w-[1000px] font-inter-display-lg font-[number:var(--inter-display-lg-font-weight)] text-black text-[length:var(--inter-display-lg-font-size)] text-center tracking-[var(--inter-display-lg-letter-spacing)] leading-[var(--inter-display-lg-line-height)] [font-style:var(--inter-display-lg-font-style)]">
                    ¿Qué tipo de Outfit quieres hoy?
                </section>

                <div className="top-[344px] h-[2743px] bg-[#d9d9d9] shadow-m3-elevation-light-2 absolute left-0 w-full" />

                <Button
                    className="h-auto flex w-[171px] top-[466px] left-[calc(50.00%_-_85px)] items-center gap-1.5 pt-[5px] pb-[7px] px-2.5 absolute bg-white rounded-lg border-2 border-solid border-[#1a1a1a]"
                    variant="outline"
                >
                    <div className="relative flex items-center justify-center w-fit font-patrick-hand-body-lg font-[number:var(--patrick-hand-body-lg-font-weight)] text-black text-[length:var(--patrick-hand-body-lg-font-size)] text-center tracking-[var(--patrick-hand-body-lg-letter-spacing)] leading-[var(--patrick-hand-body-lg-line-height)] whitespace-nowrap [font-style:var(--patrick-hand-body-lg-font-style)]">
                        Generate
                    </div>
                </Button>

                <div className="flex ">
                    <label htmlFor="context-select">Context:</label>
                        <select
                            id="context-select"
                            multiple={true}
                            value={selectedContext}
                            onChange={handleSelectContext}
                        >
                            <option value="formal">Formal</option>
                            <option value="informal">Informal</option>
                        </select>
                    <label htmlFor="color-select">Color:</label>
                        <select
                            id="color-select"
                            multiple={true}
                            value={selectedColor}
                            onChange={handleSelectColor}
                        >
                            <option value="red">Red</option>
                            <option value="blue">Blue</option>
                            <option value="yellow">Yellow</option>
                            <option value="green">Green</option>
                            <option value="black">Black</option>
                            <option value="white">White</option>
                        </select>
                </div>

                <div className="flex ">
                    <Button
                        variant="primary"
                        className="bg-white rounded-lg border-2 border-solid border-[#1a1a1a] px-10 py-2"
                        onClick={() => window.location.href = "/wardrobe"}
                        >
                        <span className="font-patrick-hand-body-lg text-black">Empieza a generar</span>
                    </Button>

                    <Button
                        variant="primary"
                        className="bg-white rounded-lg border-2 border-solid border-[#1a1a1a] px-10 py-2"
                        >
                        <span className="font-patrick-hand-body-lg text-black">Seleccionar Ropa</span>
                    </Button>
                </div>

                
            </main>

            <footer className="absolute top-[2444px] left-0 w-full h-[392px]">
            <div className="top-0 h-[392px] bg-[#000000] absolute left-0 w-full" />

            <div className="absolute top-[30px] left-[calc(50.00%_-_640px)] w-full text-center font-inter-display-lg font-[number:var(--inter-display-lg-font-weight)] text-neutral-50 text-[length:var(--inter-display-lg-font-size)] tracking-[var(--inter-display-lg-letter-spacing)] leading-[var(--inter-display-lg-line-height)] [font-style:var(--inter-display-lg-font-style)]">
                Contactanos
            </div>

            <div className="flex flex-col items-center justify-center absolute top-[120px] left-[calc(50.00%_-_200px)] w-[400px]">
                {contactInfo.map((contact, index) => (
                <div key={index} className="flex items-center mb-6 w-full justify-center">
                    <img
                    className="w-[41px] h-[41px] object-cover mr-4"
                    alt="Contact icon"
                    src={contact.icon}
                    />
                    {contact.isLink ? (
                    <a
                        className="[font-family:'Patrick_Hand',Helvetica] font-normal text-[#ffffff] text-[28px] tracking-[0] leading-7 underline hover:text-gray-300 transition-colors"
                        href={`mailto:${contact.text}`}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        {contact.text}
                    </a>
                    ) : (
                    <div className="[font-family:'Patrick_Hand',Helvetica] font-normal text-[#ffffff] text-[28px] tracking-[0] leading-7">
                        {contact.text}
                    </div>
                    )}
                </div>
                ))}
            </div>
            </footer>
        </div>
    );
};
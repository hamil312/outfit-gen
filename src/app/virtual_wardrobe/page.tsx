'use client';  

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Resizable } from 'react-resizable';

// Importaciones de react-bootstrap
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

import { MdDragHandle } from 'react-icons/md';
import { BsGrid3X3Gap, BsBootstrap } from 'react-icons/bs';
import { BiSolidTShirt } from "react-icons/bi";
import { PiPants } from "react-icons/pi";
import { BiCloset } from 'react-icons/bi';
import { FaTshirt, FaHeart } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { MdGeneratingTokens } from 'react-icons/md';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-resizable/css/styles.css';

const VirtualWardrobe = () => {
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [windowHeight, setWindowHeight] = useState(800); // valor por defecto

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = (event: any, { size }: { size: { width: number } }) => {
    const newWidth = Math.max(384, Math.min(600, size.width));
    setSidebarWidth(newWidth);
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
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

      {/* Header */}
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold">
            Tu guardarropa virtual
        </h1>
        <div className="w-full max-w-3xl mx-auto mt-4 h-1 bg-black"></div>
      </header> 

      {/* Wardrobe section */}
      <div className="flex">
        {/* Side bar */}
        <div className="relative"> {/* Contenedor para el sidebar y el botón de arrastre */}
          <Resizable
            width={sidebarWidth}
            height={windowHeight}
            onResize={handleResize}
            minConstraints={[384, windowHeight]}
            maxConstraints={[600, windowHeight]}
            handle={
              <div 
                className="absolute right-[-16px] top-1/2 -translate-y-1/2 z-10 h-10 w-4 bg-[#5CA2AE] hover:bg-[#4A8E99] cursor-ew-resize flex items-center justify-center rounded-r-md border-t border-r border-b border-white/20 shadow-md"
                style={{
                  transition: 'background-color 0.2s'
                }}
              >
                <MdDragHandle 
                  className="text-white rotate-90" 
                  size={16}
                />
              </div>
            }
            axis="x"
            resizeHandles={['e']}
          >
            <aside className="w-96 min-h-screen bg-[#5CA2AE] p-6" style={{ fontSize: '1.1rem' }}>
              <Accordion defaultActiveKey="0" className="mb-4">
                {/* Tus prendas section */}
                <Accordion.Item eventKey="0" className="border-0">
                  <Accordion.Header className="py-2">
                    <BiCloset className="me-2" size={24} />
                    <span className="fw-semibold">Tus prendas</span>
                  </Accordion.Header>
                  <Accordion.Body className="bg-[#5CA2AE]">
                    <div className="d-flex flex-column gap-2">
                      <Button variant="outline-light" className="d-flex align-items-center gap-2 py-2 px-3">
                        <BsGrid3X3Gap size={20} />
                        <span>Todas</span>
                      </Button>
                      <Button variant="outline-light" className="d-flex align-items-center gap-2 py-2 px-3">
                        <FaTshirt size={20} />
                        <span>Superiores</span>
                      </Button>
                      <Button variant="outline-light" className="d-flex align-items-center gap-2 py-2 px-3">
                        <PiPants size={20} />
                        <span>Inferiores</span>
                      </Button>
                      <Button variant="outline-light" className="d-flex align-items-center gap-2 py-2 px-3">
                        <BsBootstrap size={20} />
                        <span>Calzado</span>
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Tus atuendos section */}
                <Accordion.Item eventKey="1" className="border-0">
                  <Accordion.Header className="py-2">
                    <BiSolidTShirt className="me-2" size={24} />
                    <span className="fw-semibold">Tus atuendos</span>
                  </Accordion.Header>
                  <Accordion.Body className="bg-[#5CA2AE]">
                    <div className="d-flex flex-column gap-2">
                      <Button variant="outline-light" className="d-flex align-items-center gap-2 py-2 px-3">
                        <BsGrid3X3Gap size={20} />
                        <span>Todos</span>
                      </Button>
                      <Button variant="outline-light" className="d-flex align-items-center gap-2 py-2 px-3">
                        <FaHeart size={20} />
                        <span>Favoritos</span>
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>

              {/* Action buttons */}
              <div className="d-flex flex-column gap-3 mt-4">
                <Button 
                  variant="light" 
                  className="d-flex align-items-center justify-content-center gap-2 py-3"
                  size="lg"
                >
                  <IoMdAdd size={24} />
                  <span className="fw-semibold">Añade prendas</span>
                </Button>
                <Button 
                  variant="light" 
                  className="d-flex align-items-center justify-content-center gap-2 py-3"
                  size="lg"
                >
                  <MdGeneratingTokens size={24} />
                  <span className="fw-semibold">¿Listo para generar?</span>
                </Button>
              </div>
            </aside>
          </Resizable>
        </div>
        {/* Main content area */}
        <main className="flex-1 p-8">
          {/* Contenido principal irá aquí */}
        </main>
      </div>
    </div>
  )
}

export default VirtualWardrobe

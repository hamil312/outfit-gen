'use client';  
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Resizable } from 'react-resizable';

import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AppNavbar from "@/app/components/ui/Navbar";

import { SlOptionsVertical } from "react-icons/sl";
import { BsGrid3X3Gap } from 'react-icons/bs';
import { BiSolidTShirt } from "react-icons/bi";
import { PiPantsFill } from "react-icons/pi";
import { PiSneakerFill } from "react-icons/pi";
import { BiCloset } from 'react-icons/bi';
import { FaTshirt, FaHeart } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { MdGeneratingTokens } from 'react-icons/md';
import { FaEdit, FaTrash } from 'react-icons/fa';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-resizable/css/styles.css';
import ProtectedRoute from "../components/ui/ProtectedRoute";



const VirtualWardrobe = () => {
  const [selectedCategory, setSelectedCategory] = useState('prendas');
  const [selectedSection, setSelectedSection] = useState('todas');

  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [windowHeight, setWindowHeight] = useState(800);

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

  const handleCategoryClick = (category: string, section: string) => {
    setSelectedCategory(category);
    setSelectedSection(section);
  };

  // Función para renderizar el contenido según la selección
  const renderContent = () => {
  if (selectedCategory === 'prendas') {
    if (selectedSection === 'todas') {
      return (
        <div className="space-y-12">
          {/* Sección Superiores */}
          <section>
            <h2 className="text-2xl font-bold text-[#1a2b32] mb-6">Superiores</h2>
            <Row xs={1} md={3} className="g-4">
              {[1, 2, 3].map((item) => (
                <Col key={item}>
                  <Card className="border-2 border-[#5CA2AE]">
                    <Card.Img
                      variant="top"
                      src="/path-to-your-image.jpg"
                      className="h-64 object-cover"
                    />
                    <Card.Body className="p-4">
                      <Card.Title className="text-[#1a2b32] text-lg font-semibold mb-4">
                        Prenda Superior {item}
                      </Card.Title>
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="outline-danger"
                          className="flex items-center gap-2 flex-1"
                        >
                          <FaTrash /> Eliminar
                        </Button>
                        <Button
                          variant="outline-primary"
                          className="flex items-center gap-2 flex-1"
                        >
                          <FaEdit /> Editar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          {/* Sección Inferiores */}
          <section>
            <h2 className="text-2xl font-bold text-[#1a2b32] mb-6">Inferiores</h2>
            <Row xs={1} md={3} className="g-4">
              {[1, 2, 3].map((item) => (
                <Col key={item}>
                  <Card className="border-2 border-[#5CA2AE]">
                    <Card.Img
                      variant="top"
                      src="/path-to-your-image.jpg"
                      className="h-64 object-cover"
                    />
                    <Card.Body className="p-4">
                      <Card.Title className="text-[#1a2b32] text-lg font-semibold mb-4">
                        Prenda Inferior {item}
                      </Card.Title>
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="outline-danger"
                          className="flex items-center gap-2 flex-1"
                        >
                          <FaTrash /> Eliminar
                        </Button>
                        <Button
                          variant="outline-primary"
                          className="flex items-center gap-2 flex-1"
                        >
                          <FaEdit /> Editar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          {/* Sección Calzado */}
          <section>
            <h2 className="text-2xl font-bold text-[#1a2b32] mb-6">Calzado</h2>
            <Row xs={1} md={3} className="g-4">
              {[1, 2, 3].map((item) => (
                <Col key={item}>
                  <Card className="border-2 border-[#5CA2AE]">
                    <Card.Img
                      variant="top"
                      src="/path-to-your-image.jpg"
                      className="h-64 object-cover"
                    />
                    <Card.Body className="p-4">
                      <Card.Title className="text-[#1a2b32] text-lg font-semibold mb-4">
                        Calzado {item}
                      </Card.Title>
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="outline-danger"
                          className="flex items-center gap-2 flex-1"
                        >
                          <FaTrash /> Eliminar
                        </Button>
                        <Button
                          variant="outline-primary"
                          className="flex items-center gap-2 flex-1"
                        >
                          <FaEdit /> Editar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
        </div>
      );
    } else {
      // Para secciones individuales (superiores, inferiores o calzado)
      return (
        <section>
          <h2 className="text-2xl font-bold text-[#1a2b32] mb-6">
            {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
          </h2>
          <Row xs={1} md={3} className="g-4">
            {[1, 2, 3].map((item) => (
              <Col key={item}>
                <Card className="border-2 border-[#5CA2AE]">
                  <Card.Img
                    variant="top"
                    src="/path-to-your-image.jpg"
                    className="h-64 object-cover"
                  />
                  <Card.Body className="p-4">
                    <Card.Title className="text-[#1a2b32] text-lg font-semibold mb-4">
                      {selectedSection === 'superiores' && `Prenda Superior ${item}`}
                      {selectedSection === 'inferiores' && `Prenda Inferior ${item}`}
                      {selectedSection === 'calzado' && `Calzado ${item}`}
                    </Card.Title>
                    <div className="flex justify-between gap-2">
                      <Button
                        variant="outline-danger"
                        className="flex items-center gap-2 flex-1"
                      >
                        <FaTrash /> Eliminar
                      </Button>
                      <Button
                        variant="outline-primary"
                        className="flex items-center gap-2 flex-1"
                      >
                        <FaEdit /> Editar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      );
    }
  } else {
    // Para la sección de atuendos (todos y favoritos)
    return (
      <section>
        <h2 className="text-2xl font-bold text-[#1a2b32] mb-6">
          {selectedSection === 'todos' ? 'Tus atuendos' : 'Atuendos favoritos'}
        </h2>
        <div className="text-center text-gray-500 py-8">
          Contenido de atuendos en desarrollo...
        </div>
      </section>
    );
  }
};

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <AppNavbar /> 
        <header className="py-2 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-center">
            Tu guardarropa virtual
          </h1>
        </header>
        {/* Wardrobe section */}
        <div className="flex">
          {/* Side bar */}
          <div className="relative"> 
            {/* Contenedor para el sidebar y el botón de arrastre */}
            <Resizable
              width={sidebarWidth}
              height={windowHeight}
              onResize={handleResize}
              minConstraints={[384, windowHeight]}
              maxConstraints={[600, windowHeight]}
              resizeHandles={['e']}
              axis="x"
              handle={(
                <div className="react-resizable-handle react-resizable-handle-e flex items-center justify-center h-full absolute right-0 w-4 cursor-ew-resize hover:bg-[#5CA2AE]/10 transition-colors">
                  <div className="h-16 w-6 rounded flex items-center justify-center">
                    <SlOptionsVertical size={28} className="text-[#1a2b32] rotate-45" />
                  </div>
                </div>
              )}
            >
              <aside 
                className="min-h-screen bg-[#5CA2AE] p-6" 
                style={{ 
                  width: `${sidebarWidth}px`,
                  fontSize: '1.1rem'
                }}
              >
                <Accordion defaultActiveKey={['0']} alwaysOpen className="mb-4 mx-2">
                  {/* Tus prendas section */}
                  <Accordion.Item eventKey="0" className="border-0 bg-transparent">
                    <Accordion.Header className="py-2">
                      <BiCloset className="me-2 text-[#1a2b32]" size={24} />
                      <span className="fw-semibold text-[#1a2b32]">Tus prendas</span>
                    </Accordion.Header>
                    <Accordion.Body className="bg-[#5CA2AE]">
                      <div className="d-flex flex-column gap-2">
                        <Button 
                          variant="outline-light" 
                          className="d-flex align-items-center gap-2 py-2 px-3 text-[#1a2b32]"
                          onClick={() => handleCategoryClick('prendas', 'todas')}
                        >
                          <BsGrid3X3Gap size={20} className="text-[#1a2b32]" />
                          <span>Todas</span>
                        </Button>
                        <Button 
                          variant="outline-light" 
                          className="d-flex align-items-center gap-2 py-2 px-3 text-[#1a2b32]"
                          onClick={() => handleCategoryClick('prendas', 'superiores')}
                        >
                          <FaTshirt size={20} className="text-[#1a2b32]" />
                          <span>Superiores</span>
                        </Button>
                        <Button 
                          variant="outline-light" 
                          className="d-flex align-items-center gap-2 py-2 px-3 text-[#1a2b32]"
                          onClick={() => handleCategoryClick('prendas', 'inferiores')}
                        >
                          <PiPantsFill size={20} className="text-[#1a2b32]" />
                          <span>Inferiores</span>
                        </Button>
                        <Button 
                          variant="outline-light" 
                          className="d-flex align-items-center gap-2 py-2 px-3 text-[#1a2b32]"
                          onClick={() => handleCategoryClick('prendas', 'calzado')}
                        >
                          <PiSneakerFill size={20} className="text-[#1a2b32]" />
                          <span>Calzado</span>
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Tus atuendos section */}
                  <Accordion.Item eventKey="1" className="border-0 bg-transparent">
                    <Accordion.Header className="py-2">
                      <BiSolidTShirt className="me-2 text-[#1a2b32]" size={24} />
                      <span className="fw-semibold text-[#1a2b32]">Tus atuendos</span>
                    </Accordion.Header>
                    <Accordion.Body className="bg-[#5CA2AE]">
                      <div className="d-flex flex-column gap-2">
                        <Button 
                          variant="outline-light" 
                          className="d-flex align-items-center gap-2 py-2 px-3 text-[#1a2b32]"
                          onClick={() => handleCategoryClick('atuendos', 'todos')}
                        >
                          <BsGrid3X3Gap size={20} className="text-[#1a2b32]" />
                          <span>Todos</span>
                        </Button>
                        <Button 
                          variant="outline-light" 
                          className="d-flex align-items-center gap-2 py-2 px-3 text-[#1a2b32]"
                          onClick={() => handleCategoryClick('atuendos', 'favoritos')}
                        >
                          <FaHeart size={20} className="text-[#1a2b32]" />
                          <span>Favoritos</span>
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                {/* Action buttons */}
                <div className="flex flex-col gap-4 mt-8 px-4">
                  <Button 
                    variant="light" 
                    className="flex items-center justify-center gap-2 py-2 px-4 w-full bg-white hover:bg-gray-100 transition-colors border-2 border-[#5CA2AE] rounded-lg text-[#1a2b32]"
                  >
                    <IoMdAdd size={20} className="text-[#1a2b32]" />
                    <span className="font-medium">Añade prendas</span>
                  </Button>
                  <Button 
                    variant="light" 
                    className="flex items-center justify-center gap-2 py-2 px-4 w-full bg-white hover:bg-gray-100 transition-colors border-2 border-[#5CA2AE] rounded-lg text-[#1a2b32]"
                  >
                    <MdGeneratingTokens size={20} className="text-[#1a2b32]" />
                    <span className="font-medium">¿Listo para generar?</span>
                  </Button>
                </div>
              </aside>
            </Resizable>
          </div>
          {/* Main content area */}
          <main className="flex-1 m-4 p-8">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <Breadcrumb.Item 
                className="text-[#1a2b32] text-2xl font-bold hover:text-[#1a2b32] no-underline"
                href="#"
                linkProps={{ className: "hover:no-underline" }}
              >
                {selectedCategory === 'prendas' ? 'Tus prendas' : 'Tus atuendos'}
              </Breadcrumb.Item>
              <Breadcrumb.Item 
                active
                className="text-[#1a2b32] text-2xl font-bold"
              >
                {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
              </Breadcrumb.Item>
            </Breadcrumb>
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default VirtualWardrobe

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
import Modal from "react-bootstrap/Modal";
import ClothingForm from "@/app/components/ui/ClothingForm";

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
import { BsStars } from "react-icons/bs";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-resizable/css/styles.css';
import ProtectedRoute from "../components/ui/ProtectedRoute";
import { Clothing } from "../models/Clothing";
import { mapClothingTypeToSection } from "@/lib/ClothingCategoryMapper";
import { clothingController } from "../controllers/ClothingController";
import { outfitController } from "../controllers/OutfitController";
import { account } from "@/lib/appwrite";

const VirtualWardrobe = () => {
  const [selectedCategory, setSelectedCategory] = useState('prendas');
  const [selectedSection, setSelectedSection] = useState('todas');
  const [clothes, setClothes] = useState<Clothing[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<Clothing | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    account.get().then(u => setUserId(u.$id));
  }, []);

  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [windowHeight, setWindowHeight] = useState(800);
  const [showForm, setShowForm] = useState(false);

  const upperClothes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "superior");
  const lowerClothes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "inferior");
  const shoes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "calzado");

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    const fetchClothes = async () => {
      try {
        const items = await clothingController.getUserClothes();
        setClothes(items);
      } catch (error) {
        console.error("Error al cargar prendas:", error);
      }
    };

    fetchClothes();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await clothingController.getUserClothes();
        setClothes(items);

        if (selectedCategory === "atuendos") {
          const userOutfits = await outfitController.getUserOutfits();
          setOutfits(userOutfits);
        }

      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const handleResize = (event: any, { size }: { size: { width: number } }) => {
    const newWidth = Math.max(384, Math.min(600, size.width));
    setSidebarWidth(newWidth);
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!confirm("¿Deseas eliminar este atuendo?")) return;

    try {
      await outfitController.deleteOutfit(outfitId);

      // Remover del estado local
      setOutfits(prev => prev.filter(o => o.$id !== outfitId));
    } catch (error) {
      console.error("Error al eliminar atuendo:", error);
      alert("No se pudo eliminar el atuendo.");
    }
  };

  const handleEdit = (item: Clothing) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCategoryClick = (category: string, section: string) => {
    setSelectedCategory(category);
    setSelectedSection(section);
  };

  const handleDelete = async (item: Clothing) => {
    if (!confirm(`¿Eliminar esta prenda (${item.name})?`)) return;

    try {
      await clothingController.deleteClothing(item);

      // Remover del estado local
      setClothes(prev => prev.filter(c => c.$id !== item.$id));
    } catch (error) {
      console.error("Error al eliminar prenda:", error);
      alert("No se pudo eliminar la prenda.");
    }
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
                {upperClothes.length > 0 ? (
                  upperClothes.map(item => (
                    <Col key={item.$id}>
                      <Card className="border-2 border-white">
                        <Card.Img
                          variant="top"
                          src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${item.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                          className="h-64 object-cover"
                        />
                        <Card.Body className="p-4">
                          <Card.Title className="text-[#1a2b32] text-lg font-semibold mb-4">
                            {item.name} — {item.color}
                          </Card.Title>
                          <div className="flex justify-between gap-2">
                            <Button
                              variant="outline-danger"
                              className="flex items-center gap-2 flex-1"
                              onClick={() => handleDelete(item)}
                            >
                              <FaTrash /> Eliminar
                            </Button>
                            <Button
                              variant="outline-primary"
                              className="flex items-center gap-2 flex-1"
                              onClick={() => handleEdit(item)}
                            >
                              <FaEdit /> Editar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <p className="text-gray-500">No hay prendas superiores registradas.</p>
                )}
              </Row>
            </section>

            {/* Sección Inferiores */}
            <section>
              <h2 className="text-2xl font-bold text-[#1a2b32] mb-6">Inferiores</h2>
              <Row xs={1} md={3} className="g-4">
                {lowerClothes.length > 0 ? (
                  lowerClothes.map(item => (
                    <Col key={item.$id}>
                      <Card className="border-2 border-white">
                        <Card.Img
                          variant="top"
                          src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${item.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                          className="h-64 object-cover"
                        />
                        <Card.Body className="p-4">
                          <Card.Title className="text-[#1a2b32] text-lg font-semibold mb-4">
                            {item.name} — {item.color}
                          </Card.Title>
                          <div className="flex justify-between gap-2">
                            <Button
                              variant="outline-danger"
                              className="flex items-center gap-2 flex-1"
                              onClick={() => handleDelete(item)}
                            >
                              <FaTrash /> Eliminar
                            </Button>
                            <Button
                              variant="outline-primary"
                              className="flex items-center gap-2 flex-1"
                              onClick={() => handleEdit(item)}
                            >
                              <FaEdit /> Editar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <p className="text-gray-500">No hay prendas inferiores registradas.</p>
                )}
              </Row>
            </section>

            {/* Sección Calzado */}
            <section>
              <h2 className="text-2xl font-bold text-[#1a2b32] mb-6">Calzado</h2>
              <Row xs={1} md={3} className="g-4">
                {shoes.length > 0 ? (
                  shoes.map(item => (
                    <Col key={item.$id}>
                      <Card className="border-2 border-white">
                        <Card.Img
                          variant="top"
                          src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${item.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                          className="h-64 object-cover"
                        />
                        <Card.Body className="p-4">
                          <Card.Title className="text-[#1a2b32] text-lg font-semibold mb-4">
                            {item.name} — {item.color}
                          </Card.Title>
                          <div className="flex justify-between gap-2">
                            <Button
                              variant="outline-danger"
                              className="flex items-center gap-2 flex-1"
                              onClick={() => handleDelete(item)}
                            >
                              <FaTrash /> Eliminar
                            </Button>
                            <Button
                              variant="outline-primary"
                              className="flex items-center gap-2 flex-1"
                              onClick={() => handleEdit(item)}
                            >
                              <FaEdit /> Editar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <p className="text-gray-500">No hay prendas superiores registradas.</p>
                )}
              </Row>
            </section>
          </div>
        );
      } else {
        // Filtrar prendas según la sección seleccionada
        let filteredClothes: Clothing[] = [];

        if (selectedSection === "superiores") filteredClothes = upperClothes;
        if (selectedSection === "inferiores") filteredClothes = lowerClothes;
        if (selectedSection === "calzado") filteredClothes = shoes;

        return (
          <section>
            <h2 className="text-2xl font-bold text-[#1a2b32] mb-6">
              {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
            </h2>
            <Row xs={1} md={3} className="g-4">
              {filteredClothes.length > 0 ? (
                filteredClothes.map((item) => (
                  <Col key={item.$id}>
                    <Card className="border-2 border-white">
                      <Card.Img
                        variant="top"
                        src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${item.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                        className="h-64 object-cover"
                      />
                      <Card.Body className="p-4">
                        <Card.Title className="text-[#1a2b32] text-lg font-semibold mb-4">
                          {item.name} — {item.color}
                        </Card.Title>
                        <div className="flex justify-between gap-2">
                          <Button
                              variant="outline-danger"
                              className="flex items-center gap-2 flex-1"
                              onClick={() => handleDelete(item)}
                            >
                              <FaTrash /> Eliminar
                            </Button>
                          <Button
                            variant="outline-primary"
                            className="flex items-center gap-2 flex-1"
                            onClick={() => handleEdit(item)}
                          >
                            <FaEdit /> Editar
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <p className="text-gray-500">
                  No hay prendas {selectedSection} registradas.
                </p>
              )}
            </Row>
          </section>
        );
      }
    } else {
      // Para la sección de atuendos (todos y favoritos)
      return (
        <section className="space-y-12">
          {outfits.map(outfit => {

              // Crear array dinámico con IDs válidas
              const outfitItems = [
                outfit.superior,
                outfit.inferior,
                outfit.shoes
              ].filter(Boolean);

              return (
                <div key={outfit.$id} className="space-y-4">

                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#1a2b32]">
                      {outfit.name || "Outfit sin nombre"}
                    </h3>

                    <Button
                      variant="outline-danger"
                      className="flex items-center gap-2"
                      onClick={() => handleDeleteOutfit(outfit.$id)}
                    >
                      <FaTrash /> Eliminar
                    </Button>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {outfitItems.map((id: string) => {
                      const item = clothes.find(c => c.$id === id);
                      if (!item) return null;

                      return (
                        <div
                          key={id}
                          className="size-[30%] bg-white shadow rounded-lg border border-gray-200"
                        >
                          <img
                            src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${item.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                            className="h-40 w-full object-cover object-top rounded-t-lg"
                          />
                          <div className="p-2 text-center">
                            <p className="font-semibold">{item.type}</p>
                            <p className="text-sm text-gray-600">{item.color}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
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
                <div className="react-resizable-handle react-resizable-handle-e flex items-center justify-center h-full absolute right-0 w-4 cursor-ew-resize hover:bg-[#e2e8f0]/10 transition-colors">
                  <div className="h-16 w-6 rounded flex items-center justify-center">
                    <SlOptionsVertical size={28} className="text-[#1a2b32] rotate-45" />
                  </div>
                </div>
              )}
            >
              <aside 
                className="h-full sticky top-0 bg-[#e2e8f0] p-6 overflow-y-auto" 
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
                    <Accordion.Body className="bg-[#e2e8f0]">
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
                    <Accordion.Body className="bg-[#e2e8f0]">
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
                  className="flex items-center justify-center gap-2 py-2 px-4 w-full bg-white hover:bg-gray-100 transition-colors border-2 border-[#e2e8f0] rounded-lg text-[#1a2b32]"
                  onClick={() => setShowForm(true)}
                >
                    <IoMdAdd size={20} className="text-[#1a2b32]" />
                    <span className="font-medium">Añade prendas</span>
                  </Button>
                  <Button 
                    variant="light" 
                    className="flex items-center justify-center gap-2 py-2 px-4 w-full bg-white hover:bg-gray-100 transition-colors border-2 border-[#e2e8f0] rounded-lg text-[#1a2b32]"
                  >
                    <BsStars size={20} className="text-[#1a2b32]" />
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
        <Modal show={showForm} onHide={() => setShowForm(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Añadir prenda</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ClothingForm
              mode="create"
              onSubmit={(values, file) => clothingController.addClothing(file!, {...values, userId})}
            />
          </Modal.Body>
        </Modal>
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar prenda</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingItem && (
              <ClothingForm
                initialValues={editingItem}
                mode="edit"
                onSubmit={async (updatedValues) => {
                  try {
                    if (!editingItem?.$id) {
                        alert("Error: prenda sin ID");
                        return;
                    }

                    function normalizeDoc(doc: any): Clothing {
                      return {
                        $id: doc.$id,
                        name: doc.name,
                        color: doc.color,
                        type: doc.type,
                        material: doc.material,
                        size: doc.size,
                        occasion: doc.occasion,
                        image: doc.image,
                        userId: doc.userId,
                      };
                    }

                    const updatedDoc = await clothingController.updateClothing(editingItem.$id, updatedValues);
                    const updated = normalizeDoc(updatedDoc);

                    setClothes(prev =>
                      prev.map(c => c.$id === updated.$id ? updated : c)
                    );

                    setShowEditModal(false);
                  } catch (error) {
                    console.error("Error al actualizar prenda:", error);
                    alert("No se pudo actualizar la prenda.");
                  }
                }}
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}

export default VirtualWardrobe

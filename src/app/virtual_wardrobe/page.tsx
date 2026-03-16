'use client';
import React, { useState, useEffect } from "react";
import { Resizable } from 'react-resizable';
import Accordion from 'react-bootstrap/Accordion';
import Modal from "react-bootstrap/Modal";
import AppNavbar from "@/app/components/ui/Navbar";
import ClothingForm from "@/app/components/ui/ClothingForm";
import ProtectedRoute from "../components/ui/ProtectedRoute";

import { SlOptionsVertical } from "react-icons/sl";
import { BsGrid3X3Gap } from 'react-icons/bs';
import { BiSolidTShirt } from "react-icons/bi";
import { PiPantsFill, PiSneakerFill } from "react-icons/pi";
import { BiCloset } from 'react-icons/bi';
import { FaTshirt, FaHeart, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { BsStars } from "react-icons/bs";
import { IoShirtOutline } from "react-icons/io5";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-resizable/css/styles.css';

import { Clothing } from "../models/Clothing";
import { mapClothingTypeToSection } from "@/lib/ClothingCategoryMapper";
import { clothingController } from "../controllers/ClothingController";
import { outfitController } from "../controllers/OutfitController";
import { favouriteController } from "../controllers/FavouriteController";
import { account } from "@/lib/appwrite";

// ─── Image URL helper ─────────────────────────────────────────────────────────
const imgUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

// ─── Clothing card ────────────────────────────────────────────────────────────
const ClothingCard = ({
  item,
  onDelete,
  onEdit,
}: {
  item: Clothing;
  onDelete: (item: Clothing) => void;
  onEdit: (item: Clothing) => void;
}) => (
  <div className="vw-clothing-card">
    <div className="vw-clothing-img-wrap">
      <img src={imgUrl(item.image ?? '')} alt={item.name} className="vw-clothing-img" />
    </div>
    <div className="vw-clothing-body">
      <p className="vw-clothing-name">{item.name}</p>
      <p className="vw-clothing-color">{item.color}</p>
      <div className="vw-clothing-actions">
        <button className="vw-btn vw-btn--danger" onClick={() => onDelete(item)}>
          <FaTrash size={13} /> Eliminar
        </button>
        <button className="vw-btn vw-btn--primary" onClick={() => onEdit(item)}>
          <FaEdit size={13} /> Editar
        </button>
      </div>
    </div>
  </div>
);

// ─── Clothes section ──────────────────────────────────────────────────────────
const ClothesSection = ({
  title,
  items,
  onDelete,
  onEdit,
}: {
  title: string;
  items: Clothing[];
  onDelete: (item: Clothing) => void;
  onEdit: (item: Clothing) => void;
}) => (
  <section className="vw-section">
    <h2 className="vw-section-title">{title}</h2>
    {items.length > 0 ? (
      <div className="vw-clothes-grid">
        {items.map(item => (
          <ClothingCard key={item.$id} item={item} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    ) : (
      <p className="vw-empty-msg">No hay prendas {title.toLowerCase()} registradas.</p>
    )}
  </section>
);

// ─── Main component ───────────────────────────────────────────────────────────
const VirtualWardrobe = () => {
  const [selectedCategory, setSelectedCategory] = useState('prendas');
  const [selectedSection, setSelectedSection]   = useState('todas');
  const [clothes, setClothes]     = useState<Clothing[]>([]);
  const [outfits, setOutfits]     = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<Clothing | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [userId, setUserId]       = useState<string>("");
  const [sidebarWidth, setSidebarWidth]   = useState(300);
  const [windowHeight, setWindowHeight]   = useState(800);

  const upperClothes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "superior");
  const lowerClothes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "inferior");
  const shoes        = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "calzado");

  useEffect(() => {
    account.get().then(u => setUserId(u.$id));
  }, []);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const onResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    clothingController.getUserClothes().then(setClothes).catch(console.error);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await clothingController.getUserClothes();
        setClothes(items);
        if (selectedCategory === "atuendos") {
          const fn = selectedSection === 'favoritos'
            ? outfitController.getFavouriteOutfits
            : outfitController.getUserOutfits;
          setOutfits((await fn()) || []);
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [selectedCategory, selectedSection]);

  const handleResize = (_: any, { size }: { size: { width: number } }) => {
    setSidebarWidth(Math.max(260, Math.min(500, size.width)));
  };

  const handleDelete = async (item: Clothing) => {
    if (!confirm(`¿Eliminar esta prenda (${item.name})?`)) return;
    try {
      await clothingController.deleteClothing(item);
      setClothes(prev => prev.filter(c => c.$id !== item.$id));
    } catch { alert("No se pudo eliminar la prenda."); }
  };

  const handleEdit = (item: Clothing) => { setEditingItem(item); setShowEditModal(true); };

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!confirm("¿Deseas eliminar este atuendo?")) return;
    try {
      await outfitController.deleteOutfit(outfitId);
      setOutfits(prev => prev.filter(o => o.$id !== outfitId));
    } catch (error: any) {
      if (error?.message?.includes('No autorizado')) { alert('No tienes permiso.'); return; }
      if (error?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert("No se pudo eliminar el atuendo.");
    }
  };

  const handleTogglePublish = async (outfitId: string, currentPublic?: boolean) => {
    if (!confirm(currentPublic ? "¿Despublicar?" : "¿Publicar?")) return;
    try {
      const updated = await outfitController.publishOutfit(outfitId, !currentPublic);
      setOutfits(prev => prev.map(o => o.$id === outfitId ? { ...o, public: !!(updated as any)?.public || !currentPublic } : o));
    } catch (error: any) {
      if (error?.message?.includes('No autorizado')) { alert('Sin permiso.'); return; }
      if (error?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert("No se pudo actualizar.");
    }
  };

  const handleRemoveFavourite = async (outfitId: string) => {
    setOutfits(prev => prev.filter(o => o.$id !== outfitId));
    try {
      await favouriteController.toggleFavourite(outfitId);
    } catch (err: any) {
      if (err?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert('No se pudo quitar de favoritos');
      const favOutfits = await outfitController.getFavouriteOutfits();
      setOutfits(favOutfits || []);
    }
  };

  const handleCategoryClick = (category: string, section: string) => {
    setSelectedCategory(category);
    setSelectedSection(section);
  };

  // ─── Sidebar nav items ──────────────────────────────────────────────────────
  const navClothes = [
    { label: 'Todas',      section: 'todas',      icon: <BsGrid3X3Gap size={18} /> },
    { label: 'Superiores', section: 'superiores', icon: <FaTshirt size={18} /> },
    { label: 'Inferiores', section: 'inferiores', icon: <PiPantsFill size={18} /> },
    { label: 'Calzado',    section: 'calzado',    icon: <PiSneakerFill size={18} /> },
  ];
  const navOutfits = [
    { label: 'Todos',      section: 'todos',      icon: <BsGrid3X3Gap size={18} /> },
    { label: 'Favoritos',  section: 'favoritos',  icon: <FaHeart size={18} /> },
  ];

  // ─── Render content ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (selectedCategory === 'prendas') {
      if (selectedSection === 'todas') {
        return (
          <div className="vw-content-sections">
            <ClothesSection title="Superiores" items={upperClothes} onDelete={handleDelete} onEdit={handleEdit} />
            <ClothesSection title="Inferiores" items={lowerClothes} onDelete={handleDelete} onEdit={handleEdit} />
            <ClothesSection title="Calzado"    items={shoes}        onDelete={handleDelete} onEdit={handleEdit} />
          </div>
        );
      }
      const filtered =
        selectedSection === 'superiores' ? upperClothes :
        selectedSection === 'inferiores' ? lowerClothes : shoes;

      return (
        <ClothesSection
          title={selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
          items={filtered}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      );
    }

    // Outfits view
    if (outfits.length === 0) {
      return (
        <div className="vw-empty-state">
          <IoShirtOutline className="vw-empty-icon" />
          <p className="vw-empty-text">No hay atuendos aquí todavía.</p>
        </div>
      );
    }

    return (
      <div className="vw-content-sections">
        {outfits.map(outfit => {
          const outfitItems = [outfit.superior, outfit.inferior, outfit.shoes]
            .filter(Boolean)
            .map((id: string) => {
              const fromOutfit = (outfit.clothes || []).find((c: any) => c.$id === id);
              const fromUser   = clothes.find(c => c.$id === id);
              return fromOutfit || fromUser;
            })
            .filter(Boolean);

          return (
            <div key={outfit.$id} className="vw-outfit-block">
              <div className="vw-outfit-header">
                <h3 className="vw-outfit-name">{outfit.name || "Outfit sin nombre"}</h3>
                <div className="vw-outfit-actions">
                  {selectedSection === 'favoritos' && (
                    <button className="vw-btn vw-btn--danger" onClick={() => handleRemoveFavourite(outfit.$id)}>
                      <FaHeart size={13} /> Quitar favorito
                    </button>
                  )}
                  {outfit.userId === userId ? (
                    <>
                      <button
                        className={`vw-btn ${outfit.public ? 'vw-btn--secondary' : 'vw-btn--primary'}`}
                        onClick={() => handleTogglePublish(outfit.$id, outfit.public)}
                      >
                        {outfit.public ? <><FaEyeSlash size={13} /> Despublicar</> : <><FaEye size={13} /> Publicar</>}
                      </button>
                      <button className="vw-btn vw-btn--danger" onClick={() => handleDeleteOutfit(outfit.$id)}>
                        <FaTrash size={13} /> Eliminar
                      </button>
                    </>
                  ) : (
                    <span className="vw-outfit-author">Autor: {outfit.userName || outfit.userId}</span>
                  )}
                </div>
              </div>

              <div className="vw-outfit-items">
                {outfitItems.map((item: any) => !item ? null : (
                  <div key={item.$id} className="vw-outfit-item">
                    <img
                      src={imgUrl(item.image)}
                      alt={item.type}
                      className="vw-outfit-item-img"
                    />
                    <div className="vw-outfit-item-label">
                      <p className="vw-outfit-item-type">{item.type}</p>
                      <p className="vw-outfit-item-color">{item.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className="vw-root">
        <AppNavbar />

        <header className="vw-page-header">
          <h1 className="vw-page-title">Tu guardarropa virtual</h1>
        </header>

        <div className="vw-layout">

          {/* ── Sidebar ── */}
          <div className="vw-sidebar-wrap">
            <Resizable
              width={sidebarWidth}
              height={windowHeight}
              onResize={handleResize}
              minConstraints={[260, windowHeight]}
              maxConstraints={[500, windowHeight]}
              resizeHandles={['e']}
              axis="x"
              handle={(
                <div className="vw-resize-handle react-resizable-handle react-resizable-handle-e">
                  <div className="vw-resize-grip">
                    <SlOptionsVertical size={20} className="vw-resize-icon" />
                  </div>
                </div>
              )}
            >
              <aside className="vw-sidebar" style={{ width: `${sidebarWidth}px` }}>

                <Accordion defaultActiveKey={['0']} alwaysOpen className="vw-accordion">

                  {/* Prendas */}
                  <Accordion.Item eventKey="0" className="vw-accordion-item">
                    <Accordion.Header>
                      <BiCloset size={20} className="vw-accordion-icon" />
                      <span className="vw-accordion-label">Tus prendas</span>
                    </Accordion.Header>
                    <Accordion.Body className="vw-accordion-body">
                      {navClothes.map(({ label, section, icon }) => (
                        <button
                          key={section}
                          className={`vw-nav-btn ${selectedCategory === 'prendas' && selectedSection === section ? 'vw-nav-btn--active' : ''}`}
                          onClick={() => handleCategoryClick('prendas', section)}
                        >
                          {icon}
                          <span>{label}</span>
                        </button>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Atuendos */}
                  <Accordion.Item eventKey="1" className="vw-accordion-item">
                    <Accordion.Header>
                      <BiSolidTShirt size={20} className="vw-accordion-icon" />
                      <span className="vw-accordion-label">Tus atuendos</span>
                    </Accordion.Header>
                    <Accordion.Body className="vw-accordion-body">
                      {navOutfits.map(({ label, section, icon }) => (
                        <button
                          key={section}
                          className={`vw-nav-btn ${selectedCategory === 'atuendos' && selectedSection === section ? 'vw-nav-btn--active' : ''}`}
                          onClick={() => handleCategoryClick('atuendos', section)}
                        >
                          {icon}
                          <span>{label}</span>
                        </button>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>

                </Accordion>

                {/* Action buttons */}
                <div className="vw-sidebar-actions">
                  <button className="vw-sidebar-action-btn" onClick={() => setShowForm(true)}>
                    <IoMdAdd size={18} />
                    <span>Añadir prenda</span>
                  </button>
                  <button className="vw-sidebar-action-btn vw-sidebar-action-btn--accent">
                    <BsStars size={18} />
                    <span>¿Listo para generar?</span>
                  </button>
                </div>

              </aside>
            </Resizable>
          </div>

          {/* ── Main content ── */}
          <main className="vw-main">
            <nav className="vw-breadcrumb">
              <span className="vw-breadcrumb-root">
                {selectedCategory === 'prendas' ? 'Tus prendas' : 'Tus atuendos'}
              </span>
              <span className="vw-breadcrumb-sep">/</span>
              <span className="vw-breadcrumb-active">
                {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
              </span>
            </nav>
            {renderContent()}
          </main>

        </div>

        {/* ── Add clothing modal ── */}
        <Modal show={showForm} onHide={() => setShowForm(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Añadir prenda</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ClothingForm
              mode="create"
              onSubmit={(values, file) => clothingController.addClothing(file!, { ...values, userId })}
            />
          </Modal.Body>
        </Modal>

        {/* ── Edit clothing modal ── */}
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
                    if (!editingItem?.$id) { alert("Error: prenda sin ID"); return; }
                    const normalizeDoc = (doc: any): Clothing => ({
                      $id: doc.$id, name: doc.name, color: doc.color, type: doc.type,
                      material: doc.material, size: doc.size, occasion: doc.occasion,
                      image: doc.image, userId: doc.userId,
                    });
                    const updatedDoc = await clothingController.updateClothing(editingItem.$id, updatedValues);
                    const updated = normalizeDoc(updatedDoc);
                    setClothes(prev => prev.map(c => c.$id === updated.$id ? updated : c));
                    setShowEditModal(false);
                  } catch {
                    alert("No se pudo actualizar la prenda.");
                  }
                }}
              />
            )}
          </Modal.Body>
        </Modal>

      </div>
    </ProtectedRoute>
  );
};

export default VirtualWardrobe;
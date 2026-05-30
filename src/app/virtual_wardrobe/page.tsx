'use client';
import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import AppNavbar from "@/app/components/ui/Navbar";
import ClothingForm from "@/app/components/ui/ClothingForm";
import ProtectedRoute from "../components/ui/ProtectedRoute";

import { BsGrid3X3Gap } from 'react-icons/bs';
import { PiPantsFill, PiSneakerFill } from "react-icons/pi";
import { FaTshirt, FaHeart, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { BsStars } from "react-icons/bs";
import { IoShirtOutline } from "react-icons/io5";

import 'bootstrap/dist/css/bootstrap.min.css';

import { Clothing } from "../models/Clothing";
import { mapClothingTypeToSection } from "@/lib/ClothingCategoryMapper";
import { clothingController } from "../controllers/ClothingController";
import { outfitController } from "../controllers/OutfitController";
import { favouriteController } from "../controllers/FavouriteController";
import { account } from "@/lib/appwrite";

// ─── Helper de URL de imagen ─────────────────────────────────────────────────────────
const imgUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

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
      <img src={imgUrl(item.image ?? '')} alt={`Imagen de prenda: ${item.name}, color: ${item.color}`} className="vw-clothing-img" />
    </div>
    <div className="vw-clothing-body">
      <p className="vw-clothing-name">{item.name}</p>
      <p className="vw-clothing-color">{item.color}</p>
      {item.material && item.material !== "Desconocido" && <p className="vw-clothing-detail">{item.material}</p>}
      {item.print && item.print !== "Desconocido" && <p className="vw-clothing-detail">{item.print}</p>}
      {item.style && item.style !== "Desconocido" && <p className="vw-clothing-detail">{item.style}</p>}
      {item.size && <span className="vw-clothing-size">{item.size}</span>}
      <div className="vw-clothing-actions">
        <button className="vw-btn vw-btn--danger" onClick={() => onDelete(item)}>
          <FaTrash size={12} aria-hidden="true" /> Eliminar
        </button>
        <button className="vw-btn vw-btn--primary" onClick={() => onEdit(item)}>
          <FaEdit size={12} aria-hidden="true" /> Editar
        </button>
      </div>
    </div>
  </div>
);

// ─── Sección de prendas ──────────────────────────────────────────────────────────
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

// ─── Componente central ───────────────────────────────────────────────────────────
const VirtualWardrobe = () => {
  // Estados de la UI para navegar por las secciones.
  const [selectedCategory, setSelectedCategory] = useState('prendas');
  const [selectedSection, setSelectedSection]   = useState('todas');
  const [clothes, setClothes]     = useState<Clothing[]>([]);
  const [outfits, setOutfits]     = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<Clothing | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishOutfitId, setPublishOutfitId] = useState<string | null>(null);
  const [publishName, setPublishName] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [userId, setUserId]       = useState<string>("");
  const upperClothes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "superior");
  const lowerClothes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "inferior");
  const shoes        = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "calzado");

  useEffect(() => {
    account.get().then(u => setUserId(u.$id));
  }, []);

  useEffect(() => {
    clothingController.getUserClothes().then(setClothes).catch(console.error);
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

  // Cerrar modales al presionar Escape.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showForm) setShowForm(false);
        if (publishModalOpen) setPublishModalOpen(false);
        if (showEditModal) setShowEditModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm, publishModalOpen, showEditModal]);

  // Remover una prenda y actualizar el estado local tras su eliminación.
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

  const handlePublishClick = (outfitId: string) => {
    const outfit = outfits.find(o => o.$id === outfitId);
    setPublishOutfitId(outfitId);
    setPublishName(outfit?.name || "");
    setPublishDescription(outfit?.description || "");
    setPublishModalOpen(true);
  };

  const handleTogglePublish = async (outfitId: string, currentPublic?: boolean) => {
    if (!currentPublic) {
      handlePublishClick(outfitId);
      return;
    }

    if (!confirm("¿Despublicar?")) return;
    try {
      const updated = await outfitController.publishOutfit(outfitId, false);
      setOutfits(prev => prev.map(o => o.$id === outfitId ? { ...o, ...(updated as any) } : o));
    } catch (error: any) {
      if (error?.message?.includes('No autorizado')) { alert('Sin permiso.'); return; }
      if (error?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert("No se pudo actualizar.");
    }
  };

  const handleConfirmPublish = async () => {
    if (!publishOutfitId) return;
    setPublishLoading(true);

    try {
      const updated = await outfitController.publishOutfit(publishOutfitId, true, publishDescription, publishName);
      setOutfits(prev => prev.map(o => o.$id === publishOutfitId ? { ...o, ...(updated as any), public: true, description: publishDescription, name: publishName } : o));
      setPublishModalOpen(false);
      setPublishOutfitId(null);
      setPublishName("");
      setPublishDescription("");
    } catch (error: any) {
      if (error?.message?.includes('No autorizado')) { alert('Sin permiso.'); return; }
      if (error?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert("No se pudo publicar el atuendo.");
    } finally {
      setPublishLoading(false);
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

  // ─── Objetos de la sidebar ──────────────────────────────────────────────────────
  const navClothes = [
    { label: 'Todas',      section: 'todas',      icon: <BsGrid3X3Gap size={18} /> },
    { label: 'Superiores', section: 'superiores', icon: <FaTshirt size={18} /> },
    { label: 'Inferiores', section: 'inferiores', icon: <PiPantsFill size={18} /> },
    { label: 'Calzado',    section: 'calzado',    icon: <PiSneakerFill size={18} /> },
  ];
  const navOutfits = [
    { label: 'Planeados',  section: 'todos',      icon: <BsGrid3X3Gap size={18} /> },
    { label: 'Favoritos',  section: 'favoritos',  icon: <FaHeart size={18} /> },
  ];

  // ─── Renderizar contenido ─────────────────────────────────────────────────────────
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

    // Vista de outfits (tanto favoritos como todos) - muestra los atuendos del usuario o sus favoritos, con opciones para publicar/despublicar, eliminar o quitar de favoritos según corresponda.
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
                      <FaHeart size={13} aria-hidden="true" /> Quitar favorito
                    </button>
                  )}
                  {outfit.userId === userId ? (
                    <>
                      <button
                        className={`vw-btn ${outfit.public ? 'vw-btn--secondary' : 'vw-btn--primary'}`}
                        onClick={() => handleTogglePublish(outfit.$id, outfit.public)}
                      >
                        {outfit.public ? <><FaEyeSlash size={13} aria-hidden="true" /> Despublicar</> : <><FaEye size={13} aria-hidden="true" /> Publicar</>}
                      </button>
                      <button className="vw-btn vw-btn--danger" onClick={() => handleDeleteOutfit(outfit.$id)}>
                        <FaTrash size={13} aria-hidden="true" /> Eliminar
                      </button>
                    </>
                  ) : (
                    <span className="vw-outfit-author">Autor: {outfit.userName || outfit.userId}</span>
                  )}
                </div>
              </div>
              {/*Aquí podemos ver como se muestra el atuendo, el componente alt se genera de forma dinámica*/}
              <div className="vw-outfit-items">
                {outfitItems.map((item: any) => !item ? null : (
                  <div key={item.$id} className="vw-outfit-item">
                    <img
                      src={imgUrl(item.image)}
                      alt={`Prenda del outfit: ${item.type}, color: ${item.color}`}
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
          <aside className="vw-sidebar">

            <p className="vw-sidebar-group-label">Prendas</p>
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

            <p className="vw-sidebar-group-label">Atuendos</p>
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

            <div className="vw-sidebar-actions">
              <button className="vw-sidebar-action-btn vw-sidebar-action-btn--primary" onClick={() => setShowForm(true)}>
                <IoMdAdd size={18} aria-hidden="true" />
                <span>AÑADIR PRENDA</span>
              </button>
              <button className="vw-sidebar-action-btn vw-sidebar-action-btn--outline">
                <BsStars size={18} aria-hidden="true" />
                <span>¿LISTO PARA GENERAR?</span>
              </button>
            </div>

          </aside>

          {/* ── Contenido Principal ── */}
          <main className="vw-main">
            <nav className="vw-breadcrumb">
              <span className="vw-breadcrumb-root">
                {selectedCategory === 'prendas' ? 'TUS PRENDAS' : 'TUS ATUENDOS'}
              </span>
              <span className="vw-breadcrumb-sep">/</span>
              <span className="vw-breadcrumb-active">
                {selectedSection === 'todas' ? 'TODAS' : selectedSection.toUpperCase()}
              </span>
            </nav>
            {renderContent()}
          </main>

        </div>

        {/* ── Modal para añadir prenda ── */}
        <Modal show={showForm} onHide={() => setShowForm(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Añadir prenda</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ClothingForm
              mode="create"
              onSubmit={async (values, file) => {
                try {
                  const newClothing = await clothingController.addClothing(file!, { ...values, userId });
                  const normalizeDoc = (doc: any): Clothing => ({
                    $id: doc.$id, name: doc.name, color: doc.color, type: doc.type,
                    material: doc.material, size: doc.size, occasion: doc.occasion,
                    image: doc.image, userId: doc.userId,
                  });
                  setClothes(prev => [...prev, normalizeDoc(newClothing)]);
                  setShowForm(false);
                } catch (error) {
                  console.error(error);
                  alert("No se pudo añadir la prenda.");
                }
              }}
            />
          </Modal.Body>
        </Modal>

        {/* ── Modal para publicar atuendo ── */}
        <Modal show={publishModalOpen} onHide={() => setPublishModalOpen(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Publicar atuendo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label htmlFor="publish-name" className="form-label">Nombre del atuendo</label>
              <input
                id="publish-name"
                type="text"
                value={publishName}
                onChange={(e) => setPublishName(e.target.value)}
                placeholder="Nombre del atuendo"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="publish-description" className="form-label">Descripción</label>
              <textarea
                id="publish-description"
                value={publishDescription}
                onChange={(e) => setPublishDescription(e.target.value)}
                placeholder="Descripción del outfit (opcional)"
                className="form-control"
                rows={4}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="vw-btn vw-btn--secondary" onClick={() => setPublishModalOpen(false)} disabled={publishLoading}>
              Cancelar
            </button>
            <button className="vw-btn vw-btn--primary" onClick={handleConfirmPublish} disabled={publishLoading}>
              {publishLoading ? "Publicando..." : "Publicar"}
            </button>
          </Modal.Footer>
        </Modal>

        {/* ── Modal para editar prenda ── */}
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
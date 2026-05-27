"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppNavbar from "../components/ui/Navbar";
import Footer from "@/app/components/ui/Footer";
import ProtectedRoute from "../components/ui/ProtectedRoute";
import { BsStars } from "react-icons/bs";
import { HiOutlineViewGrid } from "react-icons/hi";
import { IoShirtOutline } from "react-icons/io5";
import { clothingController } from "../controllers/ClothingController";
import { account } from "@/lib/appwrite";
import { Clothing } from "../models/Clothing";
import { outfitController } from "../controllers/OutfitController";

// ─── helper para la url de imágenes ─────────────────────────────────────────────────────────
// Construir la url de la imágen de appwrite para la ID del archivo almacenado.
const imgUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

// ─── Bloque de imagen de atuendo ───────────────────────────────────────────────────────
// Renderiza la imagen de un atuendo solo cuando existe una ID de archivo, utilizando un texto alternativo descriptivo.
const OutfitImage = ({ fileId, alt }: { fileId?: string; alt?: string }) =>
  fileId ? (
    <img src={imgUrl(fileId)} alt={`Imagen de prenda: ${alt || "prenda"}`} className="gen-outfit-img" />
  ) : null;

export default function Generator() {
  // Estado de componentes para las selecciones de filtros, visibilidad de dropdowns, carga y estado de modales.
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [selectedColor, setSelectedColor]     = useState<string>("");
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [outfits, setOutfits]       = useState<any[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [saveOutfitName, setSaveOutfitName] = useState<string>("");
  const [selectedOutfitToSave, setSelectedOutfitToSave] = useState<any>(null);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState<number | null>(null);
  const [userClothes, setUserClothes] = useState<Clothing[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  // Cerrar los dropdowns al hacer clic fuera de ellos.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".gen-dropdown")) {
        setShowContextDropdown(false);
        setShowColorDropdown(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Navegación por teclado para el botón del dropdown de contexto.
  const handleContextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowContextDropdown(!showContextDropdown);
      setShowColorDropdown(false);
    } else if (e.key === 'Escape') {
      setShowContextDropdown(false);
    } else if (e.key === 'ArrowDown' && showContextDropdown) {
      e.preventDefault();
      // Focus the first option when the dropdown is already open.
      const firstOption = document.querySelector('.gen-dropdown-menu .gen-dropdown-item');
      (firstOption as HTMLElement)?.focus();
    }
  };

  const handleColorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowColorDropdown(!showColorDropdown);
      setShowContextDropdown(false);
    } else if (e.key === 'Escape') {
      setShowColorDropdown(false);
    } else if (e.key === 'ArrowDown' && showColorDropdown) {
      e.preventDefault();
      const firstOption = document.querySelector('.gen-dropdown-menu .gen-dropdown-item');
      (firstOption as HTMLElement)?.focus();
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, opt: string, setter: (value: string) => void, closeDropdown: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setter(opt);
      closeDropdown();
    } else if (e.key === 'Escape') {
      closeDropdown();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = e.currentTarget.previousElementSibling as HTMLElement;
      prev?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = e.currentTarget.nextElementSibling as HTMLElement;
      next?.focus();
    }
  };

  // Permitir que los usuarios cierren los modales abiertos con la tecla Escape.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (showSaveModal) setShowSaveModal(false);
        if (showNotificationModal) setShowNotificationModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, showSaveModal, showNotificationModal]);

  // Focus trapping para el modal de selección de prenda
  useEffect(() => {
    if (showModal) {
      const modal = document.querySelector('.gen-modal') as HTMLElement;
      if (!modal) return;
      const focusableElements = modal.querySelectorAll('button, [tabindex="0"]');
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Focus the first element
      setTimeout(() => firstElement?.focus(), 100); // Delay to ensure modal is rendered

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showModal]);

  // Focus trapping para el modal de guardar outfit
  useEffect(() => {
    if (showSaveModal) {
      const modal = document.querySelector('.gen-modal') as HTMLElement;
      if (!modal) return;
      const focusableElements = modal.querySelectorAll('input, button');
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Focus the first element (input)
      setTimeout(() => firstElement?.focus(), 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showSaveModal]);

  // Auto-cerrar el modal de notificación después de 3 segundos
  useEffect(() => {
    if (showNotificationModal) {
      const timer = setTimeout(() => {
        setShowNotificationModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotificationModal]);

  // Cargar las prendas del usuario
  useEffect(() => {
    account.get().then(async () => {
      const clothes = await clothingController.getUserClothes();
      setUserClothes(clothes);
    });
  }, []);

  // Generar atuendos basados en los filtros seleccionados y mostrarlos.
  const handleGenerate = async () => {
    setLoading(true);
    const results = await clothingController.generateOutfits(
      selectedColor.toLowerCase(),
      selectedContext.toLowerCase()
    );
    setOutfits(results);
    setLoading(false);
  };

  const openSaveModal = (outfit: any, index: number) => {
    setSelectedOutfitToSave(outfit);
    setSelectedOutfitIndex(index);
    setSaveOutfitName(outfit?.name || `Outfit ${index + 1}`);
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedOutfitToSave || selectedOutfitIndex === null) return;
    setSavingOutfit(true);
    try {
      await outfitController.saveOutfit(selectedOutfitToSave, saveOutfitName.trim() || `Outfit ${selectedOutfitIndex + 1}`);
      setShowSaveModal(false);
      setSelectedOutfitToSave(null);
      setSelectedOutfitIndex(null);
      setSaveOutfitName("");
      setNotificationMessage("Outfit guardado correctamente");
      setNotificationType("success");
      setShowNotificationModal(true);
    } catch (err) {
      console.error(err);
      setNotificationMessage("Error al guardar el outfit");
      setNotificationType("error");
      setShowNotificationModal(true);
    } finally {
      setSavingOutfit(false);
    }
  };

  return (
    <ProtectedRoute>

      {/* ── Modal de selección de prenda ── */}
      {/* Aquí se muestran las prendas que el usuario tiene en su guardarropa, el texto alternativo se genera dinámicamente */}
      {showModal && (
        <div className="gen-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="gen-modal">
            <h2 className="gen-modal-title">Selecciona una prenda</h2>
            <p className="gen-modal-sub">El outfit se generará a partir de ella</p>

            <div className="gen-modal-grid">
              {userClothes.map((cloth) => (
                <div
                  key={cloth.$id}
                  className="gen-modal-item"
                  tabIndex={0}
                  onClick={async () => {
                    const result = await clothingController.generateOutfitWithBase(cloth.$id!);
                    setOutfits([result]);
                    setShowModal(false);
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Simulate click
                      const result = await clothingController.generateOutfitWithBase(cloth.$id!);
                      setOutfits([result]);
                      setShowModal(false);
                    }
                  }}
                >
                  <img
                    src={imgUrl(cloth.image ?? '')}
                    alt={`Prenda: ${cloth.name}, tipo: ${cloth.type}, color: ${cloth.color}`}
                    className="gen-modal-item-img"
                  />
                </div>
              ))}
            </div>

            <button className="gen-modal-close" onClick={() => setShowModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="gen-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSaveModal(false); }}>
          <div className="gen-modal">
            <h2 className="gen-modal-title">Guardar outfit</h2>
            <p className="gen-modal-sub">Elige un nombre antes de guardar tu atuendo.</p>

            <div className="mb-3">
              <label className="form-label">Nombre del outfit</label>
              <input
                type="text"
                className="form-control"
                value={saveOutfitName}
                onChange={(e) => setSaveOutfitName(e.target.value)}
                placeholder="Nombre del outfit"
              />
            </div>

            <div className="gen-modal-actions">
              <button className="gen-modal-close" onClick={() => setShowSaveModal(false)} disabled={savingOutfit}>
                Cancelar
              </button>
              <button className="gen-modal-save" onClick={handleConfirmSave} disabled={savingOutfit || !saveOutfitName.trim()}>
                {savingOutfit ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotificationModal && (
        <div className="gen-modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className={`gen-notification-modal gen-notification-modal--${notificationType}`}>
            <div className="gen-notification-content">
              {notificationType === "success" ? (
                <div className="gen-notification-icon gen-notification-icon--success">✓</div>
              ) : (
                <div className="gen-notification-icon gen-notification-icon--error">✕</div>
              )}
              <p className="gen-notification-message">{notificationMessage}</p>
            </div>
            <button className="gen-notification-close" onClick={() => setShowNotificationModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="gen-root">
        <AppNavbar />

        <main className="gen-main">
          <h1 className="gen-heading">¿Qué tipo de outfit quieres hoy?</h1>

          <section className="gen-band">
            <div className="gen-band-inner">

              {/* ── Columna izquierda: filtros ── */}
              <aside className="gen-sidebar">
                <h2 className="gen-sidebar-label">Filtros</h2>

                {/* Dropdown de contexto */}
                <div className="gen-dropdown">
                  <button
                    className="gen-select-btn"
                    onClick={() => { setShowContextDropdown(!showContextDropdown); setShowColorDropdown(false); }}
                    onKeyDown={handleContextKeyDown}
                    aria-expanded={showContextDropdown}
                    aria-haspopup="listbox"
                    aria-label="Seleccionar contexto"
                  >
                    <span>{selectedContext || "Contexto"}</span>
                    <span className="gen-chevron" aria-hidden="true">▾</span>
                  </button>
                  {/* Aquí se mapean las opciones del dropdown y el uso de teclado para navegación */}
                  {showContextDropdown && (
                    <div className="gen-dropdown-menu" role="listbox">
                      {["Any", "Formal", "Casual", "Sport"].map((opt) => (
                        <div
                          key={opt}
                          className={`gen-dropdown-item ${selectedContext === opt ? "gen-dropdown-item--active" : ""}`}
                          onClick={() => { setSelectedContext(opt); setShowContextDropdown(false); }}
                          onKeyDown={(e) => handleOptionKeyDown(e, opt, setSelectedContext, () => setShowContextDropdown(false))}
                          tabIndex={0}
                          role="option"
                          aria-selected={selectedContext === opt}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown de color */}
                <div className="gen-dropdown">
                  <button
                    className="gen-select-btn"
                    onClick={() => { setShowColorDropdown(!showColorDropdown); setShowContextDropdown(false); }}
                    onKeyDown={handleColorKeyDown}
                    aria-expanded={showColorDropdown}
                    aria-haspopup="listbox"
                    aria-label="Seleccionar color"
                  >
                    <span>{selectedColor || "Color"}</span>
                    <span className="gen-chevron" aria-hidden="true">▾</span>
                  </button>
                  {showColorDropdown && (
                    <div className="gen-dropdown-menu" role="listbox">
                      {["Any", "Red", "Blue", "Yellow", "Green", "Black", "White"].map((opt) => (
                        <div
                          key={opt}
                          className={`gen-dropdown-item ${selectedColor === opt ? "gen-dropdown-item--active" : ""}`}
                          onClick={() => { setSelectedColor(opt); setShowColorDropdown(false); }}
                          onKeyDown={(e) => handleOptionKeyDown(e, opt, setSelectedColor, () => setShowColorDropdown(false))}
                          tabIndex={0}
                          role="option"
                          aria-selected={selectedColor === opt}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="gen-sidebar-divider" />

                {/* Botón de generación */}
                <button className="gen-cta-btn" onClick={handleGenerate} disabled={loading}>
                  <BsStars size={16} className="gen-cta-icon" aria-hidden="true" />
                  {loading ? "Generando…" : "Generar"}
                </button>
              </aside>

              {/* ── Centro: Resultados ── */}
              <div className="gen-results">
                {loading ? (
                  <div className="gen-placeholder">
                    <div className="gen-spinner" />
                    <p>Generando atuendos…</p>
                  </div>
                ) : outfits.length === 0 ? (
                  <div className="gen-placeholder">
                    <IoShirtOutline className="gen-placeholder-icon" aria-hidden="true" />
                    <p className="gen-placeholder-text">
                      Aquí se mostrarán las prendas seleccionadas o generadas.
                    </p>
                  </div>
                ) : (
                  <div className="gen-outfits-grid">
                    {outfits.map((outfit, index) => (
                      <div key={index} className="gen-outfit-card">
                        {outfit.completo && outfit.calzado ? (
                          <>
                            <p className="gen-outfit-badge">Outfit completo</p>
                            <OutfitImage fileId={outfit.completo?.image} alt={outfit.completo?.type} />
                            <OutfitImage fileId={outfit.calzado?.image}  alt={outfit.calzado?.type} />
                          </>
                        ) : outfit.superior && outfit.inferior && outfit.calzado ? (
                          <>
                            <p className="gen-outfit-badge">Outfit sugerido</p>
                            <OutfitImage fileId={outfit.superior?.image} alt={outfit.superior?.type} />
                            <OutfitImage fileId={outfit.inferior?.image} alt={outfit.inferior?.type} />
                            <OutfitImage fileId={outfit.calzado?.image}  alt={outfit.calzado?.type} />
                            <button
                              className="gen-save-btn"
                              onClick={() => openSaveModal(outfit, index)}
                            >
                              Guardar outfit
                            </button>
                          </>
                        ) : (
                          <p className="gen-outfit-incomplete">Outfit incompleto</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Columna derecha: acciones ── */}
              <aside className="gen-sidebar gen-sidebar--right">
                <p className="gen-sidebar-label">Acciones</p>

                <Link href="/virtual_wardrobe" className="gen-action-btn">
                  <HiOutlineViewGrid size={16} className="gen-action-icon" aria-hidden="true" />
                  Guardarropa
                </Link>

                <button className="gen-action-btn" onClick={() => setShowModal(true)}>
                  <IoShirtOutline size={16} className="gen-action-icon" aria-hidden="true" />
                  Seleccionar prenda
                </button>
              </aside>

            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
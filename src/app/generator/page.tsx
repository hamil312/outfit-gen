"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppNavbar from "../components/ui/Navbar";
import Footer from "@/app/components/ui/Footer";
import ProtectedRoute from "../components/ui/ProtectedRoute";
import { BsStars } from "react-icons/bs";
import { HiOutlineViewGrid, HiChevronRight } from "react-icons/hi";
import { IoShirtOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { clothingController } from "../controllers/ClothingController";
import { account } from "@/lib/appwrite";
import { Clothing } from "../models/Clothing";
import { outfitController } from "../controllers/OutfitController";
import { profileController } from "../controllers/ProfileController";
import { extractOutfitFeatures, syntheticOutfitId } from "@/lib/OutfitFeatures";

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
  const [selectedStyle, setSelectedStyle]     = useState<string>("");
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [useMaterialMatching, setUseMaterialMatching] = useState(false);
  const [useMaterialBalance, setUseMaterialBalance] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [usePrintMatching, setUsePrintMatching] = useState(false);
  const [selectedPrint, setSelectedPrint] = useState<string>("");
  const [showPrintDropdown, setShowPrintDropdown] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [outfits, setOutfits]       = useState<any[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [saveOutfitName, setSaveOutfitName] = useState<string>("");
  const [selectedOutfitToSave, setSelectedOutfitToSave] = useState<any>(null);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState<number | null>(null);
  const [userClothes, setUserClothes] = useState<Clothing[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [useWeather, setUseWeather] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [useFullML, setUseFullML] = useState(false);

  // ── Modal-specific toggles (independent from sidebar) ──
  const [modalUseMaterial, setModalUseMaterial] = useState(false);
  const [modalUseBalance, setModalUseBalance] = useState(false);
  const [modalUsePrint, setModalUsePrint] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  // Cerrar los dropdowns al hacer clic fuera de ellos.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest(".gen-dropdown")) {
          setShowContextDropdown(false);
          setShowStyleDropdown(false);
          setShowMaterialDropdown(false);
          setShowPrintDropdown(false);
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
    } else if (e.key === 'Escape') {
      setShowContextDropdown(false);
    } else if (e.key === 'ArrowDown' && showContextDropdown) {
      e.preventDefault();
      // Focus the first option when the dropdown is already open.
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

  // Cargar las prendas del usuario y capturar el userId para interacciones
  useEffect(() => {
    account.get().then(async (user) => {
      setUserId(user.$id);
      const clothes = await clothingController.getUserClothes();
      setUserClothes(clothes);
    });
  }, []);

  const PRINT_OPTIONS = ["Any", "Solid", "Striped", "Floral", "Plaid", "Polka dot", "Graphic", "Animal print", "Geometric", "Tie-dye", "Checkered", "Camouflage", "Paisley"];
  const STYLE_OPTIONS = ["Any", "Vintage", "Bohemian", "Minimalist", "Streetwear", "Preppy", "Classic", "Edgy", "Romantic", "Retro", "Avant-garde", "Punk", "Nautical"];
  const MATERIAL_OPTIONS = ["Any", "Cotton", "Denim", "Leather", "Wool", "Polyester", "Silk", "Linen", "Nylon", "Velvet", "Lace", "Chiffon", "Knit", "Fleece", "Suede", "Canvas"];

  const getWeather = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000'}/api/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });
      if (res.ok) {
        const ctx = await res.json();
        setWeatherInfo(ctx);
        setWeatherLocation({ lat, lon });
      }
    } catch { /* fallback */ }
    setWeatherLoading(false);
  };

  const doGenerate = async (lat?: number, lon?: number) => {
    if (outfits.length > 0 && userId) {
      outfits.forEach(outfit => {
        profileController.recordInteraction(
          userId, syntheticOutfitId(), 'regenerated', extractOutfitFeatures(outfit)
        ).catch(console.error);
      });
    }
    setLoading(true);
    const { outfits: generated, fallback } = await clothingController.generateOutfits(
      selectedColor.toLowerCase(),
      selectedContext.toLowerCase(),
      selectedStyle.toLowerCase(),
      useMaterialMatching,
      useMaterialBalance,
      selectedMaterial,
      usePrintMatching,
      selectedPrint,
      useWeather,
      lat && lon ? { lat, lon } : null,
      useFullML,
    );
    setOutfits(Array.isArray(generated) ? generated : []);
    setIsFallback(fallback === true);
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (useWeather && !weatherLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          getWeather(lat, lon).then(() => {
            setWeatherLocation({ lat, lon });
            doGenerate(lat, lon);
          });
        },
        () => { doGenerate(); },
        { timeout: 5000 }
      );
      return;
    }
    doGenerate(weatherLocation?.lat, weatherLocation?.lon);
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
      const savedDoc = await outfitController.saveOutfit(selectedOutfitToSave, saveOutfitName.trim() || `Outfit ${selectedOutfitIndex + 1}`);
      if (userId && savedDoc?.$id) {
        profileController.recordInteraction(
          userId, savedDoc.$id, 'saved', extractOutfitFeatures(selectedOutfitToSave)
        ).catch(console.error);
      }
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

            <div className="gen-modal-options">
              <label className="gen-toggle-row gen-toggle-row--sm">
                <input type="checkbox" checked={modalUseMaterial} onChange={(e) => setModalUseMaterial(e.target.checked)} />
                <span className="gen-toggle-track"><span className="gen-toggle-knob" /></span>
                <span className="gen-toggle-text">Material</span>
              </label>
              {modalUseMaterial && (
                <label className="gen-toggle-row gen-toggle-row--sm" style={{ marginLeft: 24 }}>
                  <input type="checkbox" checked={modalUseBalance} onChange={(e) => setModalUseBalance(e.target.checked)} />
                  <span className="gen-toggle-track"><span className="gen-toggle-knob" /></span>
                  <span className="gen-toggle-text">Equilibrio</span>
                </label>
              )}
              <label className="gen-toggle-row gen-toggle-row--sm">
                <input type="checkbox" checked={modalUsePrint} onChange={(e) => setModalUsePrint(e.target.checked)} />
                <span className="gen-toggle-track"><span className="gen-toggle-knob" /></span>
                <span className="gen-toggle-text">Estampado</span>
              </label>
            </div>

            <div className="gen-modal-grid">
              {userClothes.map((cloth) => (
                <div
                  key={cloth.$id}
                  className="gen-modal-item"
                  tabIndex={0}
                  onClick={async () => {
                    const result = await clothingController.generateOutfitWithBase(
                      cloth.$id!, [], modalUseMaterial, modalUseBalance, modalUsePrint
                    );
                    setOutfits([result]);
                    setShowModal(false);
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const result = await clothingController.generateOutfitWithBase(
                        cloth.$id!, [], modalUseMaterial, modalUseBalance, modalUsePrint
                      );
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
          <div className="gen-band">
            <div className="gen-band-inner">

              {/* ── Columna izquierda: filtros ── */}
              <aside className="gen-sidebar">
                <p className="gen-sidebar-label">Filtros</p>

                <p className="gen-field-label">Contexto</p>
                <div className="gen-dropdown">
                  <button
                    className="gen-select-btn"
                    onClick={() => setShowContextDropdown(!showContextDropdown)}
                    onKeyDown={handleContextKeyDown}
                    aria-expanded={showContextDropdown}
                    aria-haspopup="listbox"
                    aria-label="Seleccionar contexto"
                  >
                    <span>{selectedContext || "Evento Formal"}</span>
                    <span className="gen-chevron" aria-hidden="true">▾</span>
                  </button>
                  {showContextDropdown && (
                    <div className="gen-dropdown-menu" role="listbox">
                      {["Any", "Formal", "Casual", "Sport", "Informal"].map((opt) => (
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

                <p className="gen-color-label">Color predominante</p>
                <div className="gen-color-options">
                  {[
                    { label: 'Any',    hex: '#00000000', cls: 'gen-color-circle--any',  txt: 'A' },
                    { label: 'black',  hex: '#1a1a1a' },
                    { label: 'white',  hex: '#ffffff' },
                    { label: 'gray',   hex: '#9ca3af' },
                    { label: 'beige',  hex: '#d4c5a9' },
                    { label: 'red',    hex: '#dc2626' },
                    { label: 'orange', hex: '#f97316' },
                    { label: 'yellow', hex: '#eab308' },
                    { label: 'pink',   hex: '#ec4899' },
                    { label: 'green',  hex: '#16a34a' },
                    { label: 'blue',   hex: '#2563eb' },
                    { label: 'navy',   hex: '#1e3a5f' },
                    { label: 'purple', hex: '#9333ea' },
                    { label: 'brown',  hex: '#92400e' },
                  ].map(({ label, hex, cls, txt }) => (
                    <button
                      key={label}
                      className={`gen-color-circle ${selectedColor === label ? 'gen-color-circle--selected' : ''} ${cls || ''}`}
                      onClick={() => setSelectedColor(selectedColor === label ? '' : label)}
                      aria-label={label}
                      title={label}
                      style={hex !== '#00000000' ? { backgroundColor: hex, borderColor: hex === '#ffffff' ? '#d1d5db' : undefined } : {}}
                    >
                      {txt || ''}
                    </button>
                  ))}
                </div>

                <p className="gen-field-label">Estilo</p>
                <div className="gen-dropdown">
                  <button
                    className="gen-select-btn"
                    onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                    aria-expanded={showStyleDropdown}
                    aria-haspopup="listbox"
                    aria-label="Seleccionar estilo"
                  >
                    <span>{selectedStyle || "Cualquier estilo"}</span>
                    <span className="gen-chevron" aria-hidden="true">▾</span>
                  </button>
                  {showStyleDropdown && (
                    <div className="gen-dropdown-menu gen-dropdown-menu--tall" role="listbox">
                      {STYLE_OPTIONS.map((opt) => (
                        <div
                          key={opt}
                          className={`gen-dropdown-item ${selectedStyle === opt ? "gen-dropdown-item--active" : ""}`}
                          onClick={() => { setSelectedStyle(opt); setShowStyleDropdown(false); }}
                          onKeyDown={(e) => handleOptionKeyDown(e, opt, setSelectedStyle, () => setShowStyleDropdown(false))}
                          tabIndex={0}
                          role="option"
                          aria-selected={selectedStyle === opt}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="gen-sidebar-divider" />

                <p className="gen-field-label">Material</p>

                <label className="gen-toggle-row">
                  <input
                    type="checkbox"
                    checked={useMaterialMatching}
                    onChange={(e) => setUseMaterialMatching(e.target.checked)}
                  />
                  <span className="gen-toggle-track">
                    <span className="gen-toggle-knob" />
                  </span>
                  <span className="gen-toggle-text">Usar material</span>
                </label>

                {useMaterialMatching && (
                  <>
                    <div className="gen-dropdown" style={{ marginTop: 8 }}>
                      <button
                        className="gen-select-btn"
                        onClick={() => setShowMaterialDropdown(!showMaterialDropdown)}
                        aria-expanded={showMaterialDropdown}
                        aria-haspopup="listbox"
                        aria-label="Seleccionar material"
                      >
                        <span>{selectedMaterial || "Cualquier material"}</span>
                        <span className="gen-chevron" aria-hidden="true">▾</span>
                      </button>
                      {showMaterialDropdown && (
                        <div className="gen-dropdown-menu gen-dropdown-menu--tall" role="listbox">
                          {MATERIAL_OPTIONS.map((opt) => (
                            <div
                              key={opt}
                              className={`gen-dropdown-item ${selectedMaterial === opt ? "gen-dropdown-item--active" : ""}`}
                              onClick={() => { setSelectedMaterial(opt); setShowMaterialDropdown(false); }}
                              onKeyDown={(e) => handleOptionKeyDown(e, opt, setSelectedMaterial, () => setShowMaterialDropdown(false))}
                              tabIndex={0}
                              role="option"
                              aria-selected={selectedMaterial === opt}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="gen-toggle-row">
                      <input
                        type="checkbox"
                        checked={useMaterialBalance}
                        onChange={(e) => setUseMaterialBalance(e.target.checked)}
                      />
                      <span className="gen-toggle-track">
                        <span className="gen-toggle-knob" />
                      </span>
                      <span className="gen-toggle-text">Equilibrio (superior pesado / inferior ligero)</span>
                    </label>
                  </>
                )}

                <div className="gen-sidebar-divider" />

                <p className="gen-field-label">Estampado</p>

                <label className="gen-toggle-row">
                  <input
                    type="checkbox"
                    checked={usePrintMatching}
                    onChange={(e) => setUsePrintMatching(e.target.checked)}
                  />
                  <span className="gen-toggle-track">
                    <span className="gen-toggle-knob" />
                  </span>
                  <span className="gen-toggle-text">Usar estampado</span>
                </label>

                {usePrintMatching && (
                  <div className="gen-dropdown" style={{ marginTop: 8 }}>
                    <button
                      className="gen-select-btn"
                      onClick={() => setShowPrintDropdown(!showPrintDropdown)}
                      aria-expanded={showPrintDropdown}
                      aria-haspopup="listbox"
                      aria-label="Seleccionar estampado"
                    >
                      <span>{selectedPrint || "Cualquier estampado"}</span>
                      <span className="gen-chevron" aria-hidden="true">▾</span>
                    </button>
                    {showPrintDropdown && (
                      <div className="gen-dropdown-menu" role="listbox">
                        {PRINT_OPTIONS.map((opt) => (
                          <div
                            key={opt}
                            className={`gen-dropdown-item ${selectedPrint === opt ? "gen-dropdown-item--active" : ""}`}
                            onClick={() => { setSelectedPrint(opt); setShowPrintDropdown(false); }}
                            onKeyDown={(e) => handleOptionKeyDown(e, opt, setSelectedPrint, () => setShowPrintDropdown(false))}
                            tabIndex={0}
                            role="option"
                            aria-selected={selectedPrint === opt}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="gen-sidebar-divider" />

                <p className="gen-field-label">Clima</p>

                <label className="gen-toggle-row">
                  <input
                    type="checkbox"
                    checked={useWeather}
                    onChange={(e) => setUseWeather(e.target.checked)}
                  />
                  <span className="gen-toggle-track">
                    <span className="gen-toggle-knob" />
                  </span>
                  <span className="gen-toggle-text">Usar clima actual</span>
                </label>

                {weatherLoading && (
                  <p style={{ fontSize: 12, marginTop: 4, color: '#6b7280' }}>
                    Obteniendo ubicación…
                  </p>
                )}

                {weatherInfo && useWeather && (
                  <div style={{ marginTop: 8, padding: '8px 10px', background: '#f3f4f6', borderRadius: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{weatherInfo.temp}°C · {weatherInfo.condition}</span>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#6b7280' }}>{weatherInfo.season}</span>
                    </div>
                    {weatherInfo.exclude_types?.length > 0 && (
                      <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 11 }}>
                        ✕ {weatherInfo.exclude_types.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                <div className="gen-sidebar-divider" />

                <p className="gen-field-label">Modo de generación</p>

                <label className="gen-toggle-row">
                  <input
                    type="checkbox"
                    checked={useFullML}
                    onChange={(e) => setUseFullML(e.target.checked)}
                  />
                  <span className="gen-toggle-track">
                    <span className="gen-toggle-knob" />
                  </span>
                  <span className="gen-toggle-text">Full ML <span style={{fontSize:11,color:'#9ca3af'}}>(mejor puntuado)</span></span>
                </label>

                <div className="gen-sidebar-divider" />

                <button className="gen-cta-btn" onClick={handleGenerate} disabled={loading}>
                  <BsStars size={15} aria-hidden="true" />
                  {loading ? "Generando…" : "Generar"}
                </button>
              </aside>

              {/* ── Centro: Resultados ── */}
              <div className="gen-results">
                {loading ? (
                  <div className="gen-placeholder">
                    <div className="gen-spinner" />
                    <p className="gen-placeholder-text">Generando atuendos…</p>
                  </div>
                ) : outfits.length === 0 ? (
                  <div className="gen-placeholder">
                    <IoShirtOutline className="gen-placeholder-icon" aria-hidden="true" />
                    <p className="gen-placeholder-text">
                      Esperando tu visión
                    </p>
                  </div>
                ) : (
                  <div className="gen-outfits-grid">
                    {outfits.filter(Boolean).map((outfit, index) => (
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
                    {isFallback && (
                      <p className="gen-fallback-msg">
                        No se encontraron combinaciones exactas. Este outfit se armó con las prendas disponibles.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Columna derecha: acciones ── */}
              <aside className="gen-sidebar--right">
                <p className="gen-sidebar-label">Acciones</p>

                <Link href="/virtual_wardrobe" className="gen-action-btn">
                  <HiOutlineViewGrid size={16} aria-hidden="true" />
                  <span style={{ flex: 1, textAlign: 'left' }}>Guardarropa</span>
                  <HiChevronRight className="gen-action-right" aria-hidden="true" />
                </Link>

                <button className="gen-action-btn" onClick={() => setShowModal(true)}>
                  <IoShirtOutline size={16} aria-hidden="true" />
                  <span style={{ flex: 1, textAlign: 'left' }}>Seleccionar prenda</span>
                  <IoMdAdd size={16} className="gen-action-right" aria-hidden="true" />
                </button>

                <p className="gen-suggestions-label">Sugerencias del feed</p>
                <div className="gen-suggestions">
                  {userClothes.length > 0 ? (
                    userClothes.slice(0, 2).map((cloth) => (
                      <div key={cloth.$id} className="gen-suggestion-thumb" onClick={() => setShowModal(true)}>
                        <img
                          src={imgUrl(cloth.image ?? '')}
                          alt={cloth.name}
                          className="gen-suggestion-img"
                        />
                        <div className="gen-suggestion-info">
                          <p className="gen-suggestion-name">{cloth.name}</p>
                          <p className="gen-suggestion-meta">{cloth.color} · {cloth.type}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="gen-placeholder-text" style={{ fontSize: 13, textAlign: 'left' }}>
                      Aún no hay sugerencias.
                    </p>
                  )}
                </div>
              </aside>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
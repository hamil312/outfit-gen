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

// ─── Image URL helper ─────────────────────────────────────────────────────────
const imgUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

// ─── Outfit image block ───────────────────────────────────────────────────────
const OutfitImage = ({ fileId, alt }: { fileId?: string; alt?: string }) =>
  fileId ? (
    <img src={imgUrl(fileId)} alt={alt || "prenda"} className="gen-outfit-img" />
  ) : null;

export default function Generator() {
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [selectedColor, setSelectedColor]     = useState<string>("");
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [outfits, setOutfits]       = useState<any[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [userClothes, setUserClothes] = useState<Clothing[]>([]);

  // Close dropdowns on outside click
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

  // Load user clothes
  useEffect(() => {
    account.get().then(async () => {
      const clothes = await clothingController.getUserClothes();
      setUserClothes(clothes);
    });
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    const results = await clothingController.generateOutfits(
      selectedColor.toLowerCase(),
      selectedContext.toLowerCase()
    );
    setOutfits(results);
    setLoading(false);
  };

  const handleSave = async (outfit: any, index: number) => {
    try {
      await outfitController.saveOutfit(outfit, `Outfit ${index + 1}`);
      alert("Outfit guardado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el outfit");
    }
  };

  return (
    <ProtectedRoute>

      {/* ── Clothing picker modal ── */}
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
                  onClick={async () => {
                    const result = await clothingController.generateOutfitWithBase(cloth.$id!);
                    setOutfits([result]);
                    setShowModal(false);
                  }}
                >
                  <img
                    src={imgUrl(cloth.image ?? '')}
                    alt="prenda"
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

      <div className="gen-root">
        <AppNavbar />

        <main className="gen-main">
          <h2 className="gen-heading">¿Qué tipo de outfit quieres hoy?</h2>

          <section className="gen-band">
            <div className="gen-band-inner">

              {/* ── Left column: filters ── */}
              <aside className="gen-sidebar">
                <p className="gen-sidebar-label">Filtros</p>

                {/* Context dropdown */}
                <div className="gen-dropdown">
                  <button
                    className="gen-select-btn"
                    onClick={() => { setShowContextDropdown(!showContextDropdown); setShowColorDropdown(false); }}
                  >
                    <span>{selectedContext || "Contexto"}</span>
                    <span className="gen-chevron">▾</span>
                  </button>
                  {showContextDropdown && (
                    <div className="gen-dropdown-menu">
                      {["Any", "Formal", "Casual", "Sport"].map((opt) => (
                        <div
                          key={opt}
                          className={`gen-dropdown-item ${selectedContext === opt ? "gen-dropdown-item--active" : ""}`}
                          onClick={() => { setSelectedContext(opt); setShowContextDropdown(false); }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color dropdown */}
                <div className="gen-dropdown">
                  <button
                    className="gen-select-btn"
                    onClick={() => { setShowColorDropdown(!showColorDropdown); setShowContextDropdown(false); }}
                  >
                    <span>{selectedColor || "Color"}</span>
                    <span className="gen-chevron">▾</span>
                  </button>
                  {showColorDropdown && (
                    <div className="gen-dropdown-menu">
                      {["Any", "Red", "Blue", "Yellow", "Green", "Black", "White"].map((opt) => (
                        <div
                          key={opt}
                          className={`gen-dropdown-item ${selectedColor === opt ? "gen-dropdown-item--active" : ""}`}
                          onClick={() => { setSelectedColor(opt); setShowColorDropdown(false); }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="gen-sidebar-divider" />

                {/* Generate button */}
                <button className="gen-cta-btn" onClick={handleGenerate} disabled={loading}>
                  <BsStars size={16} className="gen-cta-icon" />
                  {loading ? "Generando…" : "Generar"}
                </button>
              </aside>

              {/* ── Center: outfit results ── */}
              <div className="gen-results">
                {loading ? (
                  <div className="gen-placeholder">
                    <div className="gen-spinner" />
                    <p>Generando atuendos…</p>
                  </div>
                ) : outfits.length === 0 ? (
                  <div className="gen-placeholder">
                    <IoShirtOutline className="gen-placeholder-icon" />
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
                              onClick={() => handleSave(outfit, index)}
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

              {/* ── Right column: actions ── */}
              <aside className="gen-sidebar gen-sidebar--right">
                <p className="gen-sidebar-label">Acciones</p>

                <Link href="/virtual_wardrobe" className="gen-action-btn">
                  <HiOutlineViewGrid size={16} className="gen-action-icon" />
                  Guardarropa
                </Link>

                <button className="gen-action-btn" onClick={() => setShowModal(true)}>
                  <IoShirtOutline size={16} className="gen-action-icon" />
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
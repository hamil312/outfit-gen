"use client";

import React, { useState } from "react";
import { Clothing } from "@/app/models/Clothing";
import { FLASK_API_URL } from "@/lib/config";
import { IoShirtOutline } from "react-icons/io5";
import { BsStars } from "react-icons/bs";

const TYPE_OPTIONS = [
  { label: "Camisa", value: "shirt" },
  { label: "Camiseta", value: "t-shirt" },
  { label: "Chamarra", value: "jacket" },
  { label: "Vestido", value: "dress" },
  { label: "Pantalón", value: "pants" },
  { label: "Short", value: "shorts" },
  { label: "Falda", value: "skirt" },
  { label: "Zapatos", value: "shoes" },
];

const COLOR_OPTIONS = [
  "black", "white", "gray", "beige", "red", "blue", "green", "yellow", "neutral"
];

const MATERIAL_OPTIONS = [
  "cotton", "denim", "leather", "wool", "polyester", "silk", "linen",
  "nylon", "velvet", "lace", "chiffon", "knit", "fleece", "suede", "canvas"
];

const PRINT_OPTIONS = [
  "solid", "striped", "floral", "plaid", "polka dot", "graphic",
  "animal print", "geometric", "tie-dye", "checkered", "camouflage", "paisley"
];

const STYLE_OPTIONS = [
  "vintage", "bohemian", "minimalist", "streetwear", "preppy", "classic",
  "edgy", "romantic", "retro", "avant-garde", "punk", "nautical"
];

const OCCASION_OPTIONS = ["formal", "casual", "sport", "informal"];

interface ClothingFormProps {
  initialValues?: Partial<Clothing>;
  mode?: "create" | "edit";
  onSubmit: (values: any, file?: File | null) => Promise<any>;
}

export default function ClothingForm({
  initialValues = {},
  mode = "create",
  onSubmit,
}: ClothingFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: initialValues.name || "",
    color: initialValues.color || "",
    type: initialValues.type || "shirt",
    material: initialValues.material || "",
    print: initialValues.print || "",
    style: initialValues.style || "",
    size: initialValues.size || "",
    occasion: initialValues.occasion || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${FLASK_API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al analizar la imagen");

      const analysis = await response.json();

      setForm((current) => ({
        ...current,
        type: analysis.type || current.type,
        color: analysis.color_name || current.color,
        material: analysis.material || current.material,
        print: analysis.print || current.print,
        style: analysis.style || current.style,
        occasion: analysis.occasion || current.occasion,
      }));
    } catch (error) {
      console.error("Error al analizar la imagen:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (selectedFile: File | null) => {
    setFile(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
      await analyzeImage(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !file) {
      return alert("Por favor selecciona una imagen");
    }

    setLoading(true);

    try {
      await onSubmit(form, file);

      if (mode === "create") {
        setForm({
          name: "",
          color: "",
          type: "shirt",
          material: "",
          print: "",
          style: "",
          size: "",
          occasion: "",
        });
        setFile(null);
        setPreview(null);
      }
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar la prenda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cf-form">
      <h2 className="cf-title">
        {mode === "create" ? "Añadir prenda" : "Editar prenda"}
      </h2>

      {/* Upload */}
      {mode === "create" && (
        <div className="cf-upload-area">
          <label
            className="cf-upload-label"
            htmlFor="cf-file-input"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('cf-file-input')?.click();
              }
            }}
          >
            {preview ? (
              <img src={preview} alt="Vista previa" className="cf-upload-preview" />
            ) : (
              <div className="cf-upload-placeholder">
                <IoShirtOutline className="cf-upload-icon" />
                <span className="cf-upload-text">Subir imagen</span>
                <span className="cf-upload-hint">JPG, PNG, WEBP</span>
              </div>
            )}
          </label>

          <input
            id="cf-file-input"
            type="file"
            accept="image/*"
            className="cf-file-input"
            onChange={(e) =>
              handleFileChange(e.target.files?.[0] ?? null)
            }
          />

          {isAnalyzing && (
            <div className="cf-analyzing">
              <BsStars size={14} />
              <span>Analizando imagen...</span>
            </div>
          )}
        </div>
      )}

      {/* Fields */}
      <div className="cf-fields">
        <div className="cf-field">
          <label htmlFor="cf-name" className="cf-label">Nombre</label>
          <input
            id="cf-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="cf-input"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-type" className="cf-label">Tipo</label>
          <select
            id="cf-type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="cf-input"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-color" className="cf-label">Color</label>
          <select
            id="cf-color"
            name="color"
            value={form.color}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-material" className="cf-label">Material</label>
          <select
            id="cf-material"
            name="material"
            value={form.material}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {MATERIAL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-print" className="cf-label">Estampado</label>
          <select
            id="cf-print"
            name="print"
            value={form.print}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {PRINT_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-style" className="cf-label">Estilo</label>
          <select
            id="cf-style"
            name="style"
            value={form.style}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {STYLE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-size" className="cf-label">Talla</label>
          <input
            id="cf-size"
            type="text"
            name="size"
            value={form.size}
            onChange={handleChange}
            className="cf-input"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-occasion" className="cf-label">Ocasión</label>
          <select
            id="cf-occasion"
            name="occasion"
            value={form.occasion}
            onChange={handleChange}
            className="cf-input"
          >
            <option value="">Seleccionar</option>
            {OCCASION_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || isAnalyzing}
        className="cf-submit-btn"
      >
        {loading      ? "Guardando…"   :
         isAnalyzing  ? "Analizando…"  :
         mode === "create" ? "Añadir prenda" : "Guardar cambios"}
      </button>
    </form>
  );
}

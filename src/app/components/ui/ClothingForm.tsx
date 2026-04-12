"use client";

import React, { useState } from "react";
import { Clothing } from "@/app/models/Clothing";
import { IoShirtOutline } from "react-icons/io5";
import { BsStars } from "react-icons/bs";

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
    type: initialValues.type || "Top",
    material: initialValues.material || "",
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

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al analizar la imagen");

      const analysis = await response.json();

      setForm((current) => ({
        ...current,
        type: analysis.type || current.type,
        color: analysis.color_name || current.color,
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
          type: "Top",
          material: "",
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
            <option value="Top">Superior</option>
            <option value="Pants">Inferior</option>
            <option value="Shoes">Calzado</option>
          </select>
        </div>

        <div className="cf-field">
          <label htmlFor="cf-color" className="cf-label">Color</label>
          <input
            id="cf-color"
            type="text"
            name="color"
            value={form.color}
            onChange={handleChange}
            className="cf-input"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-material" className="cf-label">Material</label>
          <input
            id="cf-material"
            type="text"
            name="material"
            value={form.material}
            onChange={handleChange}
            className="cf-input"
          />
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
          <input
            id="cf-occasion"
            type="text"
            name="occasion"
            value={form.occasion}
            onChange={handleChange}
            className="cf-input"
          />
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
"use client";

import React, { useState } from "react";
import { Clothing } from "@/app/models/Clothing";

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

      if (!response.ok) {
        throw new Error("Error al analizar la imagen");
      }

      const analysis = await response.json();
      const analyzedColor = analysis.color_name || form.color;

      setForm((current) => ({
        ...current,
        type: analysis.type || current.type,
        color: analyzedColor,  // Siempre mostrar el color detectado por el sistema
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
      await analyzeImage(selectedFile);
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
      }
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar la prenda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md p-6 rounded-2xl max-w-md mx-auto"
    >
      <h2 className="text-2xl font-semibold mb-4">
        {mode === "create" ? "Añade una prenda" : "Editar prenda"}
      </h2>

      <input
        type="text"
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
        required
        className="border p-2 mb-3 w-full rounded"
      />

      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="border p-2 mb-3 w-full rounded"
      >
        <option value="Top">Top</option>
        <option value="Pants">Pantalón</option>
        <option value="Shoes">Zapatos</option>
      </select>

      <input
        type="text"
        name="color"
        placeholder="Color"
        value={form.color}
        onChange={handleChange}
        className="border p-2 mb-3 w-full rounded"
      />

      <input
        type="text"
        name="material"
        placeholder="Material"
        value={form.material}
        onChange={handleChange}
        className="border p-2 mb-3 w-full rounded"
      />

      <input
        type="text"
        name="size"
        placeholder="Talla"
        value={form.size}
        onChange={handleChange}
        className="border p-2 mb-3 w-full rounded"
      />

      <input
        type="text"
        name="occasion"
        placeholder="Ocasión"
        value={form.occasion}
        onChange={handleChange}
        className="border p-2 mb-3 w-full rounded"
      />

      {/* El input de imagen solo se muestra en creación */}
      {mode === "create" && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            className="border p-2 mb-3 w-full rounded"
          />
          {isAnalyzing && (
            <p className="text-sm text-slate-500 mb-3">Analizando imagen...</p>
          )}
          {!isAnalyzing && file && (
            <p className="text-sm text-slate-500 mb-3">
              Los valores se han completado automáticamente; puedes modificarlos antes de guardar.
            </p>
          )}
        </>
      )}

      <button
        type="submit"
        disabled={loading || isAnalyzing}
        className="bg-[#365f66] text-white py-2 px-4 rounded w-full transition-colors"
      >
        {loading
          ? "Guardando..."
          : isAnalyzing
          ? "Analizando..."
          : mode === "create"
          ? "Añadir prenda"
          : "Guardar cambios"}
      </button>
    </form>
  );
}
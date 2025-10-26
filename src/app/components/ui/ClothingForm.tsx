"use client";

import React, { useState } from "react";
import { clothingController } from "@/app/controllers/ClothingController";
import { account } from "@/lib/appwrite";

export default function ClothingForm() {
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    color: "",
    type: "Top",
    material: "",
    size: "",
    occasion: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Por favor selecciona una imagen");

    setLoading(true);
    try {
      const user = await account.get();
      await clothingController.addClothing(file, {
        ...form,
        userId: user.$id,
      });
      alert("Prenda registrada correctamente 🎉");
      setForm({
        name: "",
        color: "",
        type: "Top",
        material: "",
        size: "",
        occasion: "",
      });
      setFile(null);
    } catch (err: any) {
      console.error(err);
      alert("Error al registrar la prenda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md p-6 rounded-2xl max-w-md mx-auto mt-8"
    >
      <h2 className="text-2xl font-semibold mb-4">Añade una prenda</h2>

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

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="border p-2 mb-3 w-full rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600"
      >
        {loading ? "Guardando..." : "Añadir prenda"}
      </button>
    </form>
  );
}

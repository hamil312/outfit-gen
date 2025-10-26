import { clothingRepository } from "@/app/repositories/ClothingRepository";
import { Clothing } from "@/app/models/Clothing";

export const clothingController = {
  async addClothing(file: File, data: Omit<Clothing, "image">) {
    // 1️⃣ Subir imagen al bucket de Appwrite
    const imageId = await clothingRepository.uploadImage(file);

    // 2️⃣ Llamar a tu API Flask para analizar la imagen
    const formData = new FormData();
    formData.append("file", file);

    let analysis: any = {};
    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });
      analysis = await response.json();
    } catch (error) {
      console.error("Error al analizar imagen con Flask:", error);
    }

    const clothingData: Clothing = {
      ...data,
      image: imageId,
      type: analysis.type || data.type || "Desconocido",
      color: Array.isArray(analysis.color)
        ? `rgb(${analysis.color.join(", ")})`
        : data.color || "Desconocido",
      material: data.material || "Desconocido",
      occasion: analysis.occasion || data.occasion || "Desconocido",
    };

    // 4️⃣ Crear documento en Appwrite Database
    const created = await clothingRepository.createClothing(clothingData);
    return created;
  },
};
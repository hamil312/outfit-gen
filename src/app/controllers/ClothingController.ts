import { clothingRepository } from "@/app/repositories/ClothingRepository";
import { Clothing } from "@/app/models/Clothing";
import { account } from "@/lib/appwrite";

export const clothingController = {
  async addClothing(file: File, data: Omit<Clothing, "image">) {
    const imageId = await clothingRepository.uploadImage(file);

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
    

    

    const created = await clothingRepository.createClothing(clothingData);
    return created;
  },
  async generateOutfits(selectedColor?: string, selectedContext?: string) {
    try {
      // 🔹 Obtener usuario actual
      const user = await account.get();

      // 🔹 Obtener prendas del usuario
      const userClothes = await clothingRepository.getClothingsByUser(user.$id);

      // 🔹 Convertir color RGB string a array numérico para Flask
      const normalizedClothes = userClothes.map((item) => {
        let rgb = [0, 0, 0];
        if (item.color && item.color.startsWith("rgb")) {
          rgb = item.color
            .replace(/[^\d,]/g, "")
            .split(",")
            .map((n) => parseInt(n.trim(), 10));
        }

        return {
          id: item.$id,
          image: item.image,
          type: item.type || "unknown",
          color: rgb,
          occasion: item.occasion?.toLowerCase() || "neutral",
        };
      });

      // 🔹 Si el usuario seleccionó un contexto o color, los aplicamos
      let filtered = normalizedClothes;
      if (selectedContext) {
        filtered = filtered.filter(
          (c) => c.occasion === selectedContext.toLowerCase()
        );
      }

      // 🔹 Enviar al backend Flask
      const response = await fetch("http://localhost:5000/generate-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtered),
      });

      const data = await response.json();
      if (!data.outfits || data.outfits.length === 0) {
        console.warn("⚠️ No se recibieron outfits, generando aleatorio...");
        if (userClothes.length > 0) {
          const randomOutfit = userClothes.slice(0, 3);
          return [{ superior: randomOutfit[0], inferior: randomOutfit[1], calzado: randomOutfit[2] }];
        }
      }
      return data.outfits || [];
    } catch (error) {
      console.error("Error generando outfits:", error);
      return [];
    }
  },
};
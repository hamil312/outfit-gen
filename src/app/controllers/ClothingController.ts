import { clothingRepository } from "@/app/repositories/ClothingRepository";
import { Clothing } from "@/app/models/Clothing";
import { account, databases } from "@/lib/appwrite";

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

  async deleteClothing(clothing: Clothing) {
    if (!clothing.$id) throw new Error("Missing document ID");

    await clothingRepository.deleteClothing(clothing.$id, clothing.image);
    return true;
  },

  async getUserClothes() {
    const user = await account.get();
    return clothingRepository.getClothingsByUser(user.$id);
  },

  async generateOutfitWithBase(baseClothingId?: string) {
    const user = await account.get();
    const allClothes = await clothingRepository.getClothingsByUser(user.$id);

    const baseItem = allClothes.find(c => c.$id === baseClothingId);
    if (!baseItem) throw new Error("Prenda base no encontrada");

    const normalize = (item: any) => {
      let rgb = [0,0,0];
      if (item.color?.startsWith("rgb")) {
        rgb = item.color.replace(/[^\d,]/g, "").split(",").map((n: string) => parseInt(n.trim(), 10));
      }

      return {
        $id: item.$id,     // ← NECESARIO
        id: item.$id,      // ← si quieres mantener ambos
        image: item.image,
        type: item.type,
        color: rgb,
        occasion: item.occasion?.toLowerCase() || "neutral"
      };
    };

    const base = normalize(baseItem);
    const all = allClothes.map(normalize);

    const response = await fetch("http://localhost:5000/generate-outfit-with-base", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base_item: base, all_items: all })
    });

    const data = await response.json();
    return data.outfit;
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
          $id: item.$id,      // ← NECESARIO
          id: item.$id,       // ← opcional
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

  async updateClothing(id: string, data: any) {
    return await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CLOTHING_COLLECTION_ID!,
      id,
      data
    );
  }
};
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
      const user = await account.get();
      const userClothes = await clothingRepository.getClothingsByUser(user.$id);

      // -----------------------
      // Normalización (igual que antes)
      // -----------------------
      const normalize = (item: any) => {
        let rgb = [0, 0, 0];
        if (item.color?.startsWith("rgb")) {
          rgb = item.color
            .replace(/[^\d,]/g, "")
            .split(",")
            .map((n: string) => parseInt(n.trim(), 10));
        }

        return {
          $id: item.$id,
          id: item.$id,
          image: item.image,
          type: item.type,
          color: rgb,
          occasion: item.occasion?.toLowerCase() || "neutral",
        };
      };

      const all = userClothes.map(normalize);

      function getColorName(rgb: number[]) {
        const [r, g, b] = rgb;

        if (r < 40 && g < 40 && b < 40) return "black";
        if (r > 220 && g > 220 && b > 220) return "white";
        if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) return "gray";
        if (r > 150 && g < 100 && b < 100) return "red";
        if (r > 150 && g > 150 && b < 80) return "yellow";
        if (g > 120 && r < 120 && b < 120) return "green";
        if (b > 140 && r < 120 && g < 120) return "blue";
        if (r > 120 && g > 100 && b < 80) return "beige";

        return "neutral";
      }

      // -----------------------------------
      // 1) SOLO COLOR → buscar prenda base
      // -----------------------------------
      const hasColor = selectedColor && selectedColor.toLowerCase() !== "any";
      const hasContext = selectedContext && selectedContext.toLowerCase() !== "any";

      if (hasColor && !hasContext) {
        const targetColor = selectedColor!.toLowerCase();

        const baseItem = all.find((c) => getColorName(c.color) === targetColor);

        if (baseItem) {
          // usar generación con base
          const response = await fetch("http://localhost:5000/generate-outfit-with-base", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base_item: baseItem, all_items: all }),
          });

          const data = await response.json();
          return [data.outfit];
        }
      }

      // ---------------------------------------------------------
      // 2) COLOR + CONTEXTO → buscar prenda que cumpla ambos
      // ---------------------------------------------------------
      if (hasColor && hasContext) {
        const targetColor = selectedColor!.toLowerCase();
        const targetContext = selectedContext!.toLowerCase();

        const baseItem = all.find(
          (c) =>
            getColorName(c.color) === targetColor &&
            c.occasion === targetContext
        );

        if (baseItem) {
          const response = await fetch("http://localhost:5000/generate-outfit-with-base", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base_item: baseItem, all_items: all }),
          });

          const data = await response.json();
          return [data.outfit];
        }
      }

      // ---------------------------------------------------------
      // 3) SOLO CONTEXTO → usar lógica previa de filtrado
      // ---------------------------------------------------------
      let filtered = all;

      if (hasContext) {
        filtered = filtered.filter((c) => c.occasion === selectedContext!.toLowerCase());
      }

      if (hasColor) {
        const targetColor = selectedColor!.toLowerCase();
        filtered = filtered.filter((c) => getColorName(c.color) === targetColor);
      }

      // Si no hay prendas filtradas → usar todas
      if (filtered.length === 0) filtered = all;

      // -----------------------------------
      // Generación normal con el endpoint
      // -----------------------------------
      const response = await fetch("http://localhost:5000/generate-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtered),
      });

      const data = await response.json();
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
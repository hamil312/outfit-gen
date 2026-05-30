import { clothingRepository } from "@/app/repositories/ClothingRepository";
import { Clothing } from "@/app/models/Clothing";
import { account, databases } from "@/lib/appwrite";

const normalize = (item: any) => ({
  $id: item.$id,
  id: item.$id,
  image: item.image,
  type: item.type,
  color: item.color,
  occasion: item.occasion?.toLowerCase() || "neutral",
  style: item.style?.toLowerCase() || "unknown",
  material: item.material?.toLowerCase() || "unknown",
  print: item.print?.toLowerCase() || "solid",
});

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
      type: data.type?.trim() || analysis.type || "Desconocido",
      color: data.color?.trim() || analysis.color_name || "Desconocido",
      material: data.material?.trim() || analysis.material || "Desconocido",
      print: data.print?.trim() || analysis.print || "Desconocido",
      style: data.style?.trim() || analysis.style || "Desconocido",
      occasion: data.occasion?.trim() || analysis.occasion || "Desconocido",
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

  async generateOutfitWithBase(
    baseItem: any,
    allItems?: any[],
    useMaterialMatching = false,
    useMaterialBalance = false,
    usePrintMatching = false,
  ) {
    const user = await account.get();
    const allClothes = await clothingRepository.getClothingsByUser(user.$id);
    const items = allItems && allItems.length ? allItems : allClothes;

    const base = typeof baseItem === "string"
      ? allClothes.find(c => c.$id === baseItem)
      : baseItem;
    if (!base) throw new Error("Prenda base no encontrada");

    const normalizedBase = normalize(base);
    const normalizedAll = items.map(normalize);

    const response = await fetch("http://localhost:5000/generate-outfit-with-base", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_item: normalizedBase,
        all_items: normalizedAll,
        material_matching: useMaterialMatching,
        material_balance: useMaterialBalance,
        print_matching: usePrintMatching,
      }),
    });

    const data = await response.json();
    return data.outfit;
  },

  async generateOutfits(
    selectedColor?: string,
    selectedContext?: string,
    selectedStyle?: string,
    useMaterialMatching = false,
    useMaterialBalance = false,
    selectedMaterial?: string,
    usePrintMatching = false,
    selectedPrint?: string,
  ) {
    try {
      const user = await account.get();
      const userClothes = await clothingRepository.getClothingsByUser(user.$id);

      const all = userClothes.map(normalize);

      function getColorName(color: string | number[]) {
        if (typeof color === 'string') return color.toLowerCase();
        const [r, g, b] = color;
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

      const hasColor   = selectedColor   && selectedColor.toLowerCase() !== "any";
      const hasContext = selectedContext && selectedContext.toLowerCase() !== "any";
      const hasStyle   = selectedStyle   && selectedStyle.toLowerCase() !== "any";

      // ── Find base item for color-only or color+context mode ──
      if (hasColor && !hasContext && !hasStyle) {
        const baseItem = all.find((c) => getColorName(c.color) === selectedColor!.toLowerCase());
        if (baseItem) {
          const response = await fetch("http://localhost:5000/generate-outfit-with-base", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base_item: baseItem,
              all_items: all,
              material_matching: useMaterialMatching,
              material_balance: useMaterialBalance,
              print_matching: usePrintMatching,
            }),
          });
          const data = await response.json();
          return [data.outfit];
        }
      }

      if (hasColor && hasContext && !hasStyle) {
        const baseItem = all.find(
          (c) =>
            getColorName(c.color) === selectedColor!.toLowerCase() &&
            c.occasion === selectedContext!.toLowerCase()
        );
        if (baseItem) {
          const response = await fetch("http://localhost:5000/generate-outfit-with-base", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base_item: baseItem,
              all_items: all,
              material_matching: useMaterialMatching,
              material_balance: useMaterialBalance,
              print_matching: usePrintMatching,
            }),
          });
          const data = await response.json();
          return [data.outfit];
        }
      }

      // ── Filter clothes ──
      let filtered = all;

      if (hasContext) {
        filtered = filtered.filter((c) => c.occasion === selectedContext!.toLowerCase());
      }
      if (hasStyle) {
        filtered = filtered.filter((c) => c.style === selectedStyle!.toLowerCase());
      }
      if (hasColor) {
        const targetColor = selectedColor!.toLowerCase();
        filtered = filtered.filter((c) => getColorName(c.color) === targetColor);
      }

      // Fallback to all if filters are too restrictive
      if (filtered.length === 0) {
        filtered = all;
      }

      // ── Generate via Flask ──
      const response = await fetch("http://localhost:5000/generate-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: filtered,
          style: selectedStyle,
          material_matching: useMaterialMatching,
          material_balance: useMaterialBalance,
          material: selectedMaterial,
          print_matching: usePrintMatching,
          print: selectedPrint,
        }),
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

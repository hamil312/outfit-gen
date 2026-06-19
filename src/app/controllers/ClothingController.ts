import { clothingRepository } from "@/app/repositories/ClothingRepository";
import { Clothing } from "@/app/models/Clothing";
import { account, databases } from "@/lib/appwrite";
import { FLASK_API_URL } from "@/lib/config";
import { profileController } from "@/app/controllers/ProfileController";

const recentBaseItemIds: string[] = [];

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
  async compressToWebP(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("WebP compression failed"));
            const webpName = file.name.replace(/\.[^.]+$/, ".webp");
            resolve(new File([blob], webpName, { type: "image/webp" }));
          },
          "image/webp",
          quality
        );
      };
      img.onerror = reject;
      img.src = url;
    });
  },

  async addClothing(file: File, data: Omit<Clothing, "image">) {
    const compressed = await this.compressToWebP(file);
    const imageId = await clothingRepository.uploadImage(compressed);

    const formData = new FormData();
    formData.append("file", compressed);

    let analysis: any = {};
    try {
      const response = await fetch(`${FLASK_API_URL}/analyze`, {
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

    const response = await fetch(`${FLASK_API_URL}/generate-outfit-with-base`, {
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
    useWeather = false,
    weatherLocation?: { lat: number; lon: number } | null,
  ) {
    try {
      const user = await account.get();
      const userClothes = await clothingRepository.getClothingsByUser(user.$id);

      const all = userClothes.map(normalize);

      let profile: any = null;
      try {
        profile = await profileController.getProfile(user.$id);
      } catch { /* no profile yet */ }

      let activeContext = selectedContext;
      let activeStyle = selectedStyle;

      if (profile) {
        if ((!activeContext || activeContext.toLowerCase() === "any") && profile.dominantOccasion) {
          const occMap: Record<string, string> = { work: "formal", social: "informal", sport: "sport", home: "casual" };
          activeContext = occMap[profile.dominantOccasion.toLowerCase()] || profile.dominantOccasion;
        }
        if ((!activeStyle || activeStyle.toLowerCase() === "any") && profile.styleKeyword) {
          const styleMap: Record<string, string> = { minimal: "minimalist", urban: "streetwear", classic: "classic", experimental: "avant-garde" };
          activeStyle = styleMap[profile.styleKeyword.toLowerCase()] || profile.styleKeyword;
        }
      }

      function getColorName(color: string | number[]) {
        if (typeof color === 'string') return color.toLowerCase();
        const [r, g, b] = color;
        if (r < 40 && g < 40 && b < 40) return "black";
        if (r > 220 && g > 220 && b > 220) return "white";
        if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) return "gray";
        if (r > 150 && g < 100 && b < 100) return "red";
        if (r > 200 && g > 80 && g < 150 && b < 70 && r - g > 40) return "orange";
        if (r > 150 && g > 150 && b < 80) return "yellow";
        if (r > 200 && b > 120 && g > 80 && g < 200 && r - g > 30) return "pink";
        if (g > 120 && r < 120 && b < 120) return "green";
        if (b > 140 && r < 120 && g < 120) return "blue";
        if (r < 70 && g < 70 && b > 80) return "navy";
        if (r > 80 && b > 100 && g < 100) return "purple";
        if (r > 70 && r < 200 && g < 90 && b < 70 && r > g) return "brown";
        if (r > 120 && g > 100 && b < 80) return "beige";
        return "neutral";
      }

      const hasColor   = selectedColor   && selectedColor.toLowerCase() !== "any";
      const hasContext = activeContext && activeContext.toLowerCase() !== "any";
      const hasStyle   = activeStyle   && activeStyle.toLowerCase() !== "any";

      // ── Try to find a base item matching any active filter ──
      const anyFilter = hasColor || hasContext || hasStyle;
      if (anyFilter) {
        const candidates = all.filter((c) => {
          let match = true;
          if (hasColor)   match = match && getColorName(c.color) === selectedColor!.toLowerCase();
          if (hasContext) match = match && c.occasion === activeContext!.toLowerCase();
          if (hasStyle)   match = match && c.style === activeStyle!.toLowerCase();
          return match;
        });
        let baseItem = candidates.find(c => !recentBaseItemIds.includes(c.$id))
                      || candidates[0];
        if (baseItem) {
          recentBaseItemIds.unshift(baseItem.$id);
          if (recentBaseItemIds.length > 10) recentBaseItemIds.pop();
          const body: any = {
            base_item: baseItem,
            all_items: all,
            material_matching: useMaterialMatching,
            material_balance: useMaterialBalance,
            print_matching: usePrintMatching,
          };
          if (useWeather && weatherLocation) {
            body.context = weatherLocation;
          }
          if (profile) {
            body.profile = profile;
          }
          const response = await fetch(`${FLASK_API_URL}/generate-outfit-with-base`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          return { outfits: data.outfit ? [data.outfit] : [], fallback: !data.outfit };
        }
      }

      // ── Filter clothes ──
      let filtered = all;

      if (hasContext) {
        filtered = filtered.filter((c) => c.occasion === activeContext!.toLowerCase());
      }
      if (hasStyle) {
        filtered = filtered.filter((c) => c.style === activeStyle!.toLowerCase());
      }
      if (hasColor) {
        const targetColor = selectedColor!.toLowerCase();
        filtered = filtered.filter((c) => getColorName(c.color) === targetColor);
      }

      if (filtered.length === 0) {
        filtered = all;
      }

      // ── Generate via Flask ──
      const body: any = {
        items: filtered,
        style: selectedStyle,
        material_matching: useMaterialMatching,
        material_balance: useMaterialBalance,
        material: selectedMaterial,
        print_matching: usePrintMatching,
        print: selectedPrint,
      };
      if (useWeather && weatherLocation) {
        body.context = weatherLocation;
      }
      if (profile) {
        body.profile = profile;
      }
      const response = await fetch(`${FLASK_API_URL}/generate-outfits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return { outfits: Array.isArray(data.outfits) ? data.outfits : [], fallback: data.fallback === true };
    } catch (error) {
      console.error("Error generando outfits:", error);
      return { outfits: [], fallback: false };
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

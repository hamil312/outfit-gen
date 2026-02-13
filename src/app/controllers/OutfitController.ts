import { databases, account } from "@/lib/appwrite";
import { outfitRepository } from "../repositories/OutfitRepository";
import { clothingRepository } from "../repositories/ClothingRepository";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID!;

export const outfitController = {
    async saveOutfit(outfit: any, name: string = "Outfit generado") {
        const user = await account.get();

        // Detectar si es outfit completo
        const isFull = !!outfit.completo;

        return await databases.createDocument(DB_ID, COLLECTION_ID, "unique()", {
            name,
            userId: user.$id,
            userName: user.name || user.$id,
            occasion:
                outfit.superior?.occasion ||
                outfit.inferior?.occasion ||
                outfit.calzado?.occasion ||
                outfit.completo?.occasion ||
                "informal",

            // Si es outfit con pieza completa:
            superior: isFull ? outfit.completo?.$id || null : outfit.superior?.$id || null,
            inferior: isFull ? null : outfit.inferior?.$id || null,
            shoes: outfit.calzado?.$id || null
        });
    },

    async getUserOutfits() {
        const user = await account.get();
        if (!user || !user.$id) throw new Error("Usuario no autenticado");

        const docs = await outfitRepository.getOutfitsByUser(user.$id);

        const enriched = await Promise.all((docs || []).map(async (doc: any) => {
            const userName = doc.userName || doc.userId;

            const clothingIds = [doc.superior, doc.inferior, doc.shoes].filter(Boolean);
            const clothingPromises = clothingIds.map((id: string) => clothingRepository.getClothingById(id));
            const clothes = await Promise.all(clothingPromises);

            return {
                ...doc,
                userName,
                clothes,
                likes: typeof doc.likes === 'number' ? doc.likes : 0
            };
        }));

        return enriched;
    },


    async getPublicOutfits(page: number = 1, perPage: number = 10) {
        const res = await outfitRepository.getPublicOutfits(page, perPage);
        const docs = res.documents || [];

        // Enriquecer con info de usuario y prendas
        // Intentar obtener favoritos del usuario actual (si está autenticado)
    let favouritesSet = new Set<string>();
    try {
        const user = await account.get();
        if (user && user.$id) {
            const favs = await (await import("../repositories/FavouriteRepository")).favouriteRepository.getFavouritesByUser(user.$id);
            (favs || []).forEach((f: any) => favouritesSet.add(f.outfitId));
        }
    } catch (err) {
        // No autenticado; seguimos sin marcar favoritos
    }

    const enriched = await Promise.all(docs.map(async (doc: any) => {
            // Preferir el userName almacenado; si no existe, fallback a userId
            const userName = doc.userName || doc.userId;

            // Obtener prendas
            const clothingIds = [doc.superior, doc.inferior, doc.shoes].filter(Boolean);
            const clothingPromises = clothingIds.map((id: string) => clothingRepository.getClothingById(id));

            const clothes = await Promise.all(clothingPromises);

            return {
                ...doc,
                userName,
                clothes,
                liked: favouritesSet.has(doc.$id),
                likes: typeof doc.likes === 'number' ? doc.likes : 0
            };
        }));

        return { outfits: enriched, count: docs.length, total: (res as any).total || null };
    },

    async getFavouriteOutfits() {
        const user = await account.get();
        if (!user || !user.$id) throw new Error("Usuario no autenticado");

        const favs = await (await import("../repositories/FavouriteRepository")).favouriteRepository.getFavouritesByUser(user.$id);
        const outfitIds = (favs || []).map((f: any) => f.outfitId).filter(Boolean);

        const docs = await Promise.all(outfitIds.map((id: string) => outfitRepository.getOutfitById(id)));

        const enriched = await Promise.all((docs || []).filter(Boolean).map(async (doc: any) => {
            const userName = doc.userName || doc.userId;
            const clothingIds = [doc.superior, doc.inferior, doc.shoes].filter(Boolean);
            const clothingPromises = clothingIds.map((id: string) => clothingRepository.getClothingById(id));
            const clothes = await Promise.all(clothingPromises);

            return {
                ...doc,
                userName,
                clothes,
                liked: true,
                likes: typeof doc.likes === 'number' ? doc.likes : 0
            };
        }));

        return enriched;
    },

    async publishOutfit(id: string, publish: boolean) {
        if (!id) throw new Error("Missing document ID");

        const user = await account.get();
        if (!user || !user.$id) throw new Error("Usuario no autenticado");

        const outfit = await outfitRepository.getOutfitById(id);
        if (!outfit) throw new Error("Outfit not found");
        if (outfit.userId !== user.$id) throw new Error("No autorizado");

        const data: any = { public: !!publish };
        if (publish) data.publishedAt = new Date().toISOString();
        else data.publishedAt = null;

        const updated = await outfitRepository.updateOutfit(id, data);
        return updated;
    },

    async deleteOutfit(id: string) {
        if (!id) throw new Error("Missing document ID");

        const user = await account.get();
        if (!user || !user.$id) throw new Error("Usuario no autenticado");

        const outfit = await outfitRepository.getOutfitById(id);
        if (!outfit) throw new Error("Outfit not found");
        if (outfit.userId !== user.$id) throw new Error("No autorizado");
    
        await outfitRepository.deleteOutfit(id);
        return true;
    },


};
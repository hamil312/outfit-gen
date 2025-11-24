import { databases, account } from "@/lib/appwrite";
import { outfitRepository } from "../repositories/OutfitRepository";

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
        return await outfitRepository.getOutfits();
    },

    async deleteOutfit(id: string) {
        if (!id) throw new Error("Missing document ID");
    
        await outfitRepository.deleteOutfit(id);
        return true;
    },
};
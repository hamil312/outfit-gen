import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const OUTFITS_COLLECTION = "outfit";

export const outfitRepository = {
  async getOutfits() {
    const res = await databases.listDocuments(
      DATABASE_ID,
      OUTFITS_COLLECTION,
      [ Query.orderAsc("$createdAt") ]
    );

    return res.documents;
  },

  async getOutfitById(id: string) {
    return await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID!,
      id
    );
  },

  async updateOutfit(id: string, data: any) {
    return await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID!,
      id,
      data
    );
  },

  async getPublicOutfits(page: number = 1, perPage: number = 10) {
    const offset = (page - 1) * perPage;
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID!,
      [
        // Solo públicos
        Query.equal("public", true),
        // Ordenar por fecha de actualización descendente
        Query.orderDesc("$updatedAt"),
        // Paginación
        Query.limit(perPage),
        Query.offset(offset),
      ]
    );

    return res;
  },

  async getOutfitsByUser(userId: string) {
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$updatedAt"),
      ]
    );

    return res.documents;
  },

  async deleteOutfit(id: string) {
    return await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID!,
      id
    );
  }
};
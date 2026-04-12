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

  async getPublicOutfits(page: number = 1, perPage: number = 10, searchTerm?: string, occasion?: string, sortBy?: 'recent' | 'likes') {
    const queries: any[] = [
      Query.equal("public", true),
    ];

    if (occasion) {
      queries.push(Query.equal("occasion", occasion));
    }

    // Obtener todos los documentos que cumplan con los filtros (sin paginación para filtrar)
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID!,
      queries
    );

    let documents = res.documents;

    // Filtrar por searchTerm si existe
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      documents = documents.filter(doc =>
        (doc.name && doc.name.toLowerCase().includes(term)) ||
        (doc.description && doc.description.toLowerCase().includes(term)) ||
        (doc.userName && doc.userName.toLowerCase().includes(term))
      );
    }

    // Ordenar
    if (sortBy === 'recent') {
      documents.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'likes') {
      documents.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      documents.sort((a, b) => new Date(b.$updatedAt).getTime() - new Date(a.$updatedAt).getTime());
    }

    // Paginación manual
    const offset = (page - 1) * perPage;
    const paginatedDocs = documents.slice(offset, offset + perPage);

    return { documents: paginatedDocs, total: documents.length };
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
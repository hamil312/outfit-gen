import { storage, databases, ID } from "@/lib/appwrite";
import { Clothing } from "@/app/models/Clothing";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const CLOTHING_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CLOTHING_COLLECTION_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";

export const clothingRepository = {
  // Subir imagen al bucket de Appwrite
  async uploadImage(file: File) {
    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return uploaded.$id;
  },

  // Crear documento en la colección Clothing
  async createClothing(clothing: Clothing) {
    const created = await databases.createDocument(
      DATABASE_ID,
      CLOTHING_COLLECTION_ID,
      ID.unique(),
      clothing
    );
    return created;
  },
};

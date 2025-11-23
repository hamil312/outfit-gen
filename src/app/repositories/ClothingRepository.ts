import { storage, databases, ID} from "@/lib/appwrite";
import { Query } from "appwrite";
import { Clothing } from "@/app/models/Clothing";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const CLOTHING_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CLOTHING_COLLECTION_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";

export const clothingRepository = {
  async uploadImage(file: File) {
    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return uploaded.$id;
  },

  async createClothing(clothing: Clothing) {
    const created = await databases.createDocument(
      DATABASE_ID,
      CLOTHING_COLLECTION_ID,
      ID.unique(),
      clothing
    );
    return created;
  },

  async getClothingsByUser(userId: string) {
    const result = await databases.listDocuments(
      DATABASE_ID,
      CLOTHING_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    return result.documents as unknown as Clothing[];
  },

  async deleteClothing(clothingId: string | undefined, imageId: string | undefined) {
    if (!clothingId) throw new Error("Missing clothingId");
    if (!imageId) {
      console.warn("⚠ No imageId found, skipping image deletion");
    }

    await databases.deleteDocument(
      DATABASE_ID,
      CLOTHING_COLLECTION_ID,
      clothingId
    );

    if (imageId) {
      await storage.deleteFile(BUCKET_ID, imageId);
    }

    return true;
  }
};

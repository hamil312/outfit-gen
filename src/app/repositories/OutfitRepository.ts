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

  async deleteOutfit(id: string) {
    return await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID!,
      id
    );
  }
};
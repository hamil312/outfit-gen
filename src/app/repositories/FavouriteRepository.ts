import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const FAVOURITES_COLLECTION = "favourites";

export const favouriteRepository = {
  async addFavourite(userId: string, outfitId: string) {
    return await databases.createDocument(
      DATABASE_ID,
      FAVOURITES_COLLECTION,
      "unique()",
      {
        userId,
        outfitId
      }
    );
  },

  async findFavouriteByUserAndOutfit(userId: string, outfitId: string) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      FAVOURITES_COLLECTION,
      [Query.equal("userId", userId), Query.equal("outfitId", outfitId), Query.limit(1)]
    );

    return (res.documents && res.documents.length > 0) ? res.documents[0] : null;
  },

  async deleteFavourite(id: string) {
    return await databases.deleteDocument(DATABASE_ID, FAVOURITES_COLLECTION, id);
  },

  async getFavouritesByUser(userId: string) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      FAVOURITES_COLLECTION,
      [Query.equal("userId", userId), Query.limit(1000)]
    );

    return res.documents;
  }
};

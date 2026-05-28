import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COMMENTS_COLLECTION = "comments";

export const commentRepository = {
  async getCommentsByOutfit(outfitId: string) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COMMENTS_COLLECTION,
      [
        Query.equal("outfitId", outfitId),
        Query.orderAsc("$createdAt"),
        Query.limit(100)
      ]
    );

    return res.documents;
  },

  async addComment(comment: string, userId: string, userName: string, outfitId: string) {
    return await databases.createDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION,
      "unique()",
      {
        comment,
        userId,
        userName,
        outfitId
      }
    );
  },

  async updateComment(id: string, comment: string) {
    return await databases.updateDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION,
      id,
      { comment }
    );
  },

  async deleteComment(id: string) {
    return await databases.deleteDocument(DATABASE_ID, COMMENTS_COLLECTION, id);
  }
};

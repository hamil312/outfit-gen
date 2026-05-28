import { account } from "@/lib/appwrite";
import { commentRepository } from "../repositories/CommentRepository";

export const commentController = {
  async getComments(outfitId: string) {
    const docs = await commentRepository.getCommentsByOutfit(outfitId);
    return docs.map((doc: any) => ({
      $id: doc.$id,
      comment: doc.comment,
      userId: doc.userId,
      userName: doc.userName,
      outfitId: doc.outfitId,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    }));
  },

  async addComment(outfitId: string, comment: string) {
    const user = await account.get();
    if (!user || !user.$id) throw new Error("Usuario no autenticado");

    const doc = await commentRepository.addComment(comment, user.$id, user.name || user.$id, outfitId);
    return {
      $id: doc.$id,
      comment: doc.comment,
      userId: doc.userId,
      userName: doc.userName,
      outfitId: doc.outfitId,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    };
  },

  async updateComment(commentId: string, newComment: string) {
    const user = await account.get();
    if (!user || !user.$id) throw new Error("Usuario no autenticado");

    const doc = await commentRepository.updateComment(commentId, newComment);
    return {
      $id: doc.$id,
      comment: doc.comment,
      userId: doc.userId,
      userName: doc.userName,
      outfitId: doc.outfitId,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    };
  },

  async deleteComment(commentId: string) {
    const user = await account.get();
    if (!user || !user.$id) throw new Error("Usuario no autenticado");

    await commentRepository.deleteComment(commentId);
    return true;
  }
};

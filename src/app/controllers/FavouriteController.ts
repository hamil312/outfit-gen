import { account } from "@/lib/appwrite";
import { favouriteRepository } from "../repositories/FavouriteRepository";
import { outfitRepository } from "../repositories/OutfitRepository";

export const favouriteController = {
  async toggleFavourite(outfitId: string) {
    const user = await account.get();
    if (!user || !user.$id) throw new Error("Usuario no autenticado");

    const userId = user.$id;

    // Buscar favorito existente
    const existing = await favouriteRepository.findFavouriteByUserAndOutfit(userId, outfitId);

    // Obtener outfit actual
    const outfit = await outfitRepository.getOutfitById(outfitId);
    const currentLikes = (outfit && typeof outfit.likes === "number") ? outfit.likes : 0;

    if (existing) {
      // Eliminar favorito y decrementar contador
      await favouriteRepository.deleteFavourite(existing.$id);

      const newLikes = Math.max(0, currentLikes - 1);
      await outfitRepository.updateOutfit(outfitId, { likes: newLikes });

      return { liked: false, likes: newLikes };
    } else {
      // Crear favorito y aumentar contador
      await favouriteRepository.addFavourite(userId, outfitId);

      const newLikes = currentLikes + 1;
      await outfitRepository.updateOutfit(outfitId, { likes: newLikes });

      return { liked: true, likes: newLikes };
    }
  }
};

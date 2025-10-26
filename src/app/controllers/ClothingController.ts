import { clothingRepository } from "@/app/repositories/ClothingRepository";
import { Clothing } from "@/app/models/Clothing";

export const clothingController = {
  async addClothing(file: File, data: Omit<Clothing, "image">) {
    const imageId = await clothingRepository.uploadImage(file);

    const clothingData: Clothing = {
      ...data,
      image: imageId,
    };

    const created = await clothingRepository.createClothing(clothingData);
    return created;
  },
};

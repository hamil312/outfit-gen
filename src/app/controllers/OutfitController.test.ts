import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/appwrite", () => ({
  account: {
    get: vi.fn().mockResolvedValue({ $id: "user-123", name: "TestUser" }),
  },
  databases: {
    createDocument: vi.fn().mockResolvedValue({ $id: "outfit-1" }),
  },
}));

vi.mock("@/app/repositories/OutfitRepository", () => ({
  outfitRepository: {
    getOutfitsByUser: vi.fn().mockResolvedValue([
      { $id: "o1", superior: "c1", inferior: "c2", shoes: "c3",
        userId: "user-123", userName: "TestUser" },
    ]),
    getPublicOutfits: vi.fn().mockResolvedValue({
      documents: [
        { $id: "o1", superior: "c1", shoes: "c3",
          userId: "user-123", userName: "TestUser" },
      ],
      total: 1,
    }),
    getOutfitById: vi.fn().mockImplementation((id) =>
      Promise.resolve({ $id: id, superior: "c1", userId: "user-123" })
    ),
    updateOutfit: vi.fn().mockImplementation((id, data) =>
      Promise.resolve({ $id: id, ...data })
    ),
    deleteOutfit: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("@/app/repositories/ClothingRepository", () => ({
  clothingRepository: {
    getClothingById: vi.fn().mockImplementation((id) =>
      Promise.resolve({ $id: id, name: "Item " + id, type: "shirt" })
    ),
  },
}));

import { outfitController } from "./OutfitController";

describe("OutfitController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveOutfit", () => {
    it("creates an outfit document", async () => {
      const outfit = {
        superior: { $id: "c1", occasion: "casual" },
        inferior: { $id: "c2" },
        calzado: { $id: "c3" },
      };
      const result = await outfitController.saveOutfit(outfit, "My Outfit");
      expect(result.$id).toBe("outfit-1");
    });
  });

  describe("getUserOutfits", () => {
    it("returns enriched user outfits", async () => {
      const outfits = await outfitController.getUserOutfits();
      expect(outfits).toHaveLength(1);
      expect(outfits[0].userName).toBe("TestUser");
      expect(outfits[0].clothes).toHaveLength(3);
    });
  });

  describe("getPublicOutfits", () => {
    it("returns paginated public outfits", async () => {
      const result = await outfitController.getPublicOutfits(1, 10);
      expect(result.outfits).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("publishOutfit", () => {
    it("publishes an outfit", async () => {
      const updated = await outfitController.publishOutfit("o1", true, "Nice outfit", "Best");
      expect(updated.public).toBe(true);
      expect(updated.publishedAt).toBeDefined();
    });
  });

  describe("deleteOutfit", () => {
    it("deletes an outfit", async () => {
      const result = await outfitController.deleteOutfit("o1");
      expect(result).toBe(true);
    });
  });
});

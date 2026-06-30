import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock @/lib/appwrite BEFORE importing the controller ──
vi.mock("@/lib/appwrite", () => ({
  account: {
    get: vi.fn().mockResolvedValue({ $id: "user-123" }),
  },
  databases: {
    updateDocument: vi.fn().mockResolvedValue({}),
  },
  ID: { unique: () => "unique-id" },
}));

// ── Mock global fetch ──
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock the repository module (ClothingRepository is imported by the controller)
vi.mock("@/app/repositories/ClothingRepository", () => ({
  clothingRepository: {
    uploadImage: vi.fn().mockResolvedValue("img-456"),
    createClothing: vi.fn().mockImplementation((data) =>
      Promise.resolve({ $id: "clo-789", ...data })
    ),
    getClothingsByUser: vi.fn().mockResolvedValue([
      {
        $id: "1", name: "Shirt", color: "blue", type: "shirt",
        material: "cotton", print: "solid", style: "classic",
        occasion: "casual", size: "M", image: "img-1", userId: "user-123",
      },
      {
        $id: "2", name: "Pants", color: "black", type: "pants",
        material: "denim", print: "solid", style: "classic",
        occasion: "casual", size: "M", image: "img-2", userId: "user-123",
      },
      {
        $id: "3", name: "Shoes", color: "white", type: "shoes",
        material: "leather", print: "solid", style: "classic",
        occasion: "casual", size: "42", image: "img-3", userId: "user-123",
      },
    ]),
  },
}));

import { clothingController } from "@/app/controllers/ClothingController";

describe("ClothingController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserClothes", () => {
    it("returns the user's clothes", async () => {
      const clothes = await clothingController.getUserClothes();
      expect(clothes).toHaveLength(3);
      expect(clothes[0].name).toBe("Shirt");
    });
  });

  describe("addClothing", () => {
    it("creates a clothing item with compressed image", async () => {
      // Mock canvas/Image for compressToWebP
      globalThis.Image = class {
        onload: () => void = () => {};
        onerror: () => void = () => {};
        src = "";
        width = 100;
        height = 100;
        constructor() {
          setTimeout(() => this.onload(), 10);
        }
      } as any;

      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
        drawImage: vi.fn(),
      });
      HTMLCanvasElement.prototype.toBlob = vi.fn((cb) => {
        cb(new Blob(["fake-webp"], { type: "image/webp" }));
      });

      // Mock analyze endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: "shirt",
            color_name: "blue",
            material: "cotton",
            print: "solid",
            style: "classic",
            occasion: "casual",
          }),
      });

      const file = new File(["fake"], "test.jpg", { type: "image/jpeg" });
      const data = {
        name: "My Shirt",
        userId: "user-123",
        color: "",
        type: "shirt",
        material: "",
        print: "",
        style: "",
        size: "M",
        occasion: "",
      };

      const result = await clothingController.addClothing(file, data);
      expect(result.name).toBe("My Shirt");
      expect(result.type).toBe("shirt");
    });
  });

  describe("generateOutfits", () => {
    it("generates outfits with via flask endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            outfits: [
              {
                superior: { name: "Shirt" },
                inferior: { name: "Pants" },
                calzado: { name: "Shoes" },
              },
            ],
          }),
      });

      const { outfits, fallback } = await clothingController.generateOutfits(
        "any", "any", "any"
      );

      expect(outfits).toHaveLength(1);
      expect(outfits[0].superior.name).toBe("Shirt");
      expect(fallback).toBe(false);
    });
  });

  describe("generateOutfitWithBase", () => {
    it("generates an outfit around a base item", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            outfit: {
              superior: { name: "Shirt" },
              inferior: { name: "Pants" },
            },
          }),
      });

      const outfit = await clothingController.generateOutfitWithBase("1");
      expect(outfit.superior.name).toBe("Shirt");
    });
  });
});

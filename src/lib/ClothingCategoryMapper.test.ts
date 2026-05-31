import { describe, it, expect } from "vitest";
import { mapClothingTypeToSection } from "./ClothingCategoryMapper";

describe("mapClothingTypeToSection", () => {
  it("returns superior for shirt", () => {
    expect(mapClothingTypeToSection("shirt")).toBe("superior");
  });

  it("returns superior for t-shirt", () => {
    expect(mapClothingTypeToSection("t-shirt")).toBe("superior");
  });

  it("returns superior for jacket", () => {
    expect(mapClothingTypeToSection("jacket")).toBe("superior");
  });

  it("returns superior for dress", () => {
    expect(mapClothingTypeToSection("dress")).toBe("superior");
  });

  it("returns inferior for pants", () => {
    expect(mapClothingTypeToSection("pants")).toBe("inferior");
  });

  it("returns inferior for shorts", () => {
    expect(mapClothingTypeToSection("shorts")).toBe("inferior");
  });

  it("returns inferior for skirt", () => {
    expect(mapClothingTypeToSection("skirt")).toBe("inferior");
  });

  it("returns calzado for shoes", () => {
    expect(mapClothingTypeToSection("shoes")).toBe("calzado");
  });

  it("handles case insensitivity", () => {
    expect(mapClothingTypeToSection("SHIRT")).toBe("superior");
    expect(mapClothingTypeToSection("Pants")).toBe("inferior");
  });

  it("defaults to superior for unknown types", () => {
    expect(mapClothingTypeToSection("hat")).toBe("superior");
  });
});

export const mapClothingTypeToSection = (type: string): "superior" | "inferior" | "calzado" => {
  const upper = ["shirt", "t-shirt", "jacket", "dress"];
  const lower = ["pants", "shorts", "skirt"];
  const shoes = ["shoes"];

  if (upper.includes(type.toLowerCase())) return "superior";
  if (lower.includes(type.toLowerCase())) return "inferior";
  if (shoes.includes(type.toLowerCase())) return "calzado";
  return "superior";
};
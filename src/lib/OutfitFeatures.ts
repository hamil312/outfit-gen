export interface OutfitFeatures {
  colorIntensity: number;    // 0.0 (neutros) → 1.0 (colores vivos)
  formalityLevel: number;    // 0.0 (deporte/casa) → 1.0 (formal)
  styleExperimental: number; // 0.0 (clásico/minimal) → 1.0 (experimental)
  occasionType?: string;     // trabajo|casual|formal|deporte|fiesta|cita|playa|viaje
}

// ─── Tablas de puntuación ──────────────────────────────────────────────────────

const COLOR_INTENSITY: Record<string, number> = {
  black: 0.15, white: 0.1, gray: 0.1, grey: 0.1,
  beige: 0.15, neutral: 0.1, brown: 0.2, navy: 0.35, denim: 0.3,
  blue: 0.5,  green: 0.55, olive: 0.3,
  red: 0.85,  yellow: 0.9, orange: 0.85, pink: 0.75, purple: 0.7, violet: 0.7,
};

const FORMALITY: Record<string, number> = {
  formal: 0.9, work: 0.75, date: 0.6, party: 0.6, social: 0.5,
  travel: 0.4, casual: 0.3, home: 0.2, beach: 0.15, sport: 0.1,
  informal: 0.25, neutral: 0.35,
};

const STYLE_EXPERIMENTAL: Record<string, number> = {
  minimalist: 0.1, minimal: 0.1, classic: 0.15, preppy: 0.2, nautical: 0.25,
  romantic: 0.35, retro: 0.4, vintage: 0.4, bohemian: 0.55,
  urban: 0.6, streetwear: 0.65, edgy: 0.8, punk: 0.85,
  'avant-garde': 0.9, experimental: 0.95,
};

// Normaliza cualquier string de ocasión a las 8 clases del refiner
const OCCASION_NORMALIZE: Record<string, string> = {
  formal: 'formal',   work: 'work',     social: 'party',   date: 'date',
  party: 'party',     casual: 'casual', beach: 'beach',    travel: 'travel',
  sport: 'sport',     home: 'casual',   informal: 'casual', neutral: 'casual',
};

// ─── Helpers internos ─────────────────────────────────────────────────────────

function avg(values: number[]): number {
  if (values.length === 0) return 0.5;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 1000) / 1000;
}

// Resuelve el nombre del color desde un item de Flask (color_name) o de Appwrite (color string)
function resolveColorName(item: any): string {
  if (typeof item.color_name === 'string' && item.color_name)
    return item.color_name.toLowerCase().trim();
  if (typeof item.color === 'string' && item.color)
    return item.color.toLowerCase().trim();
  return 'neutral';
}

// Extrae el array plano de prendas desde cualquier forma de outfit
// - Outfit del generador:  { superior, inferior, calzado } | { completo, calzado }
// - Outfit del guardarropa/feed: { clothes: [...], ...resto }
function getItems(outfit: any): any[] {
  if (!outfit) return [];
  if (Array.isArray(outfit.clothes) && outfit.clothes.length > 0)
    return outfit.clothes.filter(Boolean);
  return [outfit.superior, outfit.inferior, outfit.calzado, outfit.completo].filter(Boolean);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function extractOutfitFeatures(outfit: any): OutfitFeatures {
  const items = getItems(outfit);

  if (items.length === 0)
    return { colorIntensity: 0.5, formalityLevel: 0.5, styleExperimental: 0.3 };

  const colorIntensity = avg(
    items.map(it => COLOR_INTENSITY[resolveColorName(it)] ?? 0.4)
  );

  const formalityLevel = avg(
    items.map(it => {
      const occ = (it.occasion ?? '').toLowerCase().trim();
      return FORMALITY[occ] ?? 0.35;
    })
  );

  const styleExperimental = avg(
    items.map(it => {
      const sty = (it.style ?? '').toLowerCase().trim();
      return STYLE_EXPERIMENTAL[sty] ?? 0.3;
    })
  );

  // Ocasión: campo outfit-level primero, si no el primer item con valor
  const rawOccasion =
    (typeof outfit.occasion === 'string' && outfit.occasion)
      ? outfit.occasion.toLowerCase().trim()
      : items.map(it => (it.occasion ?? '').toLowerCase().trim()).find(o => o) ?? '';

  const occasionType = OCCASION_NORMALIZE[rawOccasion] ?? (rawOccasion || undefined);

  return { colorIntensity, formalityLevel, styleExperimental, occasionType };
}

// ID sintético para outfits no guardados (ej: el outfit que se descarta al regenerar)
// El campo outfitId en userInteractions no es una FK validada en Appwrite,
// así que cualquier string es válido — lo que importa son las features, no el ID.
export function syntheticOutfitId(): string {
  return `unsaved_${Date.now()}`;
}

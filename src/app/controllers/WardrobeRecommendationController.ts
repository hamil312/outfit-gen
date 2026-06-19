import { storeSearchRepository, StoreProduct } from "../repositories/StoreSearchRepository";

const FLASK = process.env.NEXT_PUBLIC_FLASK_API_URL ?? "http://localhost:5000";

export interface WardrobeAnalysis {
  total: number;
  category_counts: Record<string, number>;
  occasion_slot_coverage: Record<string, {
    can_make_outfit: boolean;
    missing_slots: string[];
    counts: Record<string, number>;
  }>;
  color_distribution:    Record<string, number>;
  occasion_distribution: Record<string, number>;
  material_distribution: Record<string, number>;
  style_distribution:    Record<string, number>;
  gaps: Array<{ slot: string; severity: string }>;
}

export interface ItemRecommendation {
  category:    string;
  search_term: string;
  color:       string;
  occasion:    string;
  style:       string;
  reason:      string;
  slot_count:  number;
}

export type Gender = "male" | "female";

export interface StoreLink {
  store: string;
  url:   string;
  icon?: string;
}

export interface StoreSearchResult {
  products:    StoreProduct[];
  store_links: StoreLink[];
}

export const wardrobeRecommendationController = {
  async analyzeWardrobe(clothes: any[]): Promise<WardrobeAnalysis> {
    const res = await fetch(`${FLASK}/analyze-wardrobe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clothes }),
    });
    if (!res.ok) throw new Error("Error en análisis de guardarropa");
    return res.json();
  },

  async getRecommendations(clothes: any[], profile: any, gender: Gender): Promise<ItemRecommendation[]> {
    const res = await fetch(`${FLASK}/recommend-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clothes, profile, gender }),
    });
    if (!res.ok) throw new Error("Error al obtener recomendaciones");
    const data = await res.json();
    return data.recommendations as ItemRecommendation[];
  },

  async searchStore(rec: ItemRecommendation, gender: Gender): Promise<StoreSearchResult> {
    const specKey = `${gender}-${rec.category}-${rec.color}-${rec.occasion}`;

    const cached = await storeSearchRepository.getCached(specKey);
    if (cached) return cached;

    const res = await fetch(`${FLASK}/search-store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        search_term: rec.search_term,
        color:       rec.color,
        slot:        rec.category,
        occasion:    rec.occasion,
        gender,
      }),
    });
    if (!res.ok) return { products: [], store_links: [] };
    const data = await res.json();
    const products: StoreProduct[] = data.products ?? [];
    const store_links: StoreLink[] = data.store_links ?? [];

    // Solo cacheamos slots con productos reales; los slots sin catálogo
    // (inferior, o completo en hombres) se resuelven siempre en vivo para
    // mantener los links de tienda frescos y evitar cachear fallos de la API.
    if (products.length > 0) {
      storeSearchRepository.storeCache(specKey, { products, store_links }).catch(() => {});
    }
    return { products, store_links };
  },
};

import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB_ID    = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const CACHE_COL = process.env.NEXT_PUBLIC_APPWRITE_STORE_CACHE_COL_ID ?? "storeSearchCache";
const TTL_MS   = 24 * 60 * 60 * 1000; // 24 horas

export interface StoreProduct {
  name:   string;
  price:  string;
  brand?: string;
  rating?: number;
  url:    string;
  image:  string;
}

// Resultado completo que se cachea (productos + links a tiendas)
export interface CachedStoreResult {
  products:    StoreProduct[];
  store_links: { store: string; url: string }[];
}

export const storeSearchRepository = {
  async getCached(specKey: string): Promise<CachedStoreResult | null> {
    try {
      const res = await databases.listDocuments(DB_ID, CACHE_COL, [
        Query.equal("specKey", specKey),
        Query.limit(1),
      ]);
      if (res.documents.length === 0) return null;
      const doc = res.documents[0];
      if (new Date(doc.expiresAt) < new Date()) {
        databases.deleteDocument(DB_ID, CACHE_COL, doc.$id).catch(() => {});
        return null;
      }
      const parsed = JSON.parse(doc.results);
      // Compatibilidad: docs antiguos guardaban solo un array de productos
      if (Array.isArray(parsed)) {
        return { products: parsed as StoreProduct[], store_links: [] };
      }
      return {
        products:    parsed.products ?? [],
        store_links: parsed.store_links ?? [],
      };
    } catch {
      return null;
    }
  },

  async storeCache(specKey: string, result: CachedStoreResult): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
      const existing  = await databases.listDocuments(DB_ID, CACHE_COL, [
        Query.equal("specKey", specKey),
        Query.limit(1),
      ]);
      if (existing.documents.length > 0) {
        await databases.deleteDocument(DB_ID, CACHE_COL, existing.documents[0].$id);
      }
      await databases.createDocument(DB_ID, CACHE_COL, ID.unique(), {
        specKey,
        results:   JSON.stringify(result),
        expiresAt,
      });
    } catch (err) {
      console.error("StoreSearchRepository.storeCache:", err);
    }
  },
};

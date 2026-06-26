import { clothingRepository } from "@/app/repositories/ClothingRepository";
import { account } from "@/lib/appwrite";
import { FLASK_API_URL } from "@/lib/config";
import { profileController } from "@/app/controllers/ProfileController";

// Mismo shape que ClothingController usa para /generate-outfits.
const normalize = (item: any) => ({
  $id: item.$id,
  id: item.$id,
  image: item.image,
  type: item.type,
  color: item.color,
  occasion: item.occasion?.toLowerCase() || "neutral",
  style: item.style?.toLowerCase() || "unknown",
  material: item.material?.toLowerCase() || "unknown",
  print: item.print?.toLowerCase() || "solid",
});

export interface TripDayWeather {
  temp: number;
  temp_min?: number | null;
  temp_max?: number | null;
  condition: string;
  temp_zone: string;
  season: string;
  estimated: boolean;
}

export interface TripDay {
  date: string;
  weather: TripDayWeather;
  outfit: any | null;
  reused: boolean;
}

export interface TripPlan {
  destination: { name: string | null; country: string | null; lat: number | null; lon: number | null };
  start_date: string;
  days: TripDay[];
  packing_list: any[];
  warnings: string[];
}

export interface TripParams {
  destination: string;
  startDate: string;   // ISO yyyy-mm-dd
  days: number;
  occasion?: string;
  lightPacking?: boolean;
}

export const tripController = {
  async generateTrip(params: TripParams): Promise<TripPlan> {
    const user = await account.get();
    const userClothes = await clothingRepository.getClothingsByUser(user.$id);
    const items = userClothes.map(normalize);

    let profile: any = null;
    try {
      profile = await profileController.getProfile(user.$id);
    } catch { /* sin perfil aún */ }

    const body: any = {
      destination: params.destination,
      start_date: params.startDate,
      days: params.days,
      occasion: params.occasion || "",
      light_packing: params.lightPacking ?? false,
      items,
    };
    if (profile) body.profile = profile;

    const res = await fetch(`${FLASK_API_URL}/generate-trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "No se pudo planificar el viaje.");
    }
    return data as TripPlan;
  },
};

import { account } from "@/lib/appwrite";

// Misma estructura que usa src/app/calendar/page.tsx (persistida en localStorage).
export interface CalendarEntry {
  outfitId: string;
  outfitName: string;
  tag: string;
  clothes: any[];
  occasion?: string;
}

type CalendarData = Record<string, CalendarEntry>;

const keyFor = (userId: string) => `pickurfit_cal_${userId}`;

const read = (userId: string): CalendarData => {
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId)) || "{}");
  } catch {
    return {};
  }
};

const write = (userId: string, data: CalendarData) => {
  localStorage.setItem(keyFor(userId), JSON.stringify(data));
};

export const calendarController = {
  /** Asigna un outfit a una fecha (dateKey en formato YYYY-MM-DD). */
  async addEntry(dateKey: string, entry: CalendarEntry) {
    const user = await account.get();
    const data = read(user.$id);
    data[dateKey] = entry;
    write(user.$id, data);
  },
};

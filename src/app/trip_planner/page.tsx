"use client";
import React, { useState, useEffect } from "react";
import AppNavbar from "../components/ui/Navbar";
import Footer from "@/app/components/ui/Footer";
import ProtectedRoute from "../components/ui/ProtectedRoute";
import { BsSuitcase2, BsStars, BsExclamationTriangle, BsBookmark, BsCalendarPlus, BsCheckLg } from "react-icons/bs";
import { tripController, TripPlan, TripDay } from "../controllers/TripController";
import { outfitController } from "../controllers/OutfitController";
import { calendarController } from "../controllers/CalendarController";
import { profileController } from "../controllers/ProfileController";
import { extractOutfitFeatures } from "@/lib/OutfitFeatures";
import { account } from "@/lib/appwrite";

const imgUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

const OutfitImage = ({ fileId, alt }: { fileId?: string; alt?: string }) =>
  fileId ? <img src={imgUrl(fileId)} alt={`Imagen de prenda: ${alt || "prenda"}`} className="trip-item-img" /> : null;

const OCCASIONS = [
  { value: "", label: "Cualquiera" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "sport", label: "Deporte" },
  { value: "informal", label: "Informal" },
];

const CONDITION_LABELS: Record<string, string> = {
  clear: "Despejado", clouds: "Nublado", rain: "Lluvia", drizzle: "Llovizna",
  thunderstorm: "Tormenta", snow: "Nieve", mist: "Neblina", fog: "Niebla",
};

const ZONE_LABELS: Record<string, string> = {
  freezing: "Helado", cold: "Frío", cool: "Fresco", mild: "Templado", warm: "Cálido", hot: "Caluroso",
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "long", day: "numeric", month: "long",
    });
  } catch { return iso; }
};

const today = () => new Date().toISOString().split("T")[0];

const occasionOf = (outfit: any): string =>
  outfit?.superior?.occasion || outfit?.inferior?.occasion ||
  outfit?.calzado?.occasion || outfit?.completo?.occasion || "informal";

const clothesOf = (outfit: any): any[] =>
  outfit?.completo
    ? [outfit.completo, outfit.calzado].filter(Boolean)
    : [outfit?.superior, outfit?.inferior, outfit?.calzado].filter(Boolean);

export default function TripPlanner() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate]     = useState(today());
  const [days, setDays]               = useState(3);
  const [occasion, setOccasion]       = useState("");
  const [lightPacking, setLightPacking] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [plan, setPlan]               = useState<TripPlan | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const [userId, setUserId]           = useState("");
  const [savedIds, setSavedIds]       = useState<Record<number, string>>({});
  const [calendarDays, setCalendarDays] = useState<Record<number, boolean>>({});
  const [busyDay, setBusyDay]         = useState<number | null>(null);
  const [bulkBusy, setBulkBusy]       = useState(false);
  const [toast, setToast]             = useState<string | null>(null);

  useEffect(() => {
    account.get().then(u => setUserId(u.$id)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const tripDestName = () => plan?.destination?.name || destination || "Viaje";

  const handleGenerate = async () => {
    if (!destination.trim()) { setError("Ingresa un destino."); return; }
    setError(null);
    setLoading(true);
    setPlan(null);
    setSavedIds({});
    setCalendarDays({});
    try {
      const result = await tripController.generateTrip({
        destination: destination.trim(),
        startDate,
        days,
        occasion,
        lightPacking,
      });
      setPlan(result);
    } catch (e: any) {
      setError(e?.message || "No se pudo planificar el viaje.");
    } finally {
      setLoading(false);
    }
  };

  // Guarda el outfit del día (una sola vez) y devuelve su $id en Appwrite.
  const ensureSaved = async (idx: number, day: TripDay): Promise<string | null> => {
    if (savedIds[idx]) return savedIds[idx];
    if (!day.outfit) return null;
    const name = `${tripDestName()} — Día ${idx + 1}`;
    const savedDoc: any = await outfitController.saveOutfit(day.outfit, name);
    const id = savedDoc?.$id;
    if (id) {
      setSavedIds(prev => ({ ...prev, [idx]: id }));
      if (userId) {
        profileController.recordInteraction(
          userId, id, "saved", extractOutfitFeatures(day.outfit)
        ).catch(console.error);
      }
    }
    return id || null;
  };

  const handleSaveDay = async (idx: number, day: TripDay) => {
    setBusyDay(idx);
    try {
      await ensureSaved(idx, day);
      setToast("Atuendo guardado");
    } catch {
      setToast("No se pudo guardar el atuendo");
    } finally {
      setBusyDay(null);
    }
  };

  const addDayToCalendar = async (idx: number, day: TripDay) => {
    const id = await ensureSaved(idx, day);
    if (!id || !day.outfit) return;
    const alreadyScheduled = calendarDays[idx];
    await calendarController.addEntry(day.date, {
      outfitId: id,
      outfitName: `${tripDestName()} — Día ${idx + 1}`,
      tag: `Viaje a ${tripDestName()}`,
      clothes: clothesOf(day.outfit),
      occasion: occasionOf(day.outfit),
    });
    if (!alreadyScheduled) {
      setCalendarDays(prev => ({ ...prev, [idx]: true }));
      // Agendar un outfit para una fecha real es un compromiso fuerte:
      // cuenta como interacción positiva para el refinamiento de perfil.
      if (userId) {
        profileController.recordInteraction(
          userId, id, "saved", extractOutfitFeatures(day.outfit)
        ).catch(console.error);
      }
    }
  };

  const handleAddDayToCalendar = async (idx: number, day: TripDay) => {
    setBusyDay(idx);
    try {
      await addDayToCalendar(idx, day);
      setToast(`Añadido al calendario (${formatDate(day.date)})`);
    } catch {
      setToast("No se pudo añadir al calendario");
    } finally {
      setBusyDay(null);
    }
  };

  const handleAddAllToCalendar = async () => {
    if (!plan) return;
    setBulkBusy(true);
    let count = 0;
    try {
      for (let i = 0; i < plan.days.length; i++) {
        const day = plan.days[i];
        if (!day.outfit) continue;
        await addDayToCalendar(i, day);
        count++;
      }
      setToast(`${count} atuendo(s) añadidos al calendario`);
    } catch {
      setToast("No se pudieron añadir todos los días");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppNavbar />
      <div className="trip-page">
        <header className="trip-header">
          <BsSuitcase2 size={30} className="trip-header-icon" />
          <div>
            <h1 className="trip-title">Planificador de viajes</h1>
            <p className="trip-subtitle">
              Genera atuendos para cada día según el clima de tu destino.
            </p>
          </div>
        </header>

        {/* ── Formulario ── */}
        <section className="trip-form">
          <div className="trip-field trip-field--wide">
            <label className="trip-label" htmlFor="trip-dest">Destino</label>
            <input
              id="trip-dest"
              className="trip-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ej. París, Tokio, Bogotá"
            />
          </div>
          <div className="trip-field">
            <label className="trip-label" htmlFor="trip-start">Fecha de inicio</label>
            <input
              id="trip-start"
              className="trip-input"
              type="date"
              value={startDate}
              min={today()}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="trip-field">
            <label className="trip-label" htmlFor="trip-days">Días</label>
            <input
              id="trip-days"
              className="trip-input"
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(14, Number(e.target.value) || 1)))}
            />
          </div>
          <div className="trip-field">
            <label className="trip-label" htmlFor="trip-occ">Contexto</label>
            <select
              id="trip-occ"
              className="trip-input"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            >
              {OCCASIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="trip-field trip-field--check">
            <label className="trip-check">
              <input
                type="checkbox"
                checked={lightPacking}
                onChange={(e) => setLightPacking(e.target.checked)}
              />
              <span>Maleta ligera</span>
            </label>
          </div>
          <button className="trip-generate-btn" onClick={handleGenerate} disabled={loading}>
            <BsStars size={18} />
            {loading ? "Planificando..." : "Generar plan"}
          </button>
        </section>

        {error && <div className="trip-error">{error}</div>}

        {/* ── Resultados ── */}
        {plan && (
          <section className="trip-results">
            <div className="trip-results-head">
              <h2 className="trip-results-title">
                {plan.destination?.name || destination}
                {plan.destination?.country ? `, ${plan.destination.country}` : ""}
              </h2>
              <div className="trip-results-actions">
                <span className="trip-results-meta">{plan.days.length} día(s)</span>
                {plan.days.some((d) => d.outfit) && (
                  <button
                    className="trip-bulk-btn"
                    onClick={handleAddAllToCalendar}
                    disabled={bulkBusy}
                  >
                    <BsCalendarPlus size={15} />
                    {bulkBusy ? "Añadiendo..." : "Añadir todo al calendario"}
                  </button>
                )}
              </div>
            </div>

            {plan.warnings?.length > 0 && (
              <div className="trip-warnings">
                {plan.warnings.map((w, i) => (
                  <p key={i} className="trip-warning">
                    <BsExclamationTriangle size={14} /> {w}
                  </p>
                ))}
              </div>
            )}

            {/* Tarjetas por día */}
            <div className="trip-days-grid">
              {plan.days.map((d, i) => (
                <div key={i} className="trip-day-card">
                  <div className="trip-day-head">
                    <span className="trip-day-num">Día {i + 1}</span>
                    <span className="trip-day-date">{formatDate(d.date)}</span>
                  </div>
                  <div className="trip-weather">
                    <span className="trip-weather-temp">{Math.round(d.weather.temp)}°C</span>
                    <span className="trip-weather-cond">
                      {CONDITION_LABELS[d.weather.condition] || d.weather.condition}
                      {" · "}
                      {ZONE_LABELS[d.weather.temp_zone] || d.weather.temp_zone}
                    </span>
                    {d.weather.estimated && <span className="trip-weather-est">estimado</span>}
                  </div>

                  {d.outfit ? (
                    <div className="trip-outfit">
                      {d.outfit.completo ? (
                        <>
                          <OutfitImage fileId={d.outfit.completo?.image} alt={d.outfit.completo?.type} />
                          <OutfitImage fileId={d.outfit.calzado?.image} alt={d.outfit.calzado?.type} />
                        </>
                      ) : (
                        <>
                          <OutfitImage fileId={d.outfit.superior?.image} alt={d.outfit.superior?.type} />
                          <OutfitImage fileId={d.outfit.inferior?.image} alt={d.outfit.inferior?.type} />
                          <OutfitImage fileId={d.outfit.calzado?.image} alt={d.outfit.calzado?.type} />
                        </>
                      )}
                      {d.reused && <span className="trip-reused-tag">prenda repetida</span>}
                    </div>
                  ) : (
                    <p className="trip-no-outfit">Sin outfit disponible</p>
                  )}

                  {d.outfit && (
                    <div className="trip-day-actions">
                      <button
                        className="trip-day-btn"
                        onClick={() => handleSaveDay(i, d)}
                        disabled={busyDay === i}
                      >
                        {savedIds[i] ? <BsCheckLg size={13} /> : <BsBookmark size={13} />}
                        {savedIds[i] ? "Guardado" : "Guardar"}
                      </button>
                      <button
                        className="trip-day-btn trip-day-btn--cal"
                        onClick={() => handleAddDayToCalendar(i, d)}
                        disabled={busyDay === i}
                      >
                        {calendarDays[i] ? <BsCheckLg size={13} /> : <BsCalendarPlus size={13} />}
                        {calendarDays[i] ? "En calendario" : "Calendario"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Lista de equipaje */}
            {plan.packing_list?.length > 0 && (
              <div className="trip-packing">
                <h3 className="trip-packing-title">
                  <BsSuitcase2 size={18} /> Lista de equipaje ({plan.packing_list.length} prendas)
                </h3>
                <div className="trip-packing-grid">
                  {plan.packing_list.map((it, i) => (
                    <div key={i} className="trip-packing-item">
                      <OutfitImage fileId={it.image} alt={it.type} />
                      <span className="trip-packing-type">{it.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {toast && <div className="trip-toast">{toast}</div>}
      </div>
      <Footer />
    </ProtectedRoute>
  );
}

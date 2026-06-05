"use client";
import React, { useState, useEffect, useMemo } from "react";
import AppNavbar from "@/app/components/ui/Navbar";
import Footer from "@/app/components/ui/Footer";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { clothingController } from "@/app/controllers/ClothingController";
import { outfitController } from "@/app/controllers/OutfitController";
import { profileController } from "@/app/controllers/ProfileController";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { BsStars, BsCalendar3, BsActivity } from "react-icons/bs";
import { IoShirtOutline } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";

const DB_ID   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const INT_COL = "userInteractions";

// ── Color → hex (debe coincidir con el mapeo del Flask) ──
const COLOR_HEX: Record<string, string> = {
  black: "#1a1a1a",  white: "#e5e7eb",  gray: "#9ca3af",   beige: "#d4c5a9",
  red:   "#dc2626",  orange: "#f97316", yellow: "#eab308", pink: "#ec4899",
  green: "#16a34a",  blue: "#2563eb",   navy: "#1e3a5f",   purple: "#9333ea",
  brown: "#92400e",  neutral: "#c4c9d4",
};

const OCCASION_ES: Record<string, string> = {
  formal: "Formal", casual: "Casual", sport: "Deporte",
  informal: "Informal", neutral: "Neutro", work: "Trabajo",
  party: "Fiesta", beach: "Playa", travel: "Viaje", date: "Cita",
};

const PIE_COLORS = ["#1a2b32", "#5ca2ae", "#8ecad3", "#d4a97a", "#b8dde2", "#e6c99c"];

// Devuelve el índice de semana (0 = más antigua, 3 = esta semana)
function weekIdx(ts: string): number {
  const days = (Date.now() - new Date(ts).getTime()) / 86_400_000;
  if (days < 7)  return 3;
  if (days < 14) return 2;
  if (days < 21) return 1;
  if (days < 30) return 0;
  return -1;
}

// Tooltip personalizado para el radar
const RadarTooltipContent = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      <span className="dash-tooltip-val">{payload[0].value}%</span>
    </div>
  );
};

// Tooltip personalizado para barras / pie
const SimpleTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      {label && <p className="dash-tooltip-label">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="dash-tooltip-row" style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [loading, setLoading]           = useState(true);
  const [userId, setUserId]             = useState("");
  const [profile, setProfile]           = useState<any>(null);
  const [clothes, setClothes]           = useState<any[]>([]);
  const [outfits, setOutfits]           = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [usedPercent, setUsedPercent]   = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);

        const [profileData, clothesData, outfitsData, intRes] = await Promise.all([
          profileController.getProfile(user.$id),
          clothingController.getUserClothes(),
          outfitController.getUserOutfits(),
          databases.listDocuments(DB_ID, INT_COL, [
            Query.equal("userId", user.$id),
            Query.orderDesc("timestamp"),
            Query.limit(200),
          ]),
        ]);

        setProfile(profileData);
        setClothes(clothesData || []);
        setOutfits(outfitsData || []);
        setInteractions(intRes.documents || []);

        // Estadísticas del calendario (localStorage)
        const raw = localStorage.getItem(`pickurfit_cal_${user.$id}`);
        if (raw) {
          const calData = JSON.parse(raw);
          const now = new Date();
          const ym  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
          const monthEntries = Object.entries(calData).filter(([k]) => k.startsWith(ym));
          setScheduledCount(monthEntries.length);

          const usedIds = new Set<string>();
          monthEntries.forEach(([, entry]: [string, any]) => {
            (entry.clothes || []).forEach((c: any) => { if (c?.$id) usedIds.add(c.$id); });
          });
          const total = clothesData?.length || 0;
          setUsedPercent(total > 0 ? Math.round((usedIds.size / total) * 100) : 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Datos derivados ──────────────────────────────────────────────────────────

  const radarData = useMemo(() => [
    { subject: "Identidad",  value: Math.round(((profile?.coord_identity          ?? 0.5)) * 100) },
    { subject: "Riesgo",     value: Math.round(((profile?.coord_risk              ?? 0.5)) * 100) },
    { subject: "Tendencias", value: Math.round(((profile?.coord_trendOrientation  ?? 0.5)) * 100) },
    { subject: "Formalidad", value: Math.round(((profile?.coord_formality         ?? 0.5)) * 100) },
  ], [profile]);

  const weeklyData = useMemo(() => {
    const bins = [
      { label: "Sem 1", positivos: 0, negativos: 0 },
      { label: "Sem 2", positivos: 0, negativos: 0 },
      { label: "Sem 3", positivos: 0, negativos: 0 },
      { label: "Esta sem", positivos: 0, negativos: 0 },
    ];
    interactions.forEach(i => {
      const idx = weekIdx(i.timestamp);
      if (idx < 0) return;
      const pos = ["saved", "liked", "published"].includes(i.action);
      if (pos) bins[idx].positivos++; else bins[idx].negativos++;
    });
    return bins;
  }, [interactions]);

  const colorData = useMemo(() => {
    const counts: Record<string, number> = {};
    clothes.forEach(c => {
      const col = (c.color || "neutral").toLowerCase().trim();
      if (col && col !== "desconocido") counts[col] = (counts[col] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([color, count]) => ({
        color,
        count,
        label: color.charAt(0).toUpperCase() + color.slice(1),
        fill:  COLOR_HEX[color] || "#9ca3af",
      }));
  }, [clothes]);

  const occasionData = useMemo(() => {
    const counts: Record<string, number> = {};
    // Sumar desde prendas y outfits
    [...clothes, ...outfits].forEach(item => {
      const occ = (item.occasion || "neutral").toLowerCase().trim();
      if (occ && occ !== "desconocido") counts[occ] = (counts[occ] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, value]) => ({
        name: OCCASION_ES[key] || (key.charAt(0).toUpperCase() + key.slice(1)),
        value,
      }));
  }, [clothes, outfits]);

  // ── Stats cards ──────────────────────────────────────────────────────────────
  const statCards = [
    { label: "Total prendas",          value: clothes.length,   icon: <IoShirtOutline size={20} />, accent: "#1a2b32" },
    { label: "Outfits guardados",      value: outfits.length,   icon: <FaHeart size={17} />,        accent: "#5ca2ae" },
    { label: "Programados este mes",   value: scheduledCount,   icon: <BsCalendar3 size={18} />,    accent: "#8ecad3" },
    { label: "Prendas usadas (mes)",   value: `${usedPercent}%`,icon: <BsActivity size={18} />,     accent: "#d4a97a" },
  ];

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="dash-root">
          <AppNavbar />
          <main className="dash-main">
            <div className="dash-loading-wrap">
              <div className="gen-spinner" />
              <p className="dash-loading-text">Cargando tu resumen…</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="dash-root">
        <AppNavbar />

        <main className="dash-main">
          <div className="dash-inner">

            {/* ── Header ── */}
            <div className="dash-header">
              <div className="dash-header-icon"><BsStars size={20} /></div>
              <div>
                <h1 className="dash-title">Mi Resumen</h1>
                <p className="dash-subtitle">
                  Evolución de tu estilo y estado de tu guardarropa
                </p>
              </div>
            </div>

            {/* ── Fila 1: Radar + Actividad 30 días ── */}
            <div className="dash-grid-2">

              {/* Radar de perfil */}
              <div className="dash-card">
                <div className="dash-card-head">
                  <h2 className="dash-card-title">Perfil de estilo</h2>
                  <p className="dash-card-sub">
                    {profile?.quizCompleted
                      ? `v${profile.profileVersion || 1} · ${profile.interactionsCount || 0} interacciones registradas`
                      : "Completa el quiz de onboarding para ver tu perfil personalizado"}
                  </p>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{ top: 16, right: 24, bottom: 8, left: 24 }}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 13, fontFamily: "Hanken Grotesk", fill: "#374151", fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickCount={4}
                      axisLine={false}
                    />
                    <Radar
                      name="Estilo"
                      dataKey="value"
                      stroke="#5ca2ae"
                      fill="#5ca2ae"
                      fillOpacity={0.28}
                      strokeWidth={2.5}
                      dot={{ fill: "#5ca2ae", r: 3 }}
                    />
                    <Tooltip content={<RadarTooltipContent />} />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Mini-leyenda con valores */}
                <div className="dash-radar-legend">
                  {radarData.map(d => (
                    <div key={d.subject} className="dash-radar-item">
                      <span className="dash-radar-dot" />
                      <span className="dash-radar-label">{d.subject}</span>
                      <span className="dash-radar-pct">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actividad últimas 4 semanas */}
              <div className="dash-card">
                <div className="dash-card-head">
                  <h2 className="dash-card-title">Evolución — últimas 4 semanas</h2>
                  <p className="dash-card-sub">
                    Outfits guardados vs. regenerados: ¿mejora la IA tu estilo?
                  </p>
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fontFamily: "Hanken Grotesk", fill: "#6b7280" }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontFamily: "Hanken Grotesk", fill: "#9ca3af" }}
                      axisLine={false} tickLine={false} allowDecimals={false}
                    />
                    <Tooltip content={<SimpleTooltip />} />
                    <Legend
                      iconType="circle" iconSize={8}
                      wrapperStyle={{ fontSize: 12, fontFamily: "Hanken Grotesk", paddingTop: 12 }}
                    />
                    <Bar dataKey="positivos" name="Guardados / Likes" fill="#5ca2ae" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="negativos" name="Regenerados"        fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {interactions.length === 0 && (
                  <p className="dash-hint">
                    Aún sin interacciones. ¡Genera y guarda outfits para ver tu evolución!
                  </p>
                )}

                {/* Resumen de tendencia */}
                {interactions.length > 0 && (() => {
                  const last = weeklyData[3];
                  const prev = weeklyData[2];
                  const trend = (last.positivos + last.negativos) > 0
                    ? Math.round((last.positivos / (last.positivos + last.negativos)) * 100)
                    : null;
                  const prevTrend = (prev.positivos + prev.negativos) > 0
                    ? Math.round((prev.positivos / (prev.positivos + prev.negativos)) * 100)
                    : null;
                  return (
                    <div className="dash-trend-row">
                      {trend !== null && (
                        <div className="dash-trend-chip">
                          <span>Esta semana</span>
                          <strong style={{ color: trend >= 50 ? "#16a34a" : "#dc2626" }}>
                            {trend}% aprobados
                          </strong>
                        </div>
                      )}
                      {prevTrend !== null && (
                        <div className="dash-trend-chip">
                          <span>Semana anterior</span>
                          <strong style={{ color: prevTrend >= 50 ? "#16a34a" : "#dc2626" }}>
                            {prevTrend}% aprobados
                          </strong>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── Fila 2: Tarjetas resumen ── */}
            <div className="dash-stats-row">
              {statCards.map((card, i) => (
                <div key={i} className="dash-stat-card">
                  <div
                    className="dash-stat-icon"
                    style={{ background: `${card.accent}18`, color: card.accent }}
                  >
                    {card.icon}
                  </div>
                  <div className="dash-stat-body">
                    <p className="dash-stat-value">{card.value}</p>
                    <p className="dash-stat-label">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Fila 3: Colores + Contextos ── */}
            <div className="dash-grid-2">

              {/* Bar chart colores */}
              <div className="dash-card">
                <div className="dash-card-head">
                  <h2 className="dash-card-title">Colores en tu guardarropa</h2>
                  <p className="dash-card-sub">Prendas agrupadas por color predominante</p>
                </div>

                {colorData.length === 0 ? (
                  <div className="dash-empty">
                    <IoShirtOutline size={34} color="#9ca3af" />
                    <p>Agrega prendas para ver tus colores favoritos</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(colorData.length * 36, 160)}>
                    <BarChart
                      data={colorData}
                      layout="vertical"
                      margin={{ top: 4, right: 28, bottom: 4, left: 12 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fontFamily: "Hanken Grotesk", fill: "#9ca3af" }}
                        axisLine={false} tickLine={false} allowDecimals={false}
                      />
                      <YAxis
                        type="category" dataKey="label" width={72}
                        tick={{ fontSize: 12, fontFamily: "Hanken Grotesk", fill: "#374151" }}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<SimpleTooltip />} />
                      <Bar dataKey="count" name="Prendas" radius={[0, 4, 4, 0]}>
                        {colorData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie chart contextos */}
              <div className="dash-card">
                <div className="dash-card-head">
                  <h2 className="dash-card-title">Contextos más usados</h2>
                  <p className="dash-card-sub">
                    Ocasiones de tus prendas y outfits guardados
                  </p>
                </div>

                {occasionData.length === 0 ? (
                  <div className="dash-empty">
                    <BsCalendar3 size={34} color="#9ca3af" />
                    <p>Guarda outfits para ver tus contextos favoritos</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={occasionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="44%"
                        outerRadius={88}
                        innerRadius={46}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {occasionData.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<SimpleTooltip />} />
                      <Legend
                        iconType="circle" iconSize={9}
                        wrapperStyle={{ fontSize: 12, fontFamily: "Hanken Grotesk", paddingTop: 10 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}

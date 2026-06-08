'use client';
import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import AppNavbar from "@/app/components/ui/Navbar";
import ClothingForm from "@/app/components/ui/ClothingForm";
import ProtectedRoute from "../components/ui/ProtectedRoute";

import { BsGrid3X3Gap, BsStars, BsGraphUp, BsShop } from 'react-icons/bs';
import { PiPantsFill, PiSneakerFill } from "react-icons/pi";
import { FaTshirt, FaHeart, FaEdit, FaTrash, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaLightbulb, FaExternalLinkAlt } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { IoShirtOutline } from "react-icons/io5";

import 'bootstrap/dist/css/bootstrap.min.css';

import { Clothing } from "../models/Clothing";
import { mapClothingTypeToSection } from "@/lib/ClothingCategoryMapper";
import { clothingController } from "../controllers/ClothingController";
import { outfitController } from "../controllers/OutfitController";
import { favouriteController } from "../controllers/FavouriteController";
import { useAuth } from "@/app/context/AuthContext";
import { profileController } from "../controllers/ProfileController";
import { extractOutfitFeatures } from "@/lib/OutfitFeatures";
import { wardrobeRecommendationController, WardrobeAnalysis, ItemRecommendation, StoreSearchResult, Gender } from "../controllers/WardrobeRecommendationController";
import WardrobeChatbot from "@/app/components/ui/WardrobeChatbot";

// ─── Análisis inteligente del guardarropa ────────────────────────────────────────────
type InsightSeverity = 'success' | 'warning' | 'alert' | 'tip';
type Insight = { id: string; severity: InsightSeverity; title: string; description: string; metric?: string; };

function analyzeWardrobe(clothes: Clothing[]): Insight[] {
  const insights: Insight[] = [];
  if (clothes.length === 0) {
    insights.push({ id: 'empty', severity: 'tip', title: 'Guardarropa vacío', description: 'Agrega prendas para recibir recomendaciones personalizadas sobre tu estilo.' });
    return insights;
  }

  const sup = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === 'superior');
  const inf = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === 'inferior');
  const cal = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === 'calzado');

  if (cal.length === 0) {
    insights.push({ id: 'no-shoes', severity: 'alert', title: 'Sin calzado registrado', description: 'Sin zapatos no se pueden generar outfits completos. Agrega al menos un par.', metric: '0 pares' });
  } else if (cal.length < 3) {
    insights.push({ id: 'few-shoes', severity: 'warning', title: 'Poco calzado', description: `Tienes ${cal.length} par${cal.length > 1 ? 'es' : ''} de calzado. Más variedad amplía mucho tus opciones de outfit.`, metric: `${cal.length} par${cal.length > 1 ? 'es' : ''}` });
  }

  if (inf.length === 0) {
    insights.push({ id: 'no-lower', severity: 'alert', title: 'Sin prendas inferiores', description: 'No tienes pantalones, faldas ni shorts. Agregar inferiores desbloquea muchas combinaciones.', metric: '0 prendas' });
  }

  if (sup.length > 0 && inf.length > 0) {
    const r = sup.length / inf.length;
    if (r >= 4) insights.push({ id: 'imbalance-up', severity: 'warning', title: 'Muchas prendas superiores', description: `Tienes ${sup.length} superiores y solo ${inf.length} inferior${inf.length > 1 ? 'es' : ''}. Agrega inferiores para más combinaciones.`, metric: `${sup.length} vs ${inf.length}` });
    else if (r <= 0.25) insights.push({ id: 'imbalance-lo', severity: 'warning', title: 'Muchas prendas inferiores', description: `Tienes ${inf.length} inferiores y solo ${sup.length} superior${sup.length > 1 ? 'es' : ''}. Agrega superiores para más combinaciones.`, metric: `${inf.length} vs ${sup.length}` });
  }

  if (sup.length > 0 && inf.length > 0 && cal.length > 0) {
    const r = sup.length / inf.length;
    if (r >= 0.5 && r <= 3) insights.push({ id: 'balanced', severity: 'success', title: 'Estás en balance', description: `Buen equilibrio: ${sup.length} superiores, ${inf.length} inferiores y ${cal.length} calzado.`, metric: 'Equilibrado' });
    const combos = sup.length * inf.length * cal.length;
    if (combos >= 20) insights.push({ id: 'hi-vers', severity: 'success', title: 'Alta versatilidad', description: `Con tu guardarropa puedes armar hasta ${combos} outfits distintos.`, metric: `~${combos} outfits` });
    else if (combos < 6) insights.push({ id: 'lo-vers', severity: 'tip', title: 'Pocas combinaciones posibles', description: `Solo puedes hacer ~${combos} outfits. Agrega prendas en las categorías con menos piezas.`, metric: `~${combos} outfits` });
  }

  const colorMap: Record<string, number> = {};
  clothes.forEach(c => { const col = (c.color || '').toLowerCase().trim(); if (col && col !== 'desconocido') colorMap[col] = (colorMap[col] || 0) + 1; });
  const colorList = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
  if (colorList.length > 0) {
    const [topCol, topN] = colorList[0];
    const pct = topN / clothes.length;
    if (pct >= 0.4 && topN >= 3) insights.push({ id: 'color-overload', severity: 'warning', title: `Muchas prendas ${topCol}`, description: `${topN} de tus ${clothes.length} prendas son ${topCol} (${Math.round(pct * 100)}%). Diversificar colores abre más posibilidades.`, metric: `${Math.round(pct * 100)}% ${topCol}` });
  }
  const uniqueColors = Object.keys(colorMap).length;
  if (uniqueColors >= 5 && clothes.length >= 8 && !(colorList[0] && colorList[0][1] / clothes.length >= 0.4)) {
    insights.push({ id: 'color-diverse', severity: 'success', title: 'Buena diversidad de colores', description: `Tienes ${uniqueColors} colores distintos, lo que te permite crear looks muy variados.`, metric: `${uniqueColors} colores` });
  }

  const NEUTRALS = ['negro', 'blanco', 'gris', 'beige', 'crema', 'navy', 'marrón', 'café', 'black', 'white', 'gray', 'grey', 'brown', 'cream', 'nude', 'ivory'];
  const neutralN = clothes.filter(c => NEUTRALS.some(n => (c.color || '').toLowerCase().includes(n))).length;
  if (clothes.length >= 5) {
    const neutralPct = Math.round((neutralN / clothes.length) * 100);
    if (neutralPct >= 75) insights.push({ id: 'too-neutral', severity: 'tip', title: 'Guardarropa muy neutro', description: `El ${neutralPct}% de tus prendas son colores neutros. Añadir alguna pieza de color le dará más personalidad.`, metric: `${neutralPct}% neutros` });
    else if (neutralPct < 20) insights.push({ id: 'few-neutrals', severity: 'tip', title: 'Pocos colores neutros', description: `Solo el ${neutralPct}% son neutros. Los tonos neutros (negro, blanco, beige) combinan con todo y facilitan crear outfits.`, metric: `${neutralPct}% neutros` });
  }

  if (clothes.length < 6) insights.push({ id: 'small', severity: 'tip', title: 'Guardarropa pequeño', description: 'Con más prendas el generador puede crear outfits mucho más variados y personalizados para ti.', metric: `${clothes.length} prendas` });

  const occMap: Record<string, number> = {};
  clothes.forEach(c => { const o = (c.occasion || '').toLowerCase().trim(); if (o && o !== 'desconocido') occMap[o] = (occMap[o] || 0) + 1; });
  const uniqueOcc = Object.keys(occMap).length;
  if (uniqueOcc === 1) {
    const [onlyOcc] = Object.keys(occMap);
    insights.push({ id: 'single-occ', severity: 'tip', title: 'Un solo tipo de ocasión', description: `Casi todas tus prendas son para "${onlyOcc}". Agregar prendas para otras ocasiones te dará más versatilidad.` });
  } else if (uniqueOcc >= 3) {
    insights.push({ id: 'multi-occ', severity: 'success', title: 'Versátil por ocasión', description: `Tu guardarropa cubre ${uniqueOcc} tipos de ocasión distintos.`, metric: `${uniqueOcc} ocasiones` });
  }

  return insights;
}

const COLOR_HEX: Record<string, string> = {
  black: '#1c1c1c', negro: '#1c1c1c',
  white: '#f0efeb', blanco: '#f0efeb',
  gray: '#9ca3af', grey: '#9ca3af', gris: '#9ca3af',
  blue: '#3b82f6', azul: '#3b82f6',
  'light blue': '#93c5fd', 'azul claro': '#93c5fd',
  navy: '#1e3a5f', 'dark blue': '#1e3a5f',
  red: '#ef4444', rojo: '#ef4444',
  pink: '#f472b6', rosa: '#f472b6',
  purple: '#a855f7', morado: '#a855f7', lila: '#c084fc',
  green: '#22c55e', verde: '#22c55e',
  yellow: '#fbbf24', amarillo: '#fbbf24',
  orange: '#f97316', naranja: '#f97316',
  brown: '#92400e', marron: '#92400e', marrón: '#92400e', café: '#6b3a2a',
  beige: '#d4b896', crema: '#f5e6d3', cream: '#f5e6d3',
  khaki: '#c3b091', nude: '#e8c9a0', ivory: '#fffff0',
};

function computeScore(clothes: Clothing[], sup: Clothing[], inf: Clothing[], cal: Clothing[]): number {
  let s = 0;
  if (sup.length > 0) s += 10;
  if (inf.length > 0) s += 10;
  if (cal.length > 0) s += 10;
  if (sup.length > 0 && inf.length > 0 && cal.length > 0) {
    const r = sup.length / inf.length;
    s += r >= 0.5 && r <= 3 ? 25 : r >= 0.25 && r <= 5 ? 12 : 0;
  } else if ([sup, inf, cal].filter(x => x.length > 0).length === 2) s += 8;
  const combos = sup.length * inf.length * cal.length;
  s += combos >= 30 ? 25 : combos >= 15 ? 18 : combos >= 6 ? 12 : combos >= 1 ? 6 : 0;
  const colorMap: Record<string, number> = {};
  clothes.forEach(c => { const col = (c.color || '').toLowerCase().trim(); if (col && col !== 'desconocido') colorMap[col] = (colorMap[col] || 0) + 1; });
  const u = Object.keys(colorMap).length;
  s += u >= 6 ? 20 : u >= 4 ? 14 : u >= 2 ? 7 : 0;
  return Math.min(100, s);
}

const ScoreRing = ({ score }: { score: number }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? '#2e7d5e' : score >= 45 ? '#b45309' : '#b91c1c';
  return (
    <div className="vw-ip-ring-wrap">
      <svg viewBox="0 0 100 100" width="90" height="90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ece7e0" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)" />
      </svg>
      <div className="vw-ip-ring-inner">
        <span className="vw-ip-ring-n" style={{ color }}>{score}</span>
        <span className="vw-ip-ring-sub">/100</span>
      </div>
    </div>
  );
};

const OCC_LABELS: Record<string, string> = {
  formal: "Formal", informal: "Informal", casual: "Casual", sport: "Deporte",
};
const SLOT_LABELS: Record<string, string> = {
  superior: "Superior", inferior: "Inferior", calzado: "Calzado", completo: "Prenda completa",
};

const WardrobeInsights = ({ clothes }: { clothes: Clothing[] }) => {
  const sup = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === 'superior');
  const inf = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === 'inferior');
  const cal = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === 'calzado');
  const combos = sup.length * inf.length * cal.length;
  const score  = computeScore(clothes, sup, inf, cal);
  const insights = analyzeWardrobe(clothes);

  const [flaskAnalysis, setFlaskAnalysis] = useState<WardrobeAnalysis | null>(null);
  const [flaskLoading, setFlaskLoading]   = useState(false);

  useEffect(() => {
    if (clothes.length === 0) return;
    setFlaskLoading(true);
    wardrobeRecommendationController
      .analyzeWardrobe(clothes)
      .then(setFlaskAnalysis)
      .catch(() => {})
      .finally(() => setFlaskLoading(false));
  }, [clothes]);

  const alerts   = insights.filter(i => i.severity === 'alert' || i.severity === 'warning');
  const successes = insights.filter(i => i.severity === 'success');
  const tips     = insights.filter(i => i.severity === 'tip');

  const colorMap: Record<string, number> = {};
  clothes.forEach(c => { const col = (c.color || '').toLowerCase().trim(); if (col && col !== 'desconocido') colorMap[col] = (colorMap[col] || 0) + 1; });
  const colorList = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const distrib = [
    { label: 'Superiores', count: sup.length, color: '#5ca2ae' },
    { label: 'Inferiores', count: inf.length, color: '#1a2b32' },
    { label: 'Calzado',    count: cal.length, color: '#d4a97a' },
  ];
  const maxCount = Math.max(...distrib.map(d => d.count), 1);
  const scoreLabel = score >= 70 ? 'Excelente' : score >= 45 ? 'En progreso' : 'Necesita atención';
  const scoreColor = score >= 70 ? '#2e7d5e' : score >= 45 ? '#b45309' : '#b91c1c';

  return (
    <div className="vw-ip-root">
      {/* Hero con puntuación */}
      <div className="vw-ip-hero">
        <div className="vw-ip-hero-text">
          <h2 className="vw-ip-title">Análisis inteligente</h2>
          <p className="vw-ip-sub">{clothes.length} prenda{clothes.length !== 1 ? 's' : ''} en tu guardarropa</p>
          <span className="vw-ip-score-badge" style={{ color: scoreColor, borderColor: scoreColor }}>{scoreLabel}</span>
        </div>
        <ScoreRing score={score} />
      </div>

      {/* Distribución + Colores */}
      <div className="vw-ip-grid2">
        <div className="vw-ip-card">
          <p className="vw-ip-card-title">Distribución</p>
          <div className="vw-ip-distrib">
            {distrib.map(({ label, count, color }) => (
              <div key={label} className="vw-ip-bar-row">
                <span className="vw-ip-bar-lbl">{label}</span>
                <div className="vw-ip-bar-track">
                  <div className="vw-ip-bar-fill" style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
                </div>
                <span className="vw-ip-bar-n">{count}</span>
              </div>
            ))}
            <div className="vw-ip-combos">
              <span className="vw-ip-combos-n">{combos}</span>
              <span className="vw-ip-combos-l">combinaciones posibles</span>
            </div>
          </div>
        </div>

        <div className="vw-ip-card">
          <p className="vw-ip-card-title">Paleta de colores</p>
          {colorList.length > 0 ? (
            <div className="vw-ip-palette">
              {colorList.map(([color, count]) => (
                <div key={color} className="vw-ip-color-row">
                  <span className="vw-ip-color-dot" style={{
                    background: COLOR_HEX[color] ?? '#ece7e0',
                    border: (color === 'white' || color === 'blanco' || color === 'ivory') ? '1px solid #d1d5db' : 'none',
                  }} />
                  <span className="vw-ip-color-name">{color}</span>
                  <div className="vw-ip-color-bar-track">
                    <div className="vw-ip-color-bar-fill" style={{ width: `${(count / clothes.length) * 100}%`, background: COLOR_HEX[color] ?? '#9ca3af' }} />
                  </div>
                  <span className="vw-ip-color-n">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="vw-ip-empty">Sin datos de color aún</p>
          )}
        </div>
      </div>

      {/* Aspectos a mejorar */}
      {alerts.length > 0 && (
        <div className="vw-ip-section">
          <div className="vw-ip-section-header vw-ip-section-header--warn">
            <FaExclamationTriangle size={13} />
            <p className="vw-ip-section-title">Aspectos a mejorar</p>
          </div>
          <div className="vw-ip-insight-list">
            {alerts.map(ins => (
              <div key={ins.id} className={`vw-ip-insight vw-ip-insight--${ins.severity}`}>
                <div className="vw-ip-insight-icon">
                  {ins.severity === 'alert' ? <FaExclamationCircle size={15} /> : <FaExclamationTriangle size={15} />}
                </div>
                <div className="vw-ip-insight-content">
                  <p className="vw-ip-insight-title">{ins.title}</p>
                  <p className="vw-ip-insight-desc">{ins.description}</p>
                </div>
                {ins.metric && <span className="vw-ip-insight-metric">{ins.metric}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logros */}
      {successes.length > 0 && (
        <div className="vw-ip-section">
          <div className="vw-ip-section-header vw-ip-section-header--success">
            <FaCheckCircle size={13} />
            <p className="vw-ip-section-title">Logros</p>
          </div>
          <div className="vw-ip-achievements">
            {successes.map(ins => (
              <div key={ins.id} className="vw-ip-achievement">
                <FaCheckCircle size={14} className="vw-ip-achievement-icon" />
                <div>
                  <p className="vw-ip-achievement-title">{ins.title}</p>
                  {ins.metric && <span className="vw-ip-achievement-metric">{ins.metric}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consejos */}
      {tips.length > 0 && (
        <div className="vw-ip-section">
          <div className="vw-ip-section-header vw-ip-section-header--tip">
            <FaLightbulb size={13} />
            <p className="vw-ip-section-title">Consejos</p>
          </div>
          <div className="vw-ip-insight-list">
            {tips.map(ins => (
              <div key={ins.id} className="vw-ip-insight vw-ip-insight--tip">
                <div className="vw-ip-insight-icon"><FaLightbulb size={15} /></div>
                <div className="vw-ip-insight-content">
                  <p className="vw-ip-insight-title">{ins.title}</p>
                  <p className="vw-ip-insight-desc">{ins.description}</p>
                </div>
                {ins.metric && <span className="vw-ip-insight-metric">{ins.metric}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cobertura de slots por ocasión (desde Flask) */}
      <div className="vw-ip-section">
        <div className="vw-ip-section-header vw-ip-section-header--tip">
          <BsGraphUp size={13} />
          <p className="vw-ip-section-title">Cobertura por ocasión</p>
        </div>
        {flaskLoading && (
          <p className="vw-ip-empty" style={{ fontSize: 13, color: '#9ca3af' }}>Analizando…</p>
        )}
        {!flaskLoading && flaskAnalysis && (
          <div className="vw-ip-occasion-grid">
            {Object.entries(flaskAnalysis.occasion_slot_coverage).map(([occ, data]) => (
              <div key={occ} className={`vw-ip-occ-card ${data.can_make_outfit ? 'vw-ip-occ-card--ok' : 'vw-ip-occ-card--miss'}`}>
                <div className="vw-ip-occ-header">
                  {data.can_make_outfit
                    ? <FaCheckCircle size={13} style={{ color: '#2e7d5e' }} />
                    : <FaExclamationCircle size={13} style={{ color: '#b91c1c' }} />}
                  <span className="vw-ip-occ-label">{OCC_LABELS[occ] ?? occ}</span>
                </div>
                <div className="vw-ip-occ-slots">
                  {(["superior", "inferior", "calzado"] as const).map(slot => {
                    const count   = data.counts[slot] ?? 0;
                    const missing = data.missing_slots.includes(slot);
                    return (
                      <span key={slot} className={`vw-ip-slot-chip ${missing ? 'vw-ip-slot-chip--miss' : ''}`}>
                        {SLOT_LABELS[slot]}: {count}
                      </span>
                    );
                  })}
                </div>
                {!data.can_make_outfit && data.missing_slots.length > 0 && (
                  <p className="vw-ip-occ-hint">
                    Faltan: {data.missing_slots.map(s => SLOT_LABELS[s]).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {!flaskLoading && !flaskAnalysis && clothes.length > 0 && (
          <p className="vw-ip-empty" style={{ fontSize: 13, color: '#9ca3af' }}>
            No se pudo conectar con el servidor de análisis.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Recomendaciones personalizadas + búsqueda en tiendas ───────────────────
const SLOT_ES: Record<string, string>  = { superior: "Superior", inferior: "Inferior", calzado: "Calzado", completo: "Completo" };
const COLOR_ES_UI: Record<string, string> = {
  black: "Negro", white: "Blanco", gray: "Gris", navy: "Azul marino",
  blue: "Azul", red: "Rojo", green: "Verde", yellow: "Amarillo",
  orange: "Naranja", pink: "Rosa", purple: "Morado", beige: "Beige",
  brown: "Marrón", neutral: "Neutro",
};
const OCC_ES: Record<string, string> = { formal: "Formal", casual: "Casual", informal: "Informal", sport: "Deportivo" };

interface RecCardProps {
  rec:      ItemRecommendation;
  result:   StoreSearchResult | null;
  searching: boolean;
  onSearch: () => void;
}

const RecCard = ({ rec, result, searching, onSearch }: RecCardProps) => (
  <div className="vw-ip-card" style={{ marginBottom: 16 }}>
    <div className="vw-ip-card-title" style={{ marginBottom: 8 }}>
      {SLOT_ES[rec.category] ?? rec.category}
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
      <span className="vw-ip-slot-chip">{COLOR_ES_UI[rec.color] ?? rec.color}</span>
      <span className="vw-ip-slot-chip">{OCC_ES[rec.occasion] ?? rec.occasion}</span>
    </div>

    <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, marginBottom: 14 }}>{rec.reason}</p>

    {result === null && !searching && (
      <button className="vw-btn vw-btn--primary" onClick={onSearch}>
        <BsShop size={14} style={{ marginRight: 6 }} />
        Buscar en tiendas
      </button>
    )}

    {searching && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="gen-spinner" style={{ width: 18, height: 18 }} />
        <span style={{ fontSize: 13, color: '#6b7280' }}>Buscando productos…</span>
      </div>
    )}

    {result !== null && !searching && (
      <>
        {result.products.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p className="vw-ip-card-title" style={{ fontSize: 12, marginBottom: 4 }}>Sugerencias de estilo</p>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
              Ejemplos visuales de referencia. Para comprar usa los links de abajo.
            </p>
            <div className="vw-rec-products-grid">
              {result.products.map((p, i) => (
                <div key={i} className="vw-rec-product-card">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="vw-rec-product-img"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="vw-rec-product-img-placeholder">
                      <IoShirtOutline size={28} color="#9ca3af" />
                    </div>
                  )}
                  <div className="vw-rec-product-body">
                    {p.brand && (
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {p.brand}
                      </p>
                    )}
                    <p className="vw-rec-product-name">{p.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      {p.price && <p className="vw-rec-product-price" style={{ margin: 0 }}>{p.price}</p>}
                      {!!p.rating && p.rating > 0 && (
                        <span style={{ fontSize: 11, color: '#f59e0b' }}>★ {p.rating}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.store_links.length > 0 && (
          <>
            <p className="vw-ip-card-title" style={{ fontSize: 12, marginBottom: 4 }}>Comprar en tiendas</p>
            {result.products.length === 0 && (
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>
                No hay productos de muestra para esta categoría — busca directamente en las tiendas.
              </p>
            )}
            <div className="vw-rec-store-links">
              {result.store_links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="vw-rec-store-link">
                  <BsShop size={14} />
                  <span>{link.store}</span>
                  <FaExternalLinkAlt size={10} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                </a>
              ))}
            </div>
          </>
        )}
      </>
    )}
  </div>
);

const GENDER_STORAGE_KEY = "pickurfit_rec_gender";

const WardrobeRecommendations = ({ clothes }: { clothes: Clothing[] }) => {
  const { user } = useAuth();
  const [gender, setGender]       = useState<Gender>("male");
  const [recs, setRecs]           = useState<ItemRecommendation[]>([]);
  const [results, setResults]     = useState<Record<number, StoreSearchResult>>({});
  const [searching, setSearching] = useState<Record<number, boolean>>({});
  const [recLoading, setRecLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar el género guardado (solo en cliente)
  useEffect(() => {
    const saved = localStorage.getItem(GENDER_STORAGE_KEY);
    if (saved === "male" || saved === "female") setGender(saved);
  }, []);

  const handleGenderChange = (g: Gender) => {
    if (g === gender) return;
    setGender(g);
    localStorage.setItem(GENDER_STORAGE_KEY, g);
    // El género cambia las recomendaciones y los productos → limpiar resultados
    setResults({});
  };

  // Recalcular recomendaciones cuando cambian las prendas o el género
  useEffect(() => {
    if (!user || clothes.length === 0) return;
    setRecLoading(true);
    setError("");
    setRecs([]);
    setResults({});
    profileController.getProfile(user.$id).then(profile => {
      if (!profile) { setError("Completa el quiz de onboarding para recibir recomendaciones."); return; }
      return wardrobeRecommendationController.getRecommendations(clothes, profile, gender)
        .then(r => setRecs(r));
    }).catch(() => setError("No se pudo conectar con el servidor de análisis."))
      .finally(() => setRecLoading(false));
  }, [user, clothes, gender]);

  const handleSearch = async (idx: number) => {
    const rec = recs[idx];
    if (!rec) return;
    setSearching(prev => ({ ...prev, [idx]: true }));
    try {
      const result = await wardrobeRecommendationController.searchStore(rec, gender);
      setResults(prev => ({ ...prev, [idx]: result }));
    } catch {
      setResults(prev => ({ ...prev, [idx]: { products: [], store_links: [] } }));
    } finally {
      setSearching(prev => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div className="vw-ip-root">
      <div className="vw-ip-hero">
        <div className="vw-ip-hero-text">
          <h2 className="vw-ip-title">Recomendaciones</h2>
          <p className="vw-ip-sub">Prendas que le faltan a tu guardarropa según tu perfil de estilo</p>
        </div>
      </div>

      {/* Selector de género para las recomendaciones */}
      <div className="vw-rec-gender">
        <span className="vw-rec-gender-label">Recomendar prendas de:</span>
        <div className="vw-rec-gender-toggle">
          <button
            className={`vw-rec-gender-btn ${gender === 'male' ? 'vw-rec-gender-btn--active' : ''}`}
            onClick={() => handleGenderChange('male')}
            type="button"
          >
            Hombre
          </button>
          <button
            className={`vw-rec-gender-btn ${gender === 'female' ? 'vw-rec-gender-btn--active' : ''}`}
            onClick={() => handleGenderChange('female')}
            type="button"
          >
            Mujer
          </button>
        </div>
      </div>

      {recLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0' }}>
          <div className="gen-spinner" style={{ width: 20, height: 20 }} />
          <span style={{ fontSize: 14, color: '#6b7280' }}>Analizando tu guardarropa…</span>
        </div>
      )}

      {error && <p style={{ color: '#b91c1c', fontSize: 14 }}>{error}</p>}

      {!recLoading && recs.length === 0 && !error && clothes.length > 0 && (
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Tu guardarropa está bien cubierto en todas las categorías.
        </p>
      )}

      {recs.map((rec, idx) => (
        <RecCard
          key={`${rec.category}-${idx}`}
          rec={rec}
          result={results[idx] ?? null}
          searching={!!searching[idx]}
          onSearch={() => handleSearch(idx)}
        />
      ))}
    </div>
  );
};

// ─── Helper de URL de imagen ─────────────────────────────────────────────────────────
const imgUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

const ClothingCard = ({
  item,
  onDelete,
  onEdit,
}: {
  item: Clothing;
  onDelete: (item: Clothing) => void;
  onEdit: (item: Clothing) => void;
}) => (
  <div className="vw-clothing-card">
    <div className="vw-clothing-img-wrap">
      <img src={imgUrl(item.image ?? '')} alt={`Imagen de prenda: ${item.name}, color: ${item.color}`} className="vw-clothing-img" />
    </div>
    <div className="vw-clothing-body">
      <p className="vw-clothing-name">{item.name}</p>
      <p className="vw-clothing-color">{item.color}</p>
      {item.material && item.material !== "Desconocido" && <p className="vw-clothing-detail">{item.material}</p>}
      {item.print && item.print !== "Desconocido" && <p className="vw-clothing-detail">{item.print}</p>}
      {item.style && item.style !== "Desconocido" && <p className="vw-clothing-detail">{item.style}</p>}
      {item.size && <span className="vw-clothing-size">{item.size}</span>}
      <div className="vw-clothing-actions">
        <button className="vw-btn vw-btn--danger" onClick={() => onDelete(item)}>
          <FaTrash size={12} aria-hidden="true" /> Eliminar
        </button>
        <button className="vw-btn vw-btn--primary" onClick={() => onEdit(item)}>
          <FaEdit size={12} aria-hidden="true" /> Editar
        </button>
      </div>
    </div>
  </div>
);

// ─── Sección de prendas ──────────────────────────────────────────────────────────
const ClothesSection = ({
  title,
  items,
  onDelete,
  onEdit,
}: {
  title: string;
  items: Clothing[];
  onDelete: (item: Clothing) => void;
  onEdit: (item: Clothing) => void;
}) => (
  <section className="vw-section">
    <h2 className="vw-section-title">{title}</h2>
    {items.length > 0 ? (
      <div className="vw-clothes-grid">
        {items.map(item => (
          <ClothingCard key={item.$id} item={item} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    ) : (
      <p className="vw-empty-msg">No hay prendas {title.toLowerCase()} registradas.</p>
    )}
  </section>
);

// ─── Componente central ───────────────────────────────────────────────────────────
const VirtualWardrobe = () => {
  const { user } = useAuth();
  // Estados de la UI para navegar por las secciones.
  const [selectedCategory, setSelectedCategory] = useState('prendas');
  const [selectedSection, setSelectedSection]   = useState('todas');
  const [clothes, setClothes]     = useState<Clothing[]>([]);
  const [outfits, setOutfits]     = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<Clothing | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishOutfitId, setPublishOutfitId] = useState<string | null>(null);
  const [publishName, setPublishName] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const userId = user?.$id ?? "";
  const upperClothes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "superior");
  const lowerClothes = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "inferior");
  const shoes        = clothes.filter(c => typeof c.type === 'string' && mapClothingTypeToSection(c.type) === "calzado");

  useEffect(() => {
    clothingController.getUserClothes().then(setClothes).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await clothingController.getUserClothes();
        setClothes(items);
        if (selectedCategory === "atuendos") {
          const fn = selectedSection === 'favoritos'
            ? outfitController.getFavouriteOutfits
            : outfitController.getUserOutfits;
          setOutfits((await fn()) || []);
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [selectedCategory, selectedSection]);

  // Cerrar modales al presionar Escape.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showForm) setShowForm(false);
        if (publishModalOpen) setPublishModalOpen(false);
        if (showEditModal) setShowEditModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm, publishModalOpen, showEditModal]);

  // Remover una prenda y actualizar el estado local tras su eliminación.
  const handleDelete = async (item: Clothing) => {
    if (!confirm(`¿Eliminar esta prenda (${item.name})?`)) return;
    try {
      await clothingController.deleteClothing(item);
      setClothes(prev => prev.filter(c => c.$id !== item.$id));
    } catch { alert("No se pudo eliminar la prenda."); }
  };

  const handleEdit = (item: Clothing) => { setEditingItem(item); setShowEditModal(true); };

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!confirm("¿Deseas eliminar este atuendo?")) return;
    try {
      const outfit = outfits.find(o => o.$id === outfitId);
      await outfitController.deleteOutfit(outfitId);
      setOutfits(prev => prev.filter(o => o.$id !== outfitId));
      if (outfit && userId) {
        profileController.recordInteraction(
          userId, outfitId, 'discarded', extractOutfitFeatures(outfit)
        ).catch(console.error);
      }
    } catch (error: any) {
      if (error?.message?.includes('No autorizado')) { alert('No tienes permiso.'); return; }
      if (error?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert("No se pudo eliminar el atuendo.");
    }
  };

  const handlePublishClick = (outfitId: string) => {
    const outfit = outfits.find(o => o.$id === outfitId);
    setPublishOutfitId(outfitId);
    setPublishName(outfit?.name || "");
    setPublishDescription(outfit?.description || "");
    setPublishModalOpen(true);
  };

  const handleTogglePublish = async (outfitId: string, currentPublic?: boolean) => {
    if (!currentPublic) {
      handlePublishClick(outfitId);
      return;
    }

    if (!confirm("¿Despublicar?")) return;
    try {
      const updated = await outfitController.publishOutfit(outfitId, false);
      setOutfits(prev => prev.map(o => o.$id === outfitId ? { ...o, ...(updated as any) } : o));
    } catch (error: any) {
      if (error?.message?.includes('No autorizado')) { alert('Sin permiso.'); return; }
      if (error?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert("No se pudo actualizar.");
    }
  };

  const handleConfirmPublish = async () => {
    if (!publishOutfitId) return;
    setPublishLoading(true);

    try {
      const outfit = outfits.find(o => o.$id === publishOutfitId);
      const updated = await outfitController.publishOutfit(publishOutfitId, true, publishDescription, publishName);
      setOutfits(prev => prev.map(o => o.$id === publishOutfitId ? { ...o, ...(updated as any), public: true, description: publishDescription, name: publishName } : o));
      if (outfit && userId) {
        profileController.recordInteraction(
          userId, publishOutfitId, 'published', extractOutfitFeatures(outfit)
        ).catch(console.error);
      }
      setPublishModalOpen(false);
      setPublishOutfitId(null);
      setPublishName("");
      setPublishDescription("");
    } catch (error: any) {
      if (error?.message?.includes('No autorizado')) { alert('Sin permiso.'); return; }
      if (error?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert("No se pudo publicar el atuendo.");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleRemoveFavourite = async (outfitId: string) => {
    setOutfits(prev => prev.filter(o => o.$id !== outfitId));
    try {
      await favouriteController.toggleFavourite(outfitId);
    } catch (err: any) {
      if (err?.message?.includes('Usuario no autenticado')) { window.location.href = '/auth/login'; return; }
      alert('No se pudo quitar de favoritos');
      const favOutfits = await outfitController.getFavouriteOutfits();
      setOutfits(favOutfits || []);
    }
  };

  const handleCategoryClick = (category: string, section: string) => {
    setSelectedCategory(category);
    setSelectedSection(section);
  };

  // ─── Objetos de la sidebar ──────────────────────────────────────────────────────
  const navClothes = [
    { label: 'Todas',      section: 'todas',      icon: <BsGrid3X3Gap size={18} /> },
    { label: 'Superiores', section: 'superiores', icon: <FaTshirt size={18} /> },
    { label: 'Inferiores', section: 'inferiores', icon: <PiPantsFill size={18} /> },
    { label: 'Calzado',    section: 'calzado',    icon: <PiSneakerFill size={18} /> },
  ];
  const navOutfits = [
    { label: 'Planeados',  section: 'todos',      icon: <BsGrid3X3Gap size={18} /> },
    { label: 'Favoritos',  section: 'favoritos',  icon: <FaHeart size={18} /> },
  ];

  // ─── Renderizar contenido para análisis / recomendaciones ───────────────────────
  const renderAnalysis = () => <WardrobeInsights clothes={clothes} />;
  const renderRecommendations = () => <WardrobeRecommendations clothes={clothes} />;

  // ─── Renderizar contenido ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (selectedCategory === 'analisis') return renderAnalysis();
    if (selectedCategory === 'recomendaciones') return renderRecommendations();

    if (selectedCategory === 'prendas') {
      if (selectedSection === 'todas') {
        return (
          <div className="vw-content-sections">
            <ClothesSection title="Superiores" items={upperClothes} onDelete={handleDelete} onEdit={handleEdit} />
            <ClothesSection title="Inferiores" items={lowerClothes} onDelete={handleDelete} onEdit={handleEdit} />
            <ClothesSection title="Calzado"    items={shoes}        onDelete={handleDelete} onEdit={handleEdit} />
          </div>
        );
      }
      const filtered =
        selectedSection === 'superiores' ? upperClothes :
        selectedSection === 'inferiores' ? lowerClothes : shoes;

      return (
        <ClothesSection
          title={selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
          items={filtered}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      );
    }

    // Vista de outfits (tanto favoritos como todos) - muestra los atuendos del usuario o sus favoritos, con opciones para publicar/despublicar, eliminar o quitar de favoritos según corresponda.
    if (outfits.length === 0) {
      return (
        <div className="vw-empty-state">
          <IoShirtOutline className="vw-empty-icon" />
          <p className="vw-empty-text">No hay atuendos aquí todavía.</p>
        </div>
      );
    }

    return (
      <div className="vw-content-sections">
        {outfits.map(outfit => {
          const outfitItems = [outfit.superior, outfit.inferior, outfit.shoes]
            .filter(Boolean)
            .map((id: string) => {
              const fromOutfit = (outfit.clothes || []).find((c: any) => c.$id === id);
              const fromUser   = clothes.find(c => c.$id === id);
              return fromOutfit || fromUser;
            })
            .filter(Boolean);

          return (
            <div key={outfit.$id} className="vw-outfit-block">
              <div className="vw-outfit-header">
                <h3 className="vw-outfit-name">{outfit.name || "Outfit sin nombre"}</h3>
                <div className="vw-outfit-actions">
                  {selectedSection === 'favoritos' && (
                    <button className="vw-btn vw-btn--danger" onClick={() => handleRemoveFavourite(outfit.$id)}>
                      <FaHeart size={13} aria-hidden="true" /> Quitar favorito
                    </button>
                  )}
                  {outfit.userId === userId ? (
                    <>
                      <button
                        className={`vw-btn ${outfit.public ? 'vw-btn--secondary' : 'vw-btn--primary'}`}
                        onClick={() => handleTogglePublish(outfit.$id, outfit.public)}
                      >
                        {outfit.public ? <><FaEyeSlash size={13} aria-hidden="true" /> Despublicar</> : <><FaEye size={13} aria-hidden="true" /> Publicar</>}
                      </button>
                      <button className="vw-btn vw-btn--danger" onClick={() => handleDeleteOutfit(outfit.$id)}>
                        <FaTrash size={13} aria-hidden="true" /> Eliminar
                      </button>
                    </>
                  ) : (
                    <span className="vw-outfit-author">Autor: {outfit.userName || outfit.userId}</span>
                  )}
                </div>
              </div>
              {/*Aquí podemos ver como se muestra el atuendo, el componente alt se genera de forma dinámica*/}
              <div className="vw-outfit-items">
                {outfitItems.map((item: any) => !item ? null : (
                  <div key={item.$id} className="vw-outfit-item">
                    <img
                      src={imgUrl(item.image)}
                      alt={`Prenda del outfit: ${item.type}, color: ${item.color}`}
                      className="vw-outfit-item-img"
                    />
                    <div className="vw-outfit-item-label">
                      <p className="vw-outfit-item-type">{item.type}</p>
                      <p className="vw-outfit-item-color">{item.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className="vw-root">
        <AppNavbar />

        <header className="vw-page-header">
          <h1 className="vw-page-title">Tu guardarropa virtual</h1>
        </header>

        <div className="vw-layout">

          {/* ── Sidebar ── */}
          <aside className="vw-sidebar">

            <p className="vw-sidebar-group-label">Prendas</p>
            {navClothes.map(({ label, section, icon }) => (
              <button
                key={section}
                className={`vw-nav-btn ${selectedCategory === 'prendas' && selectedSection === section ? 'vw-nav-btn--active' : ''}`}
                onClick={() => handleCategoryClick('prendas', section)}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}

            <p className="vw-sidebar-group-label">Atuendos</p>
            {navOutfits.map(({ label, section, icon }) => (
              <button
                key={section}
                className={`vw-nav-btn ${selectedCategory === 'atuendos' && selectedSection === section ? 'vw-nav-btn--active' : ''}`}
                onClick={() => handleCategoryClick('atuendos', section)}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}

            <p className="vw-sidebar-group-label">Inteligencia</p>
            <button
              className={`vw-nav-btn ${selectedCategory === 'analisis' ? 'vw-nav-btn--active' : ''}`}
              onClick={() => handleCategoryClick('analisis', 'overview')}
            >
              <BsGraphUp size={18} />
              <span>Análisis</span>
            </button>
            <button
              className={`vw-nav-btn ${selectedCategory === 'recomendaciones' ? 'vw-nav-btn--active' : ''}`}
              onClick={() => handleCategoryClick('recomendaciones', 'overview')}
            >
              <BsShop size={18} />
              <span>Recomendaciones</span>
            </button>

            <div className="vw-sidebar-actions">
              <button className="vw-sidebar-action-btn vw-sidebar-action-btn--primary" onClick={() => setShowForm(true)}>
                <IoMdAdd size={18} aria-hidden="true" />
                <span>AÑADIR PRENDA</span>
              </button>
              <button className="vw-sidebar-action-btn vw-sidebar-action-btn--outline">
                <BsStars size={18} aria-hidden="true" />
                <span>¿LISTO PARA GENERAR?</span>
              </button>
            </div>

          </aside>

          {/* ── Contenido Principal ── */}
          <main className="vw-main">
            <nav className="vw-breadcrumb">
              <span className="vw-breadcrumb-root">
                {selectedCategory === 'prendas' ? 'TUS PRENDAS'
                  : selectedCategory === 'analisis' || selectedCategory === 'recomendaciones' ? 'GUARDARROPA'
                  : 'TUS ATUENDOS'}
              </span>
              <span className="vw-breadcrumb-sep">/</span>
              <span className="vw-breadcrumb-active">
                {selectedCategory === 'analisis' ? 'ANÁLISIS'
                  : selectedCategory === 'recomendaciones' ? 'RECOMENDACIONES'
                  : selectedSection === 'todas' ? 'TODAS'
                  : selectedSection.toUpperCase()}
              </span>
            </nav>
            {renderContent()}
          </main>

        </div>

        {/* ── Modal para añadir prenda ── */}
        <Modal show={showForm} onHide={() => setShowForm(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Añadir prenda</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ClothingForm
              mode="create"
              onSubmit={async (values, file) => {
                try {
                  const newClothing = await clothingController.addClothing(file!, { ...values, userId });
                  const normalizeDoc = (doc: any): Clothing => ({
                    $id: doc.$id, name: doc.name, color: doc.color, type: doc.type,
                    material: doc.material, size: doc.size, occasion: doc.occasion,
                    image: doc.image, userId: doc.userId,
                  });
                  setClothes(prev => [...prev, normalizeDoc(newClothing)]);
                  setShowForm(false);
                } catch (error) {
                  console.error(error);
                  alert("No se pudo añadir la prenda.");
                }
              }}
            />
          </Modal.Body>
        </Modal>

        {/* ── Modal para publicar atuendo ── */}
        <Modal show={publishModalOpen} onHide={() => setPublishModalOpen(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Publicar atuendo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label htmlFor="publish-name" className="form-label">Nombre del atuendo</label>
              <input
                id="publish-name"
                type="text"
                value={publishName}
                onChange={(e) => setPublishName(e.target.value)}
                placeholder="Nombre del atuendo"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="publish-description" className="form-label">Descripción</label>
              <textarea
                id="publish-description"
                value={publishDescription}
                onChange={(e) => setPublishDescription(e.target.value)}
                placeholder="Descripción del outfit (opcional)"
                className="form-control"
                rows={4}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="vw-btn vw-btn--secondary" onClick={() => setPublishModalOpen(false)} disabled={publishLoading}>
              Cancelar
            </button>
            <button className="vw-btn vw-btn--primary" onClick={handleConfirmPublish} disabled={publishLoading}>
              {publishLoading ? "Publicando..." : "Publicar"}
            </button>
          </Modal.Footer>
        </Modal>

        {/* ── Modal para editar prenda ── */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar prenda</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingItem && (
              <ClothingForm
                initialValues={editingItem}
                mode="edit"
                onSubmit={async (updatedValues) => {
                  try {
                    if (!editingItem?.$id) { alert("Error: prenda sin ID"); return; }
                    const normalizeDoc = (doc: any): Clothing => ({
                      $id: doc.$id, name: doc.name, color: doc.color, type: doc.type,
                      material: doc.material, size: doc.size, occasion: doc.occasion,
                      image: doc.image, userId: doc.userId,
                    });
                    const updatedDoc = await clothingController.updateClothing(editingItem.$id, updatedValues);
                    const updated = normalizeDoc(updatedDoc);
                    setClothes(prev => prev.map(c => c.$id === updated.$id ? updated : c));
                    setShowEditModal(false);
                  } catch {
                    alert("No se pudo actualizar la prenda.");
                  }
                }}
              />
            )}
          </Modal.Body>
        </Modal>

      </div>

      <WardrobeChatbot clothes={clothes} outfits={outfits} />
    </ProtectedRoute>
  );
};

export default VirtualWardrobe;
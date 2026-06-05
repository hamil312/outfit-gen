"use client";
import React, { useState, useEffect, useCallback } from "react";
import AppNavbar from "@/app/components/ui/Navbar";
import Footer from "@/app/components/ui/Footer";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";
import { account } from "@/lib/appwrite";
import { outfitController } from "@/app/controllers/OutfitController";
import { BsChevronLeft, BsChevronRight, BsTag, BsCalendar3 } from "react-icons/bs";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineDragIndicator } from "react-icons/md";

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

const imgUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type CalendarEntry = {
  outfitId: string;
  outfitName: string;
  tag: string;
  clothes: any[];
  occasion?: string;
};

type CalendarData = {
  [dateKey: string]: CalendarEntry;
};

function getMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = (firstDay + 6) % 7;            // shift: Mon=0, …, Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [userId, setUserId] = useState('');
  const [outfits, setOutfits] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Tag modal state
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagModalDay, setTagModalDay] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [pendingEntry, setPendingEntry] = useState<CalendarEntry | null>(null);

  useEffect(() => {
    account.get().then(async (user) => {
      setUserId(user.$id);
      const raw = localStorage.getItem(`pickurfit_cal_${user.$id}`);
      if (raw) {
        try { setCalendarData(JSON.parse(raw)); } catch {}
      }
      const enriched = await outfitController.getUserOutfits();
      setOutfits(enriched || []);
    }).catch(() => {});
  }, []);

  const persist = useCallback((data: CalendarData) => {
    setCalendarData(data);
    if (userId) localStorage.setItem(`pickurfit_cal_${userId}`, JSON.stringify(data));
  }, [userId]);

  const grid = getMonthGrid(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
  };

  // ── Drag & Drop ──
  const onDragStart = (e: React.DragEvent, outfitId: string) => {
    setDraggingId(outfitId);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', outfitId);
  };

  const onDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverDay(day);
  };

  const onDragLeave = () => setDragOverDay(null);

  const onDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    setDragOverDay(null);
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    if (!id) return;
    const outfit = outfits.find(o => o.$id === id);
    if (!outfit) return;

    const existing = calendarData[toDateKey(currentYear, currentMonth, day)];
    const entry: CalendarEntry = {
      outfitId: id,
      outfitName: outfit.name || 'Outfit',
      tag: existing?.tag || '',
      clothes: outfit.clothes || [],
      occasion: outfit.occasion,
    };
    setPendingEntry(entry);
    setTagModalDay(day);
    setTagInput(existing?.tag || '');
    setShowTagModal(true);
    setDraggingId(null);
  };

  const confirmTag = () => {
    if (!pendingEntry || tagModalDay === null) return;
    const key = toDateKey(currentYear, currentMonth, tagModalDay);
    persist({ ...calendarData, [key]: { ...pendingEntry, tag: tagInput.trim() } });
    setShowTagModal(false);
    setPendingEntry(null);
    setTagModalDay(null);
  };

  const removeEntry = (day: number) => {
    const key = toDateKey(currentYear, currentMonth, day);
    const next = { ...calendarData };
    delete next[key];
    persist(next);
  };

  const editTag = (day: number) => {
    const key = toDateKey(currentYear, currentMonth, day);
    const entry = calendarData[key];
    if (!entry) return;
    setPendingEntry(entry);
    setTagModalDay(day);
    setTagInput(entry.tag || '');
    setShowTagModal(true);
  };

  return (
    <ProtectedRoute>
      {/* ── Tag modal ── */}
      {showTagModal && (
        <div
          className="cal-modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setShowTagModal(false); }}
        >
          <div className="cal-modal">
            <h2 className="cal-modal-title">Etiqueta del día</h2>
            <p className="cal-modal-sub">
              Escribe una nota para recordar el evento de este día (opcional)
            </p>
            <input
              className="cal-modal-input"
              type="text"
              placeholder="ej: Salida a cenar, Fiesta de Mario..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmTag()}
              autoFocus
              maxLength={60}
            />
            <div className="cal-modal-actions">
              <button className="cal-modal-cancel" onClick={() => setShowTagModal(false)}>
                Cancelar
              </button>
              <button className="cal-modal-confirm" onClick={confirmTag}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cal-root">
        <AppNavbar />

        <main className="cal-main">
          <div className="cal-inner">

            {/* ── Page header ── */}
            <div className="cal-header">
              <div className="cal-header-icon">
                <BsCalendar3 size={20} />
              </div>
              <div>
                <h1 className="cal-title">Calendario de outfits</h1>
                <p className="cal-subtitle">
                  Arrastra tus atuendos guardados a los días del mes
                </p>
              </div>
            </div>

            <div className="cal-layout">

              {/* ── Sidebar: saved outfits ── */}
              <aside className="cal-sidebar">
                <p className="cal-sidebar-label">Mis atuendos</p>

                {outfits.length === 0 ? (
                  <div className="cal-empty-outfits">
                    <IoShirtOutline size={34} color="#9ca3af" />
                    <p className="cal-empty-text">
                      Guarda atuendos desde el generador para verlos aquí
                    </p>
                  </div>
                ) : (
                  <div className="cal-outfit-list">
                    {outfits.map(outfit => {
                      const firstImg = outfit.clothes?.find((c: any) => c?.image)?.image;
                      return (
                        <div
                          key={outfit.$id}
                          className="cal-outfit-card"
                          draggable
                          onDragStart={e => onDragStart(e, outfit.$id)}
                          title="Arrastra al calendario"
                        >
                          <div className="cal-outfit-drag-handle">
                            <MdOutlineDragIndicator size={14} color="#9ca3af" />
                          </div>
                          <div className="cal-outfit-thumb">
                            {firstImg ? (
                              <img
                                src={imgUrl(firstImg)}
                                alt={outfit.name}
                                className="cal-outfit-img"
                                draggable={false}
                              />
                            ) : (
                              <div className="cal-outfit-no-img">
                                <IoShirtOutline size={18} color="#9ca3af" />
                              </div>
                            )}
                          </div>
                          <div className="cal-outfit-info">
                            <p className="cal-outfit-name">{outfit.name || 'Outfit'}</p>
                            {outfit.occasion && (
                              <span className="cal-outfit-badge">{outfit.occasion}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </aside>

              {/* ── Calendar ── */}
              <div className="cal-calendar">

                {/* Month navigation */}
                <div className="cal-month-nav">
                  <button className="cal-nav-btn" onClick={prevMonth} aria-label="Mes anterior">
                    <BsChevronLeft size={15} />
                  </button>
                  <h2 className="cal-month-label">
                    {MONTHS_ES[currentMonth]} {currentYear}
                  </h2>
                  <button className="cal-nav-btn" onClick={nextMonth} aria-label="Mes siguiente">
                    <BsChevronRight size={15} />
                  </button>
                </div>

                {/* Day-of-week headers */}
                <div className="cal-grid-header">
                  {DAYS_ES.map(d => (
                    <div key={d} className="cal-day-hdr">{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="cal-grid">
                  {grid.map((day, i) => {
                    const key = day ? toDateKey(currentYear, currentMonth, day) : '';
                    const entry = day ? calendarData[key] : undefined;
                    const isToday =
                      day === today.getDate() &&
                      currentMonth === today.getMonth() &&
                      currentYear === today.getFullYear();
                    const isDragOver = dragOverDay === day && day !== null;

                    return (
                      <div
                        key={i}
                        className={[
                          'cal-cell',
                          !day ? 'cal-cell--pad' : '',
                          isToday ? 'cal-cell--today' : '',
                          isDragOver ? 'cal-cell--dragover' : '',
                          entry ? 'cal-cell--has-entry' : '',
                        ].filter(Boolean).join(' ')}
                        onDragOver={day ? e => onDragOver(e, day) : undefined}
                        onDragLeave={day ? onDragLeave : undefined}
                        onDrop={day ? e => onDrop(e, day) : undefined}
                      >
                        {day && (
                          <>
                            <span className={`cal-day-num${isToday ? ' cal-day-num--today' : ''}`}>
                              {day}
                            </span>

                            {entry ? (
                              <div className="cal-entry">
                                {entry.clothes?.[0]?.image && (
                                  <img
                                    src={imgUrl(entry.clothes[0].image)}
                                    alt={entry.outfitName}
                                    className="cal-entry-img"
                                    draggable={false}
                                  />
                                )}
                                <p className="cal-entry-name">{entry.outfitName}</p>
                                {entry.tag && (
                                  <span className="cal-entry-tag" title={entry.tag}>
                                    {entry.tag}
                                  </span>
                                )}
                                <div className="cal-entry-actions">
                                  <button
                                    className="cal-entry-btn cal-entry-btn--edit"
                                    onClick={() => editTag(day)}
                                    title="Editar etiqueta"
                                    aria-label="Editar etiqueta"
                                  >
                                    <BsTag size={9} />
                                  </button>
                                  <button
                                    className="cal-entry-btn cal-entry-btn--remove"
                                    onClick={() => removeEntry(day)}
                                    title="Quitar outfit"
                                    aria-label="Quitar outfit"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="cal-drop-hint">
                                <span className="cal-drop-plus">+</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}

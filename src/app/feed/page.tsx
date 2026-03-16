'use client';
import React, { useEffect, useState, useRef } from 'react';
import AppNavbar from '@/app/components/ui/Navbar';
import { outfitController } from '@/app/controllers/OutfitController';
import { favouriteController } from '@/app/controllers/FavouriteController';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { HiOutlineViewGrid } from 'react-icons/hi';
import { IoGridOutline } from 'react-icons/io5';

const PER_PAGE = 9;

// ─── Types ───────────────────────────────────────────────────────────────────
interface ClothingItem {
  $id: string;
  image: string;
  type: string;
  color: string;
}

interface Outfit {
  $id: string;
  name?: string;
  userId?: string;
  userName?: string;
  liked?: boolean;
  likes?: number;
  clothes?: ClothingItem[];
  $createdAt?: string;
}

// ─── Image URL helper ────────────────────────────────────────────────────────
const getImageUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

// ─── Avatar initials ─────────────────────────────────────────────────────────
const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

// ─── Relative time ───────────────────────────────────────────────────────────
const timeAgo = (dateStr?: string) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
};

// ─── Pastel avatar colors ─────────────────────────────────────────────────────
const avatarPalette = [
  { bg: '#f0e6ff', text: '#7c3aed' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#e0f2fe', text: '#0369a1' },
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#ffe4e6', text: '#be123c' },
  { bg: '#f3e8ff', text: '#9333ea' },
];
const getAvatarColor = (name?: string) => {
  const idx = (name?.charCodeAt(0) ?? 0) % avatarPalette.length;
  return avatarPalette[idx];
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="feed-card-inner">
    <div className="feed-skeleton-avatar" />
    <div className="feed-skeleton-lines">
      <div className="feed-skeleton-line feed-skeleton-line--md" />
      <div className="feed-skeleton-line feed-skeleton-line--sm" />
    </div>
    <div className="feed-skeleton-block feed-skeleton-block--hero" />
    <div className="feed-skeleton-thumbs">
      {[0, 1, 2].map(i => (
        <div key={i} className="feed-skeleton-block feed-skeleton-block--thumb" />
      ))}
    </div>
    <div className="feed-skeleton-line feed-skeleton-line--xs" />
  </div>
);

// ─── Like button ──────────────────────────────────────────────────────────────
const LikeButton = ({
  liked,
  count,
  onClick,
}: {
  liked?: boolean;
  count: number;
  onClick: () => void;
}) => {
  const [burst, setBurst] = useState(false);

  const handleClick = () => {
    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
    onClick();
  };

  return (
    <button onClick={handleClick} className="feed-like-btn" aria-label="Toggle like">
      <span className={`feed-like-icon ${liked ? 'feed-like-icon--liked' : ''} ${burst ? 'feed-like-icon--burst' : ''}`}>
        {liked ? <FaHeart /> : <FaRegHeart />}
      </span>
      <span className={`feed-like-count ${liked ? 'feed-like-count--liked' : ''}`}>
        {count}
      </span>
    </button>
  );
};

// ─── Outfit Card ─────────────────────────────────────────────────────────────
const OutfitCard = ({
  outfit,
  onToggleLike,
}: {
  outfit: Outfit;
  onToggleLike: (id: string) => void;
}) => {
  const avatarColor = getAvatarColor(outfit.userName);
  const clothes = outfit.clothes ?? [];
  const [heroIndex, setHeroIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const heroItem = clothes[heroIndex];
  const thumbItems = clothes
    .map((item, idx) => ({ item, idx }))
    .filter(({ idx }) => idx !== heroIndex)
    .slice(0, 3);

  const handleThumbClick = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setHeroIndex(idx); setAnimating(false); }, 200);
  };

  return (
    <article className="feed-card">

      {/* Header */}
      <div className="feed-card-header">
        {/* Avatar: bg/color are dynamic per user so stay as inline style */}
        <div
          className="feed-avatar"
          style={{ background: avatarColor.bg, color: avatarColor.text }}
        >
          {getInitials(outfit.userName)}
        </div>
        <div className="feed-avatar-meta">
          <p className="feed-username">{outfit.userName || 'Usuario'}</p>
          <p className="feed-time-label">{timeAgo(outfit.$createdAt)}</p>
        </div>
        <LikeButton
          liked={outfit.liked}
          count={outfit.likes ?? 0}
          onClick={() => onToggleLike(outfit.$id)}
        />
      </div>

      {/* Outfit name */}
      <h3 className="feed-outfit-title">{outfit.name || 'Outfit sin nombre'}</h3>

      {/* Hero image */}
      {heroItem && (
        <div className="feed-hero-wrap">
          <img
            key={heroItem.$id}
            src={getImageUrl(heroItem.image)}
            alt={heroItem.type}
            className={`feed-hero-img ${animating ? 'feed-hero-img--animating' : ''}`}
            loading="lazy"
          />
          <div className="feed-hero-tag">
            <span className="feed-hero-tag-text">{heroItem.type}</span>
          </div>
          {clothes.length > 1 && (
            <div className="feed-dot-row">
              {clothes.map((_, idx) => (
                <div key={idx} className={`feed-dot ${idx === heroIndex ? 'feed-dot--active' : ''}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Thumbnails */}
      {thumbItems.length > 0 && (
        <div className="feed-clothes-row">
          {thumbItems.map(({ item, idx }) => (
            <div
              key={item.$id}
              className="feed-thumb thumb-swap"
              role="button"
              tabIndex={0}
              aria-label={`Ver ${item.type} en detalle`}
              onClick={() => handleThumbClick(idx)}
              onKeyDown={e => e.key === 'Enter' && handleThumbClick(idx)}
            >
              <div className="feed-thumb-img-wrap">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.type}
                  className="feed-thumb-img"
                  loading="lazy"
                />
                <div className="feed-thumb-overlay thumb-overlay-inner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
              <div className="feed-thumb-label">
                <span className="feed-thumb-type">{item.type}</span>
                <span className="feed-thumb-color">{item.color}</span>
              </div>
            </div>
          ))}
          {clothes.length > 4 && (
            <div className="feed-thumb feed-thumb--more">
              <span className="feed-more-count">+{clothes.length - 4}</span>
              <span className="feed-more-label">prendas</span>
            </div>
          )}
        </div>
      )}

      {/* Color palette dots — background is dynamic so keeps inline style */}
      {clothes.length > 0 && (
        <div className="feed-palette-row">
          {clothes.slice(0, 6).map(item => (
            <div
              key={item.$id}
              title={item.color}
              className="feed-color-dot"
              style={{ background: item.color?.toLowerCase() || '#ccc' }}
            />
          ))}
        </div>
      )}

    </article>
  );
};

// ─── Main Feed Page ───────────────────────────────────────────────────────────
const FeedPage = () => {
  const [page, setPage] = useState(1);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const totalPages = total ? Math.ceil(total / PER_PAGE) : null;

  const fetchPage = async (p: number) => {
    setLoading(true);
    try {
      const res = await outfitController.getPublicOutfits(p, PER_PAGE);
      setOutfits(res.outfits || []);
      setTotal(res.total ?? null);
    } catch (err) {
      console.error('Error cargando feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [page]);

  const handleToggleLike = async (id: string) => {
    setOutfits(prev =>
      prev.map(o =>
        o.$id === id
          ? { ...o, liked: !o.liked, likes: (o.likes || 0) + (o.liked ? -1 : 1) }
          : o
      )
    );
    try {
      const res = await favouriteController.toggleFavourite(id);
      setOutfits(prev =>
        prev.map(o => (o.$id === id ? { ...o, liked: res.liked, likes: res.likes } : o))
      );
    } catch (err: any) {
      setOutfits(prev =>
        prev.map(o =>
          o.$id === id
            ? { ...o, liked: !o.liked, likes: Math.max(0, (o.likes || 0) + (o.liked ? -1 : 1)) }
            : o
        )
      );
      if (err?.message?.includes('Usuario no autenticado')) {
        alert('Necesitas iniciar sesión para añadir a favoritos');
        window.location.href = '/auth/login';
      } else {
        console.error('Error toggling favourite:', err);
      }
    }
  };

  const getPageRange = () => {
    if (!totalPages) return [];
    const range: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);
      if (page > 3) range.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) range.push(i);
      if (page < totalPages - 2) range.push('...');
      range.push(totalPages);
    }
    return range;
  };

  return (
    <div>
      <AppNavbar />
      <div ref={topRef} />

      <main className="feed-main">

        {/* Page header */}
        <header className="feed-page-header">
          <div>
            <h1 className="feed-page-title">
              <IoGridOutline className="feed-page-title-icon" />
              Explorar outfits
            </h1>
            {total !== null && (
              <p className="feed-page-subtitle">{total} publicaciones de la comunidad</p>
            )}
          </div>
        </header>

        {/* Grid */}
        {loading ? (
          <div className="feed-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="feed-card feed-card--skeleton skeleton-shimmer">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : outfits.length === 0 ? (
          <div className="feed-empty-state">
            <HiOutlineViewGrid className="feed-empty-icon" />
            <p className="feed-empty-text">Todavía no hay publicaciones públicas.</p>
            <p className="feed-empty-sub">¡Sé el primero en compartir tu outfit!</p>
          </div>
        ) : (
          <div className="feed-grid">
            {outfits.map(outfit => (
              <OutfitCard key={outfit.$id} outfit={outfit} onToggleLike={handleToggleLike} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && outfits.length > 0 && (
          <nav className="feed-pagination" aria-label="Paginación">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              ← Anterior
            </button>
            <div className="feed-page-numbers">
              {totalPages
                ? getPageRange().map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="feed-ellipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`page-btn ${p === page ? 'page-btn--active' : ''}`}
                        onClick={() => setPage(p as number)}
                      >
                        {p}
                      </button>
                    )
                  )
                : null}
            </div>
            <button
              className="page-btn"
              disabled={!!(totalPages && page >= totalPages)}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente →
            </button>
          </nav>
        )}

      </main>
    </div>
  );
};

export default FeedPage;
'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import AppNavbar from '@/app/components/ui/Navbar';
import OutfitModal from '@/app/components/ui/OutfitModal';
import { outfitController } from '@/app/controllers/OutfitController';
import { favouriteController } from '@/app/controllers/FavouriteController';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import { HiOutlineViewGrid } from 'react-icons/hi';
import { IoGridOutline } from 'react-icons/io5';

const PER_PAGE = 9;

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface ClothingItem {
  $id: string;
  image: string;
  type: string;
  color: string;
}

interface Outfit {
  $id: string;
  name?: string;
  description?: string;
  userId?: string;
  userName?: string;
  liked?: boolean;
  likes?: number;
  clothes?: ClothingItem[];
  $createdAt?: string;
}

// ─── Helper de URL de imagen ────────────────────────────────────────────────────────
const getImageUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

// ─── Iniciales del avatar ─────────────────────────────────────────────────────────
const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

// ─── Tiempo relativo ───────────────────────────────────────────────────────────
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

// ─── Colores de avatar ─────────────────────────────────────────────────────
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

// ─── Esqueleto de la card ────────────────────────────────────────────────────────────
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
  </div>
);

// ─── Botón de me gusta ──────────────────────────────────────────────────────────────
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
  onSelect,
}: {
  outfit: Outfit;
  onToggleLike: (id: string) => void;
  onSelect: (outfit: Outfit) => void;
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

  // Actualizar el índice de la imagen principal.
  const handleThumbClick = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setHeroIndex(idx); setAnimating(false); }, 200);
  };

  // Soporte de teclado para la selección de miniaturas y navegación horizontal.
  const handleThumbKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleThumbClick(idx);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      const nextIdx = (idx + 1) % thumbItems.length;
      handleThumbClick(thumbItems[nextIdx].idx);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      const prevIdx = (idx - 1 + thumbItems.length) % thumbItems.length;
      handleThumbClick(thumbItems[prevIdx].idx);
    }
  };

  const handleThumbMouseClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    handleThumbClick(idx);
  };

  const handleCardClick = () => onSelect(outfit);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(outfit.$id);
  };

  return (
    <article className="feed-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>

      {/* Header */}
      <div className="feed-card-header">
        {/* Avatar: el color de fondo y el texto son dinámicos por usuario */}
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
        <div onClick={e => e.stopPropagation()}>
          <LikeButton
            liked={outfit.liked}
            count={outfit.likes ?? 0}
            onClick={handleLikeClick}
          />
        </div>
      </div>

      {/* Nombre del outfit */}
      <h2 className="feed-outfit-title">{outfit.name || 'Outfit sin nombre'}</h2>
      {outfit.description && (
        <p className="feed-outfit-description">{outfit.description}</p>
      )}

      {/* Imagen principal: notese como se utiliza el tipo y el color para crear texto alternativo de forma dinámica */}
      {heroItem && (
        <div className="feed-hero-wrap">
          <img
            key={heroItem.$id}
            src={getImageUrl(heroItem.image)}
            alt={`Imagen principal del outfit: ${heroItem.type}, color: ${heroItem.color}`}
            className={`feed-hero-img ${animating ? 'feed-hero-img--animating' : ''}`}
            loading="lazy"
          />
          <div className="feed-hero-tag">
            <span className="feed-hero-tag-text">{heroItem.type}</span>
          </div>
          {clothes.length > 1 && (
            <div className="feed-dot-row">
              {clothes.map((_, idx) => (
                <button
                  key={idx}
                  className={`feed-dot ${idx === heroIndex ? 'feed-dot--active' : ''}`}
                  onClick={e => { e.stopPropagation(); handleThumbClick(idx); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleThumbClick(idx);
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      e.stopPropagation();
                      const nextIdx = (idx + 1) % clothes.length;
                      handleThumbClick(nextIdx);
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      e.stopPropagation();
                      const prevIdx = (idx - 1 + clothes.length) % clothes.length;
                      handleThumbClick(prevIdx);
                    }
                  }}
                  aria-label={`Ver prenda ${idx + 1} como imagen principal`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Miniaturas */}
      {thumbItems.length > 0 && (
        <div className="feed-clothes-row">
          {thumbItems.map(({ item, idx }) => (
            <div
              key={item.$id}
              className="feed-thumb thumb-swap"
              role="button"
              tabIndex={0}
              aria-label={`Ver ${item.type} en detalle`}
              onClick={e => handleThumbMouseClick(e, idx)}
              onKeyDown={e => handleThumbKeyDown(e, idx)}
            >
              <div className="feed-thumb-img-wrap">
                <img
                  src={getImageUrl(item.image)}
                  alt={`Miniatura de prenda: ${item.type}, color: ${item.color}`}
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

      {/* Paleta de colores */}
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

// ─── Página principal del feed ───────────────────────────────────────────────────────────
const FeedPage = () => {
  const [page, setPage] = useState(1);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'likes'>('recent');
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const totalPages = total ? Math.ceil(total / PER_PAGE) : null;

  // Función para obtener outfits
  const fetchPage = useCallback(async (pageNum: number, search?: string, occasion?: string, sort?: 'recent' | 'likes') => {
    setLoading(true);
    try {
      const result = await outfitController.getPublicOutfits(pageNum, PER_PAGE, search, occasion, sort);
      setOutfits(result.outfits);
      setTotal(result.total);
    } catch (error) {
      console.error('Error fetching outfits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on search
      fetchPage(1, searchTerm || undefined, selectedOccasion || undefined, sortBy);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedOccasion, sortBy]);

  useEffect(() => {
    if (page > 1) {
      fetchPage(page, searchTerm || undefined, selectedOccasion || undefined, sortBy);
    }
  }, [page]);

  useEffect(() => {
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

        {/* Header de la página */}
        <header className="feed-page-header">
          <div>
            <h1 className="feed-page-title">
              <IoGridOutline className="feed-page-title-icon" aria-hidden="true" />
              Explorar outfits
            </h1>
            {total !== null && (
              <p className="feed-page-subtitle">{total} publicaciones de la comunidad</p>
            )}
          </div>
        </header>

        {/* Filtros y búsqueda */}
        <div className="feed-filters">
          <div className="feed-search">
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="flex items-center">
              <FaSearch className="feed-search-icon mr-2 text-gray-400 mb-4" aria-hidden="true" />
              <input
                id="search-input"
                type="text"
                placeholder="Buscar por nombre de usuario, atuendo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="feed-search-input flex-1 pl-4 pr-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          </div>
          <div className="feed-filter-row flex gap-4 mb-4">
            <div className="feed-filter-group">
              <label htmlFor="occasion-select" className="block text-sm font-medium text-gray-700 mb-1">Ocasion</label>
              <select
                id="occasion-select"
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="feed-filter-select border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Todas las ocasiones</option>
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Deporte">Deporte</option>
                <option value="Fiesta">Fiesta</option>
                <option value="Trabajo">Trabajo</option>
              </select>
            </div>
            <div className="feed-filter-group">
              <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'likes')}
                className="feed-filter-select border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="recent">Más reciente</option>
                <option value="likes">Más me gusta</option>
              </select>
            </div>
          </div>
        </div>

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
            <HiOutlineViewGrid className="feed-empty-icon" aria-hidden="true" />
            <p className="feed-empty-text">Todavía no hay publicaciones públicas.</p>
            <p className="feed-empty-sub">¡Sé el primero en compartir tu outfit!</p>
          </div>
        ) : (
          <div className="feed-grid">
            {outfits.map(outfit => (
              <OutfitCard key={outfit.$id} outfit={outfit} onToggleLike={handleToggleLike} onSelect={setSelectedOutfit} />
            ))}
          </div>
        )}

        {/* Paginación */}
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

      <OutfitModal
        outfit={selectedOutfit}
        isOpen={!!selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        onLikeUpdate={(outfitId, liked, likes) => {
          setOutfits(prev =>
            prev.map(o => o.$id === outfitId ? { ...o, liked, likes } : o)
          );
        }}
      />
    </div>
  );
};

export default FeedPage;
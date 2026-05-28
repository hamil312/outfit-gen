'use client';
import React, { useEffect, useState, useRef } from 'react';
import { FaHeart, FaRegHeart, FaTrash, FaEdit, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { commentController } from '@/app/controllers/CommentController';
import { favouriteController } from '@/app/controllers/FavouriteController';

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

interface Comment {
  $id: string;
  comment: string;
  userId: string;
  userName: string;
  outfitId: string;
  $createdAt: string;
  $updatedAt: string;
}

const getImageUrl = (fileId: string) =>
  `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const timeAgo = (dateStr?: string) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  return `hace ${Math.floor(days / 30)}mes`;
};

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

interface OutfitModalProps {
  outfit: Outfit | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike?: (id: string) => void;
  onLikeUpdate?: (outfitId: string, liked: boolean, likes: number) => void;
}

const OutfitModal: React.FC<OutfitModalProps> = ({ outfit, isOpen, onClose, onLikeUpdate }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!outfit) return;
    setLiked(outfit.liked || false);
    setLikesCount(outfit.likes || 0);
    setHeroIndex(0);
    loadComments();
    loadCurrentUser();
  }, [outfit]);

  const loadCurrentUser = async () => {
    try {
      const { account } = await import('@/lib/appwrite');
      const user = await account.get();
      setCurrentUserId(user.$id);
    } catch {
      setCurrentUserId(null);
    }
  };

  const loadComments = async () => {
    if (!outfit) return;
    try {
      const data = await commentController.getComments(outfit.$id);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !outfit) return;
    try {
      const comment = await commentController.addComment(outfit.$id, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
      scrollToBottom();
    } catch (err: any) {
      if (err?.message?.includes('no autenticado')) {
        alert('Necesitas iniciar sesión para comentar');
      } else {
        console.error('Error adding comment:', err);
      }
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      const updated = await commentController.updateComment(commentId, editText.trim());
      setComments(prev => prev.map(c => c.$id === commentId ? updated : c));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Error editing comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await commentController.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.$id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleLike = async () => {
    if (!outfit) return;
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!liked);
    setLikesCount(prev => prev + (liked ? -1 : 1));
    try {
      const res = await favouriteController.toggleFavourite(outfit.$id);
      setLiked(res.liked);
      setLikesCount(res.likes);
      if (onLikeUpdate) onLikeUpdate(outfit.$id, res.liked, res.likes);
    } catch (err: any) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      if (err?.message?.includes('no autenticado')) {
        alert('Necesitas iniciar sesión para dar me gusta');
      } else {
        console.error('Error toggling like:', err);
      }
    }
  };

  if (!isOpen || !outfit) return null;

  const clothes = outfit.clothes ?? [];
  const heroItem = clothes[heroIndex];
  const avatarColor = getAvatarColor(outfit.userName);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="outfit-modal" onClick={e => e.stopPropagation()}>
        <button className="outfit-modal-close" onClick={onClose} aria-label="Cerrar">
          <FaTimes />
        </button>

        <div className="outfit-modal-layout">

          <div className="outfit-modal-left">
            <div className="outfit-modal-header">
              <div className="outfit-modal-avatar" style={{ background: avatarColor.bg, color: avatarColor.text }}>
                {getInitials(outfit.userName)}
              </div>
              <div className="outfit-modal-meta">
                <p className="outfit-modal-username">{outfit.userName || 'Usuario'}</p>
                <p className="outfit-modal-time">{timeAgo(outfit.$createdAt)}</p>
              </div>
              <button onClick={handleLike} className="outfit-modal-like-btn" aria-label="Like">
                <span className={`outfit-modal-like-icon ${liked ? 'liked' : ''}`}>
                  {liked ? <FaHeart /> : <FaRegHeart />}
                </span>
                <span className={`outfit-modal-like-count ${liked ? 'liked' : ''}`}>{likesCount}</span>
              </button>
            </div>

            <h2 className="outfit-modal-title">{outfit.name || 'Outfit sin nombre'}</h2>
            {outfit.description && <p className="outfit-modal-desc">{outfit.description}</p>}

            {heroItem && (
              <div className="outfit-modal-hero">
                <img
                  src={getImageUrl(heroItem.image)}
                  alt={heroItem.type}
                  className="outfit-modal-hero-img"
                />
                <div className="outfit-modal-hero-tag">{heroItem.type}</div>
                {clothes.length > 1 && (
                  <div className="outfit-modal-dots">
                    {clothes.map((_, idx) => (
                      <button
                        key={idx}
                        className={`outfit-modal-dot ${idx === heroIndex ? 'active' : ''}`}
                        onClick={() => setHeroIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {clothes.length > 1 && (
              <div className="outfit-modal-thumbs">
                {clothes.map((item, idx) => (
                  <button
                    key={item.$id}
                    className={`outfit-modal-thumb ${idx === heroIndex ? 'active' : ''}`}
                    onClick={() => setHeroIndex(idx)}
                  >
                    <img src={getImageUrl(item.image)} alt={item.type} />
                    <span>{item.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="outfit-modal-right">
            <h3 className="outfit-modal-comments-title">
              Comentarios ({comments.length})
            </h3>

            <div className="outfit-modal-comments-list">
              {comments.length === 0 ? (
                <div className="outfit-modal-no-comments">
                  <p>No hay comentarios aún.</p>
                  <p>Sé el primero en comentar.</p>
                </div>
              ) : (
                comments.map(comment => {
                  const isOwner = currentUserId === comment.userId;
                  const cAvatarColor = getAvatarColor(comment.userName);
                  const isEditing = editingId === comment.$id;

                  return (
                    <div key={comment.$id} className="outfit-modal-comment">
                      <div className="outfit-modal-comment-avatar" style={{ background: cAvatarColor.bg, color: cAvatarColor.text }}>
                        {getInitials(comment.userName)}
                      </div>
                      <div className="outfit-modal-comment-body">
                        <div className="outfit-modal-comment-header">
                          <span className="outfit-modal-comment-user">{comment.userName}</span>
                          <span className="outfit-modal-comment-time">{timeAgo(comment.$createdAt)}</span>
                        </div>
                        {isEditing ? (
                          <div className="outfit-modal-edit-form">
                            <textarea
                              className="outfit-modal-edit-input"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              autoFocus
                            />
                            <div className="outfit-modal-edit-actions">
                              <button className="outfit-modal-btn outfit-modal-btn--save" onClick={() => handleEditComment(comment.$id)}>Guardar</button>
                              <button className="outfit-modal-btn outfit-modal-btn--cancel" onClick={() => { setEditingId(null); setEditText(''); }}>Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <p className="outfit-modal-comment-text">{comment.comment}</p>
                        )}
                        {isOwner && !isEditing && (
                          <div className="outfit-modal-comment-actions">
                            <button
                              className="outfit-modal-comment-action"
                              onClick={() => { setEditingId(comment.$id); setEditText(comment.comment); }}
                              title="Editar"
                            >
                              <FaEdit /> Editar
                            </button>
                            <button
                              className="outfit-modal-comment-action outfit-modal-comment-action--delete"
                              onClick={() => handleDeleteComment(comment.$id)}
                              title="Eliminar"
                            >
                              <FaTrash /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={commentsEndRef} />
            </div>

            <div className="outfit-modal-add-comment">
              <textarea
                className="outfit-modal-input"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                rows={2}
              />
              <button
                className="outfit-modal-send-btn"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OutfitModal;

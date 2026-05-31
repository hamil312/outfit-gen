'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ui/ProtectedRoute';
import { account, storage, ID } from '@/lib/appwrite';

const MAX_FILE_SIZE = 200 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [nameInput, setNameInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        setNameInput(userData.name || '');
        
        // Obtener URL de imagen de perfil si existe
        const profileImageId = userData.prefs?.profileImageId;
        if (profileImageId) {
          const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${profileImageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
          setProfileImageUrl(imageUrl);
        }
      } catch (err) {
        console.error('Error al obtener usuario:', err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);

    if (!ALLOWED_TYPES.includes(f.type)) {
      setMessage({ type: 'danger', text: 'Formato no válido. Solo PNG o JPG.' });
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setMessage({ type: 'danger', text: 'Archivo demasiado grande. Máx 200 KB.' });
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!nameInput.trim()) {
      setMessage({ type: 'danger', text: 'El nombre no puede estar vacío.' });
      return;
    }

    setLoading(true);
    try {
      // Actualizar nombre
      await account.updateName(nameInput.trim());

      // Si hay una nueva imagen, subirla y guardar su ID
      if (file) {
        try {
          // Eliminar imagen anterior si existe
          if (user?.prefs?.profileImageId) {
            try {
              await storage.deleteFile(BUCKET_ID, user.prefs.profileImageId);
            } catch (err) {
              console.log('No se pudo eliminar imagen anterior');
            }
          }

          // Subir nueva imagen
          const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
          
          // Guardar ID en preferencias del usuario
          await account.updatePrefs({
            ...user?.prefs,
            profileImageId: uploadedFile.$id,
          });

          // Actualizar URL de imagen
          const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
          setProfileImageUrl(imageUrl);
          setFile(null);
          setPreview(null);
        } catch (uploadErr) {
          console.error('Error al subir imagen:', uploadErr);
          setMessage({ type: 'danger', text: 'Error al subir la imagen. Intenta de nuevo.' });
          setLoading(false);
          return;
        }
      }

      setUser({ ...user, name: nameInput.trim() });
      setMessage({ type: 'success', text: '✓ Perfil actualizado correctamente.' });
    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'danger', text: 'Error al actualizar. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNameInput(user?.name || '');
    setFile(null);
    setPreview(null);
    setMessage(null);
  };

  return (
    <ProtectedRoute>
      <div className="profile-root">
        <div className="profile-container">
          <div className="profile-card">
            {/* Left side - Form */}
            <div className="profile-content">
              <div className="profile-header">
                <h1 className="profile-title">Hola, {user?.name || 'Usuario'}</h1>
                <p className="profile-subtitle">Personaliza tu perfil y tu imagen (PNG/JPG, máx 200KB)</p>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                {/* Nombre */}
                <div className="profile-form-group">
                  <label htmlFor="name" className="profile-label">Nombre de usuario</label>
                  <input
                    id="name"
                    type="text"
                    className="profile-input"
                    placeholder="Tu nombre completo"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                </div>

                {/* File upload */}
                <div className="profile-form-group">
                  <label className="profile-label">Imagen de perfil</label>
                  <label htmlFor="profileFile" className="profile-file-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span className="profile-file-text">
                      {file ? file.name : 'Haz clic o arrastra tu imagen'}
                    </span>
                    <span className="profile-file-subtext">PNG o JPG, máximo 200 KB</span>
                  </label>
                  <input
                    id="profileFile"
                    type="file"
                    className="profile-file-input"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                  />
                  <p className="profile-helper-text">Los cambios de imagen se guardarán junto con tu nombre.</p>
                </div>

                {/* Alert */}
                {message && (
                  <div className={`profile-alert ${message.type === 'success' ? 'profile-alert-success' : 'profile-alert-danger'}`}>
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="profile-button-group">
                  <button
                    type="submit"
                    className="profile-btn profile-btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn-secondary"
                    onClick={() => router.push('/')}
                  >
                    ← Volver al home
                  </button>
                </div>
              </form>
            </div>

            {/* Right side - Avatar */}
            <div className="profile-avatar-section">
              <div className="profile-avatar-container">
                {preview ? (
                  <img src={preview} alt="Preview" className="profile-avatar-img" />
                ) : profileImageUrl ? (
                  <img src={profileImageUrl} alt="Perfil" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>Sin imagen</div>
                  </div>
                )}
              </div>
              <p className="profile-avatar-label">Imagen actual</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
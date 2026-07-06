'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ui/ProtectedRoute';
import BodyTypeCapture from '@/app/components/ui/BodyTypeCapture';
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

  // Skin tone state
  const [skinFile, setSkinFile] = useState<File | null>(null);
  const [skinPreview, setSkinPreview] = useState<string | null>(null);
  const [skinResult, setSkinResult] = useState<{ category: string; label: string; hex: string } | null>(null);
  const [skinSaving, setSkinSaving] = useState(false);
  const [skinAnalyzing, setSkinAnalyzing] = useState(false);
  const [skinMessage, setSkinMessage] = useState<string | null>(null);

  // Body type state
  const [bodySaving, setBodySaving] = useState(false);
  const [bodyMessage, setBodyMessage] = useState<string | null>(null);
  const [currentBodyType, setCurrentBodyType] = useState<string | null>(null);
  const [bodyTypeMode, setBodyTypeMode] = useState<'view' | 'scan' | 'manual'>('view');
  const [selectedManualBodyType, setSelectedManualBodyType] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        setNameInput(userData.name || '');
        
        const profileImageId = userData.prefs?.profileImageId;
        if (profileImageId) {
          const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${profileImageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
          setProfileImageUrl(imageUrl);
        }

        // Cargar tipo de cuerpo actual
        const { profileController } = await import('@/app/controllers/ProfileController');
        const profile = await profileController.getProfile(userData.$id);
        if (profile?.bodyType) {
          setCurrentBodyType(profile.bodyType);
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

  const handleSkinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return setSkinFile(null);
    setSkinFile(f);
    setSkinResult(null);
    setSkinMessage(null);
  };
  const handleSaveBodyType = async (bodyType: string) => {
    if (!user) return;
    setBodySaving(true);
    try {
      const { profileController } = await import('@/app/controllers/ProfileController');
      await profileController.saveBodyType(user.$id, bodyType);
      setCurrentBodyType(bodyType);
      setBodyMessage('Tipo de cuerpo guardado correctamente');
      setBodyTypeMode('view');
    } catch { setBodyMessage('Error al guardar'); }
    finally { setBodySaving(false); }
  };

  const handleAnalyzeSkin = async () => {
    if (!skinFile) return;
    setSkinAnalyzing(true);
    setSkinMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', skinFile);
      const res = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000'}/analyze-skin-tone`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) { setSkinMessage('Error al analizar'); return; }
      const data = await res.json();
      setSkinResult(data);
    } catch { setSkinMessage('Error de conexión con el servidor'); }
    finally { setSkinAnalyzing(false); }
  };

  const handleSaveSkinTone = async () => {
    if (!skinResult || !user) return;
    setSkinSaving(true);
    try {
      const { profileController } = await import('@/app/controllers/ProfileController');
      await profileController.saveSkinTone(user.$id, skinResult.category);
      setSkinMessage('Tono de piel guardado correctamente');
    } catch { setSkinMessage('Error al guardar'); }
    finally { setSkinSaving(false); }
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

          {/* ── Body Type Section ── */}
          <div className="profile-card" style={{ marginTop: 24 }}>
            <div className="profile-content">
              <div className="profile-header">
                <h2 className="profile-title" style={{ fontSize: 20 }}>Tipo de cuerpo</h2>
                <p className="profile-subtitle">
                  Tu tipo de cuerpo ayuda a recomendar outfits que mejor se adapten a tu silueta.
                </p>
              </div>

              {/* Current body type display */}
              {currentBodyType && bodyTypeMode === 'view' && (
                <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#166534', fontSize: 15 }}>
                    {currentBodyType === 'ectomorfo' ? 'Ectomorfo' :
                     currentBodyType === 'endomorfo' ? 'Endomorfo' :
                     currentBodyType === 'mesomorfo' ? 'Mesomorfo' : currentBodyType}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#374151' }}>
                    {currentBodyType === 'ectomorfo' ? 'Cuerpo delgado, hombros estrechos, poca grasa corporal.' :
                     currentBodyType === 'endomorfo' ? 'Cuerpo con tendencia a acumular grasa, complexión blanda.' :
                     currentBodyType === 'mesomorfo' ? 'Cuerpo atlético, musculoso, hombros anchos.' : ''}
                  </p>
                </div>
              )}

              {/* Mode tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setBodyTypeMode('view')}
                  className={`profile-btn ${bodyTypeMode === 'view' ? 'profile-btn-primary' : 'profile-btn-secondary'}`}
                  style={{ fontSize: 13, padding: '6px 14px' }}
                >
                  {currentBodyType ? 'Ver actual' : 'Información'}
                </button>
                <button
                  type="button"
                  onClick={() => { setBodyTypeMode('scan'); setBodyMessage(null); }}
                  className={`profile-btn ${bodyTypeMode === 'scan' ? 'profile-btn-primary' : 'profile-btn-secondary'}`}
                  style={{ fontSize: 13, padding: '6px 14px' }}
                >
                  📷 Escanear
                </button>
                <button
                  type="button"
                  onClick={() => { setBodyTypeMode('manual'); setBodyMessage(null); }}
                  className={`profile-btn ${bodyTypeMode === 'manual' ? 'profile-btn-primary' : 'profile-btn-secondary'}`}
                  style={{ fontSize: 13, padding: '6px 14px' }}
                >
                  ✏️ Seleccionar manual
                </button>
              </div>

              {/* Scan mode */}
              {bodyTypeMode === 'scan' && (
                <BodyTypeCapture
                  compact={true}
                  onComplete={handleSaveBodyType}
                />
              )}

              {/* Manual selection */}
              {bodyTypeMode === 'manual' && (
                <div>
                  <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
                    Selecciona el tipo de cuerpo que mejor describa tu silueta actual:
                  </p>
                  {['ectomorfo', 'endomorfo', 'mesomorfo'].map(bt => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setSelectedManualBodyType(bt)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', marginBottom: 8,
                        padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                        border: selectedManualBodyType === bt ? '2px solid #6366f1' : '1px solid #d1d5db',
                        background: selectedManualBodyType === bt ? '#eef2ff' : '#fff',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 15, display: 'block' }}>
                        {bt === 'ectomorfo' ? 'Ectomorfo' : bt === 'endomorfo' ? 'Endomorfo' : 'Mesomorfo'}
                      </span>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        {bt === 'ectomorfo' ? 'Delgado, hombros estrechos, poca grasa' :
                         bt === 'endomorfo' ? 'Tendencia a acumular grasa, cuerpo blando' :
                         'Atlético, musculoso, hombros anchos'}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { if (selectedManualBodyType) handleSaveBodyType(selectedManualBodyType); }}
                    disabled={!selectedManualBodyType || bodySaving}
                    className="profile-btn profile-btn-primary"
                    style={{ marginTop: 12, fontSize: 13, padding: '6px 14px' }}
                  >
                    {bodySaving ? 'Guardando…' : 'Guardar selección'}
                  </button>
                </div>
              )}

              {bodyMessage && (
                <p style={{ marginTop: 12, fontSize: 13, color: bodyMessage.includes('Error') ? '#dc2626' : '#16a34a' }}>
                  {bodyMessage}
                </p>
              )}
            </div>
          </div>

          {/* ── Skin Tone Section ── */}
          <div className="profile-card" style={{ marginTop: 24 }}>
            <div className="profile-content">
              <div className="profile-header">
                <h2 className="profile-title" style={{ fontSize: 20 }}>Tono de piel</h2>
                <p className="profile-subtitle">
                  Sube una foto de tu rostro para detectar tu tono de piel.
                  La foto no se almacena, solo el resultado.
                </p>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Foto para análisis</label>
                <label htmlFor="skinFile" className="profile-file-label">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span className="profile-file-text">
                    {skinFile ? skinFile.name : 'Sube una foto de tu rostro'}
                  </span>
                  <span className="profile-file-subtext">JPG o PNG, sin límite de tamaño</span>
                </label>
                <input
                  id="skinFile"
                  type="file"
                  className="profile-file-input"
                  accept="image/png,image/jpeg,image/jpg"
                  capture="user"
                  onChange={handleSkinFileChange}
                />
              </div>

              {skinPreview && (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                  <img
                    src={skinPreview}
                    alt="Preview"
                    style={{ width: 120, height: 120, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div>
                    <button
                      className="profile-btn profile-btn-primary"
                      onClick={handleAnalyzeSkin}
                      disabled={skinAnalyzing}
                    >
                      {skinAnalyzing ? 'Analizando…' : 'Analizar tono de piel'}
                    </button>

                    {skinResult && (
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            backgroundColor: skinResult.hex, border: '2px solid #e5e7eb',
                          }} />
                          <span style={{ fontWeight: 600 }}>{skinResult.label}</span>
                        </div>
                        <button
                          className="profile-btn profile-btn-primary"
                          onClick={handleSaveSkinTone}
                          disabled={skinSaving}
                          style={{ fontSize: 13, padding: '6px 14px' }}
                        >
                          {skinSaving ? 'Guardando…' : 'Guardar en mi perfil'}
                        </button>
                      </div>
                    )}

                    {skinMessage && (
                      <p style={{ marginTop: 8, fontSize: 13, color: skinMessage.includes('Error') ? '#dc2626' : '#16a34a' }}>
                        {skinMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
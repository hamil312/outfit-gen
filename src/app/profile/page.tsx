'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/app/components/ui/ProtectedRoute';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Alert from 'react-bootstrap/Alert';
import { account } from '@/lib/appwrite';

const MAX_FILE_SIZE = 200 * 1024; // 200 KB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

export default function UserPage() {
  const [username, setUsername] = useState<string>('Cargando...');
  const [nameInput, setNameInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setUsername(user.name || 'Usuario');
        setNameInput(user.name || '');
      } catch (err) {
        console.error('Error al obtener usuario:', err);
        setUsername('No autenticado');
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
      return setFile(null);
    }
    if (f.size > MAX_FILE_SIZE) {
      setMessage({ type: 'danger', text: 'Archivo demasiado grande. Máx 200 KB.' });
      return setFile(null);
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
      await account.updateName(nameInput.trim());
      setUsername(nameInput.trim());
      setMessage({ type: 'success', text: 'Nombre actualizado correctamente.' });

    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al actualizar. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center py-6">
        <Card style={{ maxWidth: 900, width: '100%' }} className="p-4 shadow-md">
          <Card.Body className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a2b32] mb-2">
                Hola, de nuevo {username}
              </h2>
              <p className="text-sm text-muted mb-4">
                Aquí puedes cambiar tu nombre y tu imagen de perfil (PNG/JPG, máx 200KB).
              </p>

              <Form onSubmit={handleSubmit}>
                <FloatingLabel
                  controlId="changeUserName"
                  label="Nuevo nombre de usuario"
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    placeholder="Nombre de usuario"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="focus:border-[#5CA2AE] focus:ring-0"
                  />
                </FloatingLabel>

                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Imagen de perfil (opcional)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="focus:border-[#5CA2AE] focus:ring-0"
                  />
                  <Form.Text className="text-muted">
                    Formato PNG o JPG. Máximo 200 KB.
                  </Form.Text>
                </Form.Group>

                {message && (
                  <Alert
                    variant={message.type === 'success' ? 'success' : 'danger'}
                    className="mb-3"
                  >
                    {message.text}
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    style={{
                      backgroundColor: '#5CA2AE',
                      borderColor: '#5CA2AE',
                    }}
                  >
                    {loading ? 'Guardando...' : 'Editar'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setNameInput(username);
                      setFile(null);
                      setMessage(null);
                      window.location.href = '/';
                    }}
                    className="hover:bg-[#f3f4f6] focus:ring-0"
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </div>

            <div className="w-full md:w-48 flex flex-col items-center">
              <div className="w-[320px] h-[320px] rounded-full overflow-hidden border-2 border-gray-200 mb-3 bg-white flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <svg
                      width="56"
                      height="56"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                        stroke="#9CA3AF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 20a8 8 0 0 1 16 0"
                        stroke="#9CA3AF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-sm mt-2">Sin imagen</div>
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-sm text-muted mb-1">Imagen actual</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
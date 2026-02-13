'use client';
import React, { useEffect, useState } from 'react';
import AppNavbar from '@/app/components/ui/Navbar';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { FaHeart } from 'react-icons/fa';
import { outfitController } from '@/app/controllers/OutfitController';
import { favouriteController } from '@/app/controllers/FavouriteController';

const PER_PAGE = 10;

const FeedPage = () => {
  const [page, setPage] = useState(1);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  const fetchPage = async (p: number) => {
    setLoading(true);
    try {
      const res = await outfitController.getPublicOutfits(p, PER_PAGE);
      const fetched = res.outfits || [];
      setOutfits(fetched);
      setHasNext((fetched.length || 0) === PER_PAGE);
      setTotal(res.total ?? null);
    } catch (err) {
      console.error('Error cargando feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
  }, [page]);

  const renderImages = (clothes: any[]) => {
    return (
      <div className="flex gap-3">
        {clothes.map((item: any) => (
          <div key={item.$id} className="size-[30%] bg-white shadow rounded-lg border overflow-hidden">
            <img
              src={`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${item.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
              className="h-32 w-full object-cover object-top rounded-t-lg"
            />
            <div className="p-2 text-center">
              <p className="font-semibold">{item.type}</p>
              <p className="text-sm text-gray-600">{item.color}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleToggleLike = async (id: string) => {
    // Optimistic UI: actualizar estado localmente
    setOutfits(prev => prev.map(o => o.$id === id ? { ...o, liked: !o.liked, likes: (o.likes || 0) + (o.liked ? -1 : 1) } : o));

    try {
      const res = await favouriteController.toggleFavourite(id);
      // Asegurar que estado refleje lo que devolvió el backend
      setOutfits(prev => prev.map(o => o.$id === id ? { ...o, liked: res.liked, likes: res.likes } : o));
    } catch (err: any) {
      // Revertir cambio optimista en caso de error
      setOutfits(prev => prev.map(o => o.$id === id ? { ...o, liked: !o.liked, likes: Math.max(0, (o.likes || 0) + (o.liked ? -1 : 1)) } : o));

      if (err && err.message && err.message.includes('Usuario no autenticado')) {
        alert('Necesitas iniciar sesión para añadir a favoritos');
        window.location.href = '/auth/login';
      } else {
        console.error('Error toggling favourite:', err);
        alert('Ocurrió un error al actualizar favoritos');
      }
    }
  };


  const pagesToRender = () => {
    if (total && total > 0) {
      const totalPages = Math.ceil(total / PER_PAGE);
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // if total unknown, just render current and maybe next
    return [page];
  };

  return (
    <div>
      <AppNavbar />
      <main className="m-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item href="#">Feed</Breadcrumb.Item>
          <Breadcrumb.Item active>Publicaciones</Breadcrumb.Item>
        </Breadcrumb>

        <h1 className="text-3xl font-semibold mb-6">Publicaciones</h1>

        <div className="space-y-8">
          {loading && <p>Cargando...</p>}

          {!loading && outfits.length === 0 && <p>No hay publicaciones públicas aún.</p>}

          {outfits.map((outfit: any) => (
            <div key={outfit.$id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold">{outfit.name || 'Outfit sin nombre'}</h3>
                  <p className="text-sm text-gray-600">Por: {outfit.userName || outfit.userId}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={outfit.liked ? 'primary' : 'outline-primary'}
                    className="flex items-center gap-2"
                    onClick={() => handleToggleLike(outfit.$id)}
                  >
                    <FaHeart className={outfit.liked ? 'text-white' : 'text-[#1a2b32]'} />
                    <span>{outfit.likes ?? 0}</span>
                  </Button>
                </div>
              </div>

              {renderImages(outfit.clothes || [])}
            </div>
          ))}

          {/* Paginación simple */}
          <div className="flex items-center gap-2 justify-center mt-6">
            <Button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>

            {total ? (
              pagesToRender().map(p => (
                <Button key={p} variant={p === page ? 'primary' : 'outline-primary'} onClick={() => setPage(p)}>{p}</Button>
              ))
            ) : (
              <Button disabled={!hasNext} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedPage;

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { account } from "@/lib/appwrite";

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

export default function AppNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const current = await account.get();
        setUser(current);
        
        // Obtener URL de imagen de perfil si existe
        const profileImageId = current.prefs?.profileImageId;
        if (profileImageId) {
          const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${profileImageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
          setProfileImageUrl(imageUrl);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      router.push("/auth/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <nav className="navbar-custom">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        maxWidth: '100%',
        paddingLeft: '32px',
        paddingRight: '32px',
        gap: '32px',
        flexWrap: 'wrap'
      }}>
        {/* Brand */}
        <Link 
          href="/"
          className="navbar-brand-custom"
          style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          PickurFit
        </Link>

        {/* Center Navigation Links */}
        <div style={{ 
          display: 'flex', 
          gap: '32px', 
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a 
            href="/generator"
            className="nav-link-custom"
          >
            Empieza a generar
          </a>
          <a 
            href="/feed"
            className="nav-link-custom"
          >
            Feed
          </a>
          <Link 
            href="/#about-us"
            className="nav-link-custom"
          >
            Acerca de
          </Link>
          <Link 
            href="/#footer"
            className="nav-link-custom"
          >
            Contáctanos
          </Link>
        </div>

        {/* Right Section - Auth or Profile */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          whiteSpace: 'nowrap'
        }}>
          {loading ? (
            <span style={{ fontSize: 14, color: '#9ca3af' }}>Cargando...</span>
          ) : user ? (
            <>
              {/* Profile Avatar */}
              <button
                onClick={() => router.push('/profile')}
                className="navbar-avatar-link"
                aria-label="Ir al perfil"
              >
                {profileImageUrl ? (
                  <img
                    alt="Perfil del usuario"
                    src={profileImageUrl}
                    className="navbar-avatar-img"
                  />
                ) : (
                  <div className="navbar-avatar-placeholder">
                    <img
                      alt="Perfil"
                      src="/figmaAssets/intersect.svg"
                      style={{ width: '24px', height: '24px' }}
                    />
                  </div>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="navbar-btn navbar-btn-logout"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/auth/login")}
                className="navbar-btn"
              >
                Iniciar sesión
              </button>

              <button
                onClick={() => router.push("/auth/register")}
                className="navbar-btn"
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
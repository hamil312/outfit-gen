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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const current = await account.get();
        setUser(current);

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

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <>
      <a href="/generator" className="nav-link-custom" onClick={closeMenu}>Empieza a generar</a>
      <a href="/calendar" className="nav-link-custom" onClick={closeMenu}>Calendario</a>
      <a href="/feed" className="nav-link-custom" onClick={closeMenu}>Feed</a>
      <Link href="/#about-us" className="nav-link-custom" onClick={closeMenu}>Acerca de</Link>
      <Link href="/#footer" className="nav-link-custom" onClick={closeMenu}>Contáctanos</Link>
    </>
  );

  const isMobileMenuOpen = menuOpen;

  return (
    <nav className="navbar-custom">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '100%',
        gap: '32px',
      }}>
        <Link href="/" className="navbar-brand-custom" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
          PickurFit
        </Link>

        <div className="navbar-links-desktop">
          {navLinks}
        </div>

        <div className={`navbar-right-desktop ${isMobileMenuOpen ? 'navbar-right-desktop--show' : ''}`}>
          {loading ? (
            <span style={{ fontSize: 14, color: '#9ca3af' }}>Cargando...</span>
          ) : user ? (
            <>
              <button onClick={() => router.push('/profile')} className="navbar-avatar-link" aria-label="Ir al perfil">
                {profileImageUrl ? (
                  <img alt="Perfil del usuario" src={profileImageUrl} className="navbar-avatar-img" />
                ) : (
                  <div className="navbar-avatar-placeholder">
                    <img alt="Perfil" src="/figmaAssets/intersect.svg" style={{ width: 24, height: 24 }} />
                  </div>
                )}
              </button>
              <button onClick={handleLogout} className="navbar-btn navbar-btn-logout">Cerrar sesión</button>
            </>
          ) : (
            <>
              <button onClick={() => router.push("/auth/login")} className="navbar-btn">Iniciar sesión</button>
              <button onClick={() => router.push("/auth/register")} className="navbar-btn">Registrarse</button>
            </>
          )}
        </div>

        <button
          className={`navbar-hamburger ${isMobileMenuOpen ? 'navbar-hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks}
          <div className="navbar-mobile-actions">
            {user ? (
              <>
                <button onClick={() => { router.push('/profile'); closeMenu(); }} className="navbar-btn">Perfil</button>
                <button onClick={handleLogout} className="navbar-btn navbar-btn-logout">Cerrar sesión</button>
              </>
            ) : (
              <>
                <button onClick={() => { router.push("/auth/login"); closeMenu(); }} className="navbar-btn">Iniciar sesión</button>
                <button onClick={() => { router.push("/auth/register"); closeMenu(); }} className="navbar-btn">Registrarse</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
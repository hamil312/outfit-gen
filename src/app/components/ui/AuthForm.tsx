"use client";

import React, { useState } from "react";
import Link from "next/link";
import { account, ID } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { BsStars } from "react-icons/bs";

type Props = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "register") {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
      } else {
        await account.createEmailPasswordSession(email, password);
      }

      router.push("/");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">

      {/* ── Left: form panel ── */}
      <div className="auth-panel">
        <div className="auth-panel-inner">

          {/* Brand */}
          <div className="auth-brand">
            <BsStars size={22} className="auth-brand-icon" />
            <span className="auth-brand-name">PickurFit</span>
          </div>

          <h1 className="auth-title">
            {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>

          <p className="auth-subtitle">
            {mode === "login"
              ? "Ingresa tus datos para continuar"
              : "Empieza a generar outfits en segundos"}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">

            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-label">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Correo electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            {message && <p className="auth-error">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading
                ? "Procesando..."
                : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <Link href="/auth/register" className="auth-switch-link">
                  Regístrate
                </Link>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="auth-switch-link">
                  Inicia sesión
                </Link>
              </>
            )}
          </p>

        </div>
      </div>

      {/* ── Right: image panel ── */}
      <div className="auth-image-panel">
        <img
          src="/page_images/outfit_image2.jpg"
          alt="Outfit inspiration"
          className="auth-image"
        />
        <div className="auth-image-overlay">
          <p className="auth-image-quote">
            "Tu estilo, generado en segundos"
          </p>
        </div>
      </div>

    </div>
  );
}
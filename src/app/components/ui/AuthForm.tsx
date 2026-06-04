"use client";
import React, { useState } from "react";
import { account, ID } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BsStars } from "react-icons/bs";
import { profileController } from "@/app/controllers/ProfileController";

type Props = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: Props) {
  const [email, setEmail]       = useState("");
  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "register") {
        // 1. Crear cuenta
        const newUser = await account.create(ID.unique(), email, password, name);
        // 2. Iniciar sesión
        await account.createEmailPasswordSession(email, password);
        // 3. Crear perfil vacío en Appwrite
        await profileController.createDefaultProfile(newUser.$id);
        // 4. Ir al onboarding quiz
        router.push("/onboarding");
      } else {
        await account.createEmailPasswordSession(email, password);
        // Al hacer login, verificar si completó el quiz
        const user = await account.get();
        const quizDone = await profileController.hasCompletedQuiz(user.$id);
        router.push(quizDone ? "/" : "/onboarding");
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">

      <div className="auth-panel">
        <div className="auth-panel-inner">

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
              : "Empieza a generar outfits"}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-label">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
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
                onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            {message && <p className="auth-error">{message}</p>}

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading
                ? "Procesando…"
                : mode === "login" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? (
              <>¿No tienes cuenta?{" "}
                <Link href="/auth/register" className="auth-switch-link">Regístrate</Link>
              </>
            ) : (
              <>¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="auth-switch-link">Inicia sesión</Link>
              </>
            )}
          </p>

        </div>
      </div>

      <div className="auth-image-panel">
        <img
          src="/page_images/outfit_image2.jpg"
          alt="Outfit inspiration"
          className="auth-image"
        />
        <div className="auth-image-overlay">
          <p className="auth-image-quote">"Tu estilo, generado en segundos"</p>
        </div>
      </div>

    </div>
  );
}
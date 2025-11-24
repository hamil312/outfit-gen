"use client";

import React, { useState } from "react";
import { account, ID } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card style={{ maxWidth: 400, width: "100%" }} className="p-4 shadow-md">
        <Card.Body>
          <h1 className="text-2xl font-bold text-[#1a2b32] mb-4 text-center">
            {mode === "login" ? "Iniciar Sesión" : "Registrarse"}
          </h1>
          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="mb-3">
                <label className="block text-sm mb-1">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border rounded w-full p-2 focus:border-[#5CA2AE] focus:ring-0"
                />
              </div>
            )}
            <div className="mb-3">
              <label className="block text-sm mb-1">Correo electrónico</label>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border rounded w-full p-2 focus:border-[#5CA2AE] focus:ring-0"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border rounded w-full p-2 focus:border-[#5CA2AE] focus:ring-0"
              />
            </div>
            {message && (
              <div className="mb-3 text-red-500 text-sm text-center">{message}</div>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{
                backgroundColor: "#5CA2AE",
                borderColor: "#5CA2AE",
                width: "100%",
              }}
              className="mb-2"
            >
              {loading
                ? "Procesando..."
                : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}
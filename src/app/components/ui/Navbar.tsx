"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { account } from "@/lib/appwrite";

export default function AppNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Obtener sesión actual
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const current = await account.get();
        setUser(current);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Cerrar sesión
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
    <Navbar className="bg-white shadow-sm py-3">
      <Container fluid className="px-8">
        <Navbar.Brand
          href="/"
          className="font-bold text-xl hover:text-[#FCC4C4] transition-colors"
        >
          PickurFit
        </Navbar.Brand>

        <Nav className="me-auto gap-4 align-items-center">
          <Button
            variant="outline-dark"
            className="border-2 hover:bg-[#FCC4C4] hover:border-[#FCC4C4] hover:text-white transition-colors"
            onClick={() => router.push("/generator")}
          >
            Empieza a generar
          </Button>

          <Nav.Link
            href="/about"
            className="text-dark hover:text-[#FCC4C4] transition-colors"
          >
            Acerca de
          </Nav.Link>

          <Nav.Link
            href="/contact"
            className="text-dark hover:text-[#FCC4C4] transition-colors"
          >
            Contáctanos
          </Nav.Link>
        </Nav>

        {/* Zona derecha: Login/Logout/Profile */}
        <Nav className="gap-3 align-items-center">
          {loading ? (
            <span className="text-gray-400">Cargando...</span>
          ) : user ? (
            <>
              <Nav.Link
                href="/profile"
                className="w-[45px] h-[45px] flex items-center justify-center bg-white rounded-full overflow-hidden border-2 border-black hover:border-[#FCC4C4] transition-colors p-0"
              >
                <img
                  className="w-[35px] h-[35px]"
                  alt="User"
                  src="/figmaAssets/intersect.svg"
                />
              </Nav.Link>

              <Button
                variant="outline-dark"
                onClick={handleLogout}
                className="border-2 hover:bg-[#FCC4C4] hover:border-[#FCC4C4] hover:text-white transition-colors"
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-dark"
                onClick={() => router.push("/auth/login")}
                className="border-2 hover:bg-[#FCC4C4] hover:border-[#FCC4C4] hover:text-white transition-colors"
              >
                Iniciar sesión
              </Button>

              <Button
                variant="outline-dark"
                onClick={() => router.push("/auth/register")}
                className="border-2 hover:bg-[#FCC4C4] hover:border-[#FCC4C4] hover:text-white transition-colors"
              >
                Registrarse
              </Button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
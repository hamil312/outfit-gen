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
      <Container fluid className="px-8 d-flex">
        <Navbar.Brand
          href="/"
          className="fw-bold fs-5 navbar-brand-custom"
        >
          PickurFit
        </Navbar.Brand>

        <Nav className="mx-auto gap-4 align-items-center">
          <Nav.Link
            href="/generator"
            className="text-dark nav-link-custom"
          >
            Empieza a generar
          </Nav.Link>
          <Nav.Link
            href="/feed"
            className="text-dark nav-link-custom"
          >
            Feed
          </Nav.Link>
          <Nav.Link
            href="/#about-us"
            className="text-dark nav-link-custom"
          >
            Acerca de
          </Nav.Link>
          <Nav.Link
            href="/#footer"
            className="text-dark nav-link-custom"
          >
            Contáctanos
          </Nav.Link>
        </Nav>

        <Nav className="gap-3 align-items-center">
          {loading ? (
            <span className="text-gray-400" style={{ fontSize: 14 }}>Cargando...</span>
          ) : user ? (
            <>
              <Nav.Link
                href="/profile"
                className="d-flex align-items-center justify-content-center bg-white rounded-circle overflow-hidden border border-dark"
                style={{ width: 45, height: 45, minWidth: 45 }}
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
                className="border-2 hover:bg-[#5CA2AE] hover:border-[#5CA2AE] hover:text-white transition-colors"
                style={{ borderRadius: 10, fontSize: 14 }}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-dark"
                onClick={() => router.push("/auth/login")}
                className="border-2 hover:bg-[#5CA2AE] hover:border-[#5CA2AE] hover:text-white transition-colors"
                style={{ borderRadius: 10, fontSize: 14 }}
              >
                Iniciar sesión
              </Button>

              <Button
                variant="outline-dark"
                onClick={() => router.push("/auth/register")}
                className="border-2 hover:bg-[#5CA2AE] hover:border-[#5CA2AE] hover:text-white transition-colors"
                style={{ borderRadius: 10, fontSize: 14 }}
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

"use client";
import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function Footer() {
  return (
    <footer className="bg-white text-dark py-5 mt-5">
      <Container>
        <Row className="align-items-center">
          {/* Columna izquierda */}
          <Col md={6} className="text-start">
            <h3 className="m-0 fw-bold">Pickurfit</h3>
          </Col>

          {/* Columna derecha */}
          <Col md={6} className="text-end d-flex justify-content-end gap-4">

            {/* Gmail */}
            <a
              href="mailto:mariofernandosantacruzp@gmail.com"
              className="text-dark text-decoration-none d-flex align-items-center gap-2 fs-5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gmail.svg"
                alt="gmail"
                width="20"
                height="20"
              />
              Gmail
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/+573185279720"
              className="text-dark text-decoration-none d-flex align-items-center gap-2 fs-5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg"
                alt="whatsapp"
                width="20"
                height="20"
              />
              WhatsApp
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/hamil312/outfit-gen"
              className="text-dark text-decoration-none d-flex align-items-center gap-2 fs-5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg"
                alt="github"
                width="20"
                height="20"
              />
              GitHub
            </a>

          </Col>
        </Row>

        {/* Línea separadora */}
        <hr className="border-dark mt-4" />

        {/* Texto centrado final */}
        <div className="text-center mt-3 fs-6">
          © Pickurfit 2025
        </div>
      </Container>
    </footer>
  );
}

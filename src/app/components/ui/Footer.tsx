"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          {/* Brand */}
          <h3 className="footer-brand">PickurFit</h3>

          {/* Links */}
          <div className="footer-links">
            {/* Gmail */}
            <a
              href="mailto:mariofernandosantacruzp@gmail.com"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviar email"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gmail.svg"
                alt="Gmail"
              />
              Gmail
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/+573185279720"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg"
                alt="WhatsApp"
              />
              WhatsApp
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/hamil312/outfit-gen"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ir a GitHub"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg"
                alt="GitHub"
              />
              GitHub
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Copyright */}
        <div className="footer-bottom">
          © PickurFit 2025 • Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
"use client";
import React from "react";
import Link from "next/link";
import AppNavbar from "@/app/components/ui/Navbar";
import Footer from "@/app/components/ui/Footer";
import { BsClockHistory } from "react-icons/bs";
import { GiClothes } from "react-icons/gi";
import { GiCoffeeMug } from "react-icons/gi";
import { FaGlasses } from "react-icons/fa";
import { BsStars } from "react-icons/bs";

export default function Home() {
  // Tags mostrados debajo del título principal en el hero, para dar una idea de las categorías de atuendos que se pueden generar
  const categoryTags = [
    "Atuendo deportivo",
    "Ocasión elegante",
    "Outfit casual",
    "Noche de fiesta",
    "Salida a la playa",
  ];

  // Cards de los miembros del equipo mostrados en la sección "Acerca de nosotros" al final de la página, con su nombre, rol, foto y enlace a LinkedIn
  const teamMembers = [
    {
      name: "Mario Fernando Santacruz Pantoja",
      role: "Estudiante de Ingeniería de Software",
      linkedin: "Linkedin personal",
      linkedinUrl: "https://www.linkedin.com/in/mario-santa",
      icon: <GiCoffeeMug size={28} className="text-[#1a2b32]" />,
      photo: "/team/profile_image_mario.jpg",
    },
    {
      name: "Hamilton Santiago Insandara Alvarez",
      role: "Estudiante de Ingeniería de Software",
      linkedin: "Linkedin personal",
      linkedinUrl: "https://www.linkedin.com/in/hamilton-insandar%C3%A1-b08047325",
      icon: <FaGlasses size={28} className="text-[#1a2b32]" />,
      photo: "/team/profile_image_hamilton.jpg",
    },
  ];

  // Cards de características mostrados en la sección principal de la página, con una imagen ilustrativa, título, descripción y estadística relevante para destacar los beneficios de usar el generador de atuendos
  const featureSections = [
    {
      image: "/figmaAssets/image-4.png",
      imgWide: true,
      description:
        "Explora nuestras opciones, muestranos tus ideas y prendas para crear un atuendo ideal para tu ocasión. Si necesitas inspiracion mira tu feed buscando atuendos creados por la comunidad.",
      title: "Opciones de generación de atuendos",
      stats:
        "El guardarropa promedio cuenta con 152 artículos de los cuales se usan con regularidad tan solo el 44%",
      icon: <GiClothes className="home-stat-icon" />,
    },
    {
      image: "/figmaAssets/image-8.png",
      imgWide: false,
      description:
        "¿No te parece adecuado el atuendo generado? ¡No pasa nada! Vuelve a intentarlo las veces que quieras hasta que creas que es el indicado",
      title: "Opciones de regeneración de atuendos",
      stats:
        "En promedio las mujeres tardan 17 minutos en elegir un atuendo y los hombres tardan 13, esto se traduce en 4 y 3 días cada año",
      icon: <BsClockHistory className="home-stat-icon" />,
    },
  ];

  return (
    <div className="home-root">
      <AppNavbar />

      <main>

        {/* ── Hero ── */}
        <section className="home-hero">
          <div className="home-hero-inner">
            <p className="home-eyebrow">Generador de outfits inteligente</p>
            <h1 className="home-title">
              Sube, personaliza y crea<br />tu atuendo
            </h1>
            <div className="home-tags-row">
              {categoryTags.map((tag, i) => (
                <span key={i} className="home-tag">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Banda azul ── */}
        <div className="home-blue-band">

          {/* Intro + CTA */}
          <div className="home-intro-block">
            <p className="home-intro-text">
              ¿Necesitas ayuda para crear un atuendo? Aquí podrás generar un
              atuendo de forma rápida para cada ocasión.
            </p>
            <Link href="/generator" className="no-underline">
              <button className="home-cta-btn">
                <BsStars size={17} className="mr-2 inline-block align-middle" aria-hidden="true" />
                Empieza a generar
              </button>
            </Link>
          </div>

          <div className="home-divider" />

          <h2 className="home-section-title">
            Dinos tu ocasión, proporciona tus prendas y déjanos el resto&hellip;
          </h2>

          {/* Video container */}
          <div className="home-video-container">
            <video 
              width="100%" 
              height="auto" 
              controls
              className="home-video"
            >
              <source src="/home_video/home_pickurfit_video.mp4" type="video/mp4" />
              Tu navegador no soporta la etiqueta de video
            </video>
          </div>

          {/* Cards de funciones */}
          <div className="home-features-grid">
            {featureSections.map((sec, i) => (
              <div key={i} className="home-feature-card">
                <div className="home-feature-img-wrap">
                  <img
                    src={sec.image}
                    alt={sec.title}
                    className={`home-feature-img ${sec.imgWide ? "home-feature-img--wide" : "home-feature-img--narrow"}`}
                  />
                </div>
                <div className="home-feature-body">
                  <p className="home-feature-desc">{sec.description}</p>
                  <h3 className="home-feature-title">{sec.title}</h3>
                  <div className="home-stat-box">
                    <div className="home-stat-icon-wrap">{sec.icon}</div>
                    <p className="home-stat-text">{sec.stats}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Sobre nosotros ── */}
          <section id="about-us" className="home-about-section">
            <div className="home-divider" />
            <h2 className="home-section-title">Acerca de nosotros</h2>
            <div className="home-team-grid">
              {teamMembers.map((member, i) => (
                <div key={i} className="home-member-card">
                  <img
                    src={member.photo}
                    alt={`Foto de ${member.name}, ${member.role}`}
                    className="home-member-photo"
                  />
                  <div className="home-member-info">
                    <p className="home-member-name">{member.name}</p>
                    <p className="home-member-role">{member.role}</p>
                    <div className="home-member-footer">
                      <div className="home-member-icon-wrap">
                        {member.icon}
                      </div>
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="home-member-link"
                        aria-label={`Enlace al perfil de LinkedIn de ${member.name}`}
                      >
                        {member.linkedin}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
      <div id="footer">
        <Footer />
      </div>
    </div>
  );
}
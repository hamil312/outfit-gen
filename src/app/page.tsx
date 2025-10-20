"use client";
import React from "react";
import { Badge } from "./components/ui/badge";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Link from "next/link";
import AppNavbar from "@/app/components/ui/Navbar";
import { BsClockHistory } from "react-icons/bs";
import { GiClothes } from "react-icons/gi";
import router from "next/router";

export default function Home() {
  const categoryTags = [
    "Atuendo deportivo",
    "Ocasion elegante",
    "Outfit casual",
    "Noche de fiesta",
    "Salida a la playa",
  ];

  const teamMembers = [
    {
      name: "Mario Fernando Santacruz Pantoja",
      role: "Estudiante de Ingenieria de Software",
      linkedin: "Linkedin personal",
      profileIcon: "/figmaAssets/intersect.svg",
    },
    {
      name: "Hamilton Santiago Insandara Alvarez",
      role: "Estudiante de Ingeniería de Software",
      linkedin: "Linkedin personal",
      profileIcon: "/figmaAssets/intersect.svg",
    },
  ];

  const featureSections = [
    {
      image: "/figmaAssets/image-4.png",
      description: "Explora nuestras opciones, muestranos tus ideas y prendas para crear un atuendo ideal para tu ocasión",
      title: "¡Dale provecho a tu guarda ropa!",
      stats: "El guardarropa promedio cuenta con 152 artículos de los cuales se usan con regularidad tan solo el 44%"
    },
    {
      image: "/figmaAssets/image-8.png",
      description: "¿No te parece aduecuado el atuendo generado? No pasa nada! vuelve a intentarlo las veces que quieras hasta que creas que es el indicado",
      title: "¡No pierdas mas tu Tiempo!",
      stats: "En promedio las mujeres tardan 17 minutos en elegir un atuendo y los hombres tardan 13, esto se traduce en 4 y 3 días cada año"
    }
  ];

  const contactInfo = [
    {
      icon: "/figmaAssets/image-11.png",
      text: "3148328356",
    },
    {
      icon: "/figmaAssets/image-12.png",
      text: "github",
    },
    {
      icon: "/figmaAssets/image-13.png",
      text: "outfitgen@gmail.com",
      isLink: true,
    },
  ];

  return (
    <div className="bg-[#ffffff] w-full">
      <AppNavbar />

      <main>
        {/* Hero Section */}
        <section className="pt-5 pb-5 px-4">
          <h1 className="text-center text-4xl md:text-5xl font-bold max-w-4xl mx-auto mb-8">
            Sube, personaliza y crea tu atuendo
          </h1>

          {/* Category Tags */}
          <div className="flex flex-wrap gap-4 justify-center mb-8 max-w-4xl mx-auto">
            {categoryTags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="flex items-center justify-center px-4 py-2 rounded-[30px] border border-solid border-[#000000]"
              >
                <span className="font-normal text-[#000000] text-xs">
                  {tag}
                </span>
              </Badge>
            ))}
          </div>
        </section>

        {/* Main Content Section with Background */}
        <div className="bg-[#d9d9d9] shadow-m3-elevation-light-2 py-16 pt-5">
          {/* Description Section */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <p className="text-center text-2xl md:text-3xl mb-8">
              ¿Necesitas ayuda para crear un atuendo? Aquí podras generar un atuendo
              de forma rapida para cada ocasión.
            </p>
            
            <div className="flex justify-center">
              <Link href="/generator">
                <Button
                  variant="outline-dark"
                  className="border-2 hover:bg-[#FCC4C4] hover:border-[#FCC4C4] hover:text-white transition-colors"
                  onClick={() => router.push("/generator")}
                >
                  Empieza a generar
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Description */}
          <div className="max-w-6xl mx-auto px-4 mb-16 pt-5">
            <h2 className="text-center text-2xl md:text-3xl font-bold mb-12">
              Dinos tu ocasión, proporciona tus prendas y dejanos el resto...
            </h2>

            {/* Feature Cards Row - Two Columns */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              {featureSections.map((section, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    className={`${index === 0 ? 'w-[292px]' : 'w-[213px]'} h-[329px] mb-6 ${index === 1 ? 'rounded-[11px]' : ''} object-cover`}
                    alt={section.title}
                    src={section.image}
                  />
                  <p className="text-xl md:text-2xl text-center mb-4 w-[350px] pt-4">
                    {section.description}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-center mb-4 pt-5">
                    {section.title}
                  </h3>
                  <p className="text-xl md:text-2xl text-center mb-4 w-[350px]">
                    {section.stats}
                  </p>
                  {index === 0 ? (
                    <GiClothes className="text-[145px] mt-3" />
                  ) : (
                    <BsClockHistory className="text-[120px] mt-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* About Us Section */}
          <section className="max-w-6xl mx-auto px-4 py-16 pt-5">
            <h2 className="text-center text-4xl md:text-5xl font-bold mb-16">
              Acerca de nosotros
            </h2>

            {/* Team Members - Two Columns */}
            <div className="grid grid-cols-2 gap-8 pt-5">
              {teamMembers.map((member, index) => (
                <div key={index}>
                  <Card style={{ width: '100%', maxWidth: '22rem', borderColor: '#5CA2AE', borderWidth: '3px', margin: '0 auto' }}>
                    <div className="text-center pt-4">
                      <img
                        className="w-[146px] h-[146px] rounded-full object-cover mx-auto"
                        alt={member.name}
                      />
                    </div>
                    <Card.Body>
                      <Card.Title className="text-center text-xl">
                        {member.name}
                      </Card.Title>
                      <Card.Text className="text-center text-lg mb-3">
                        {member.role}
                      </Card.Text>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center bg-white rounded-full w-[52px] h-[52px] border-2 border-solid border-[#1a1a1a]">
                          <img
                            className="w-[48.72px] h-[39px]"
                            alt="LinkedIn"
                            src={member.profileIcon}
                          />
                        </div>
                        <p className="text-center text-lg">
                          {member.linkedin}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#000000] py-16 pt-3">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-center text-4xl md:text-5xl font-bold text-neutral-50 mb-12">
            Contactanos
          </h2>

          <div className="flex flex-col items-center gap-8">
            {contactInfo.map((contact, index) => (
              <div key={index} className="flex items-center gap-4">
                <img
                  className="w-[41px] h-[41px] object-cover"
                  alt="Contact icon"
                  src={contact.icon}
                />
                {contact.isLink ? (
                  <a
                    className="text-[#ffffff] text-2xl md:text-3xl underline hover:text-gray-300 transition-colors"
                    href={`mailto:${contact.text}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {contact.text}
                  </a>
                ) : (
                  <div className="text-[#ffffff] text-2xl md:text-3xl">
                    {contact.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
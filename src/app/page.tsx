"use client";
import React from "react";
import { Badge } from "./components/ui/badge";
import { Card, CardContent } from "./components/ui/card";
import { JSX } from "react/jsx-runtime";
import Button from 'react-bootstrap/Button';

export const home = (): JSX.Element => {
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
      image: "/figmaAssets/image-10.png",
      linkedin: "Linkedin personal",
      profileIcon: "/figmaAssets/intersect.svg",
    },
    {
      name: "Hamilton Santiago Insandara Alvarez",
      role: "Estudiante de Ingeniería de Software",
      image: "/figmaAssets/image-9.png",
      linkedin: "Linkedin personal",
      profileIcon: "/figmaAssets/intersect.svg",
    },
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
    <div className="bg-[#ffffff] overflow-hidden w-full min-w-full h-[2836px] relative">
      <header className="w-full h-[110px] flex items-center justify-between bg-[#ffffff] shadow-small px-8">
        <div className="h-[100px] w-[100px] bg-white rounded-sm overflow-hidden border-2 border-solid border-[#1a1a1a] flex items-center justify-center">
          <img
            className="w-[96.89%] h-[96.89%]"
            alt="Vector"
            src="/figmaAssets/vector-364.svg"
          />
          <img
            className="w-[96.89%] h-[96.89%]"
            alt="Vector"
            src="/figmaAssets/vector-365.svg"
          />
        </div>

        <nav className="flex items-center gap-2">
          
          <Button
            variant="primary"
            className="bg-white rounded-lg border-2 border-solid border-[#1a1a1a] px-10 py-2"
            onClick={() => window.location.href = "/generator"}
          >
            <span className="font-patrick-hand-body-lg text-black">Empieza a generar</span>
          </Button>
          <span className="font-patrick-hand-body-lg text-black">Acerca de</span>
          <span className="font-patrick-hand-body-lg text-black">Contactanos</span>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            className="bg-white rounded-lg border-2 border-solid border-[#1a1a1a] px-4 py-2"
            variant="outline"
          >
            <span className="font-patrick-hand-body-lg text-black">Iniciar sesion</span>
          </Button>
          <Button
            className="bg-white rounded-lg border-2 border-solid border-[#1a1a1a] px-4 py-2"
            variant="outline"
          >
            <span className="font-patrick-hand-body-lg text-black">Registrarse</span>
          </Button>
          <div className="w-[58px] h-[58px] flex items-center justify-center bg-white rounded-full overflow-hidden border-2 border-solid border-[#1a1a1a]">
            <img
              className="w-[54px] h-[44px]"
              alt="Intersect"
              src="/figmaAssets/intersect.svg"
            />
          </div>
        </div>
      </header>

      <main>
        <section className="absolute top-[150px] left-[calc(50.00%_-_500px)] w-[1000px] font-inter-display-lg font-[number:var(--inter-display-lg-font-weight)] text-black text-[length:var(--inter-display-lg-font-size)] text-center tracking-[var(--inter-display-lg-letter-spacing)] leading-[var(--inter-display-lg-line-height)] [font-style:var(--inter-display-lg-font-style)]">
          Sube, personaliza y crea tu atuendo
        </section>

        <div className="top-[344px] h-[2743px] bg-[#d9d9d9] shadow-m3-elevation-light-2 absolute left-0 w-full" />

        <div className="flex gap-[29px] absolute top-[257px] left-[271px]">
          {categoryTags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex w-[125px] h-[34px] items-center justify-center gap-2.5 px-2 py-1 rounded-[30px] border border-solid border-[#000000]"
            >
              <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#000000] text-xs text-center tracking-[0.20px] leading-[normal]">
                {tag}
              </div>
            </Badge>
          ))}
        </div>

        <div className="absolute top-[369px] left-[281px] w-[719px] [font-family:'Patrick_Hand',Helvetica] font-normal text-[#000000] text-[32px] text-center tracking-[0] leading-7">
          ¿Necesitas ayuda para crear un atuendo? Aquí podras generar un atuendo
          de forma rapida para cada ocasión.
        </div>

        <Button
          className="h-auto flex w-[171px] top-[466px] left-[calc(50.00%_-_85px)] items-center gap-1.5 pt-[5px] pb-[7px] px-2.5 absolute bg-white rounded-lg border-2 border-solid border-[#1a1a1a]"
          variant="outline"
          onClick={() => window.location.href = "/generator"}
        >
          <div className="relative flex items-center justify-center w-fit font-patrick-hand-body-lg font-[number:var(--patrick-hand-body-lg-font-weight)] text-black text-[length:var(--patrick-hand-body-lg-font-size)] text-center tracking-[var(--patrick-hand-body-lg-letter-spacing)] leading-[var(--patrick-hand-body-lg-line-height)] whitespace-nowrap [font-style:var(--patrick-hand-body-lg-font-style)]">
            Empieza a generar
          </div>
        </Button>

        <div className="flex w-[91px] h-1.5 items-center px-0 py-1.5 absolute top-[528px] left-[442px] rotate-[-10deg]">
          <img
            className="relative flex-1 grow h-[20.77px] mt-[-13.68px] mb-[-13.09px] ml-[-0.64px] mr-[-0.64px] rotate-[10deg]"
            alt="Vector"
            src="/figmaAssets/vector-488-1.svg"
          />
          <img
            className="absolute top-[calc(50.00%_-_12px)] right-[-9px] w-[21px] h-[22px] rotate-[10deg]"
            alt="Vector"
            src="/figmaAssets/vector-489.svg"
          />
        </div>

        <div className="top-[474px] left-[442px] rotate-[10deg] flex w-[91px] h-1.5 items-center px-0 py-1.5 absolute">
          <img
            className="h-[18.36px] mt-[-12.18px] mb-[-12.18px] rotate-[-10deg] relative flex-1 grow"
            alt="Vector"
            src="/figmaAssets/vector-488-3.svg"
          />
          <img
            className="rotate-[-10deg] absolute top-[calc(50.00%_-_12px)] right-[-9px] w-[21px] h-[22px]"
            alt="Vector"
            src="/figmaAssets/vector-489-1.svg"
          />
        </div>

        <div className="top-[468px] left-[752px] rotate-[170deg] flex w-[91px] h-1.5 items-center px-0 py-1.5 absolute">
          <img
            className="h-[20.77px] mt-[-13.68px] mb-[-13.09px] ml-[-0.64px] mr-[-0.64px] rotate-[-170deg] relative flex-1 grow"
            alt="Vector"
            src="/figmaAssets/vector-488.svg"
          />
          <img
            className="rotate-[-170deg] absolute top-[calc(50.00%_-_12px)] right-[-9px] w-[21px] h-[22px]"
            alt="Vector"
            src="/figmaAssets/vector-489-3.svg"
          />
        </div>

        <div className="top-[524px] left-[755px] rotate-[-170deg] flex w-[91px] h-1.5 items-center px-0 py-1.5 absolute">
          <img
            className="h-[18.36px] mt-[-12.18px] mb-[-12.18px] rotate-[170deg] relative flex-1 grow"
            alt="Vector"
            src="/figmaAssets/vector-488-2.svg"
          />
          <img
            className="rotate-[170deg] absolute top-[calc(50.00%_-_12px)] right-[-9px] w-[21px] h-[22px]"
            alt="Vector"
            src="/figmaAssets/vector-489-2.svg"
          />
        </div>

        <div className="absolute top-[600px] left-[166px] w-[758px] font-inter-display font-[number:var(--inter-display-font-weight)] text-black text-[length:var(--inter-display-font-size)] tracking-[var(--inter-display-letter-spacing)] leading-[var(--inter-display-line-height)] [font-style:var(--inter-display-font-style)]">
          Dinos tu ocasión, proporciona tus prendas y dejanos el resto...
        </div>

        <img
          className="absolute top-[750px] left-[182px] w-[292px] h-[329px]"
          alt="Image"
          src="/figmaAssets/image-4.png"
        />

        <img
          className="absolute top-[750px] left-[810px] w-[213px] h-[329px] rounded-[11px] object-cover"
          alt="Image"
          src="/figmaAssets/image-8.png"
        />

        <div className="absolute top-[1137px] left-[166px] w-[394px] [font-family:'Patrick_Hand',Helvetica] font-normal text-[#000000] text-[32px] tracking-[0] leading-7">
          Explora nuestras opciones, muestranos tus ideas y prendas para crear
          un atuendo ideal para tu ocasión.
        </div>

        <div className="absolute top-[1137px] left-[730px] w-[394px] [font-family:'Patrick_Hand',Helvetica] font-normal text-[#000000] text-[32px] tracking-[0] leading-7">
          ¿No te parece aduecuado el atuendo generado? No pasa nada! vuelve a
          intentarlo las veces que quieras hasta que creas que es el indicado
        </div>

        <div className="absolute top-[1363px] left-[172px] w-[381px] font-inter-display font-[number:var(--inter-display-font-weight)] text-black text-[length:var(--inter-display-font-size)] tracking-[var(--inter-display-letter-spacing)] leading-[var(--inter-display-line-height)] [font-style:var(--inter-display-font-style)]">
          ¡Dale provecho a tu guarda ropa!
        </div>

        <div className="absolute top-[1363px] left-[726px] w-[381px] font-inter-display font-[number:var(--inter-display-font-weight)] text-black text-[length:var(--inter-display-font-size)] tracking-[var(--inter-display-letter-spacing)] leading-[var(--inter-display-line-height)] [font-style:var(--inter-display-font-style)]">
          ¡No pierdas mas tu Tiempo!
        </div>

        <div className="absolute top-[1511px] left-[172px] w-[381px] [font-family:'Patrick_Hand',Helvetica] font-normal text-[#000000] text-[32px] tracking-[0] leading-7">
          El guardarropa promedio cuenta con 152 artículos de los cuales se usan
          con regularidad tan solo el 44%
        </div>

        <div className="absolute top-[1503px] left-[726px] w-[439px] [font-family:'Patrick_Hand',Helvetica] font-normal text-[#000000] text-[32px] tracking-[0] leading-7">
          En promedio las mujeres tardan 17 minutos en elegir un atuendo y los
          hombres tardan 13, esto se traduce en 4 y 3 días respectivamente cada
          año.
        </div>

        <img
          className="absolute top-[1670px] left-[289px] w-[146px] h-[146px] object-cover"
          alt="Image"
          src="/figmaAssets/image-10.png"
        />

        <img
          className="absolute top-[1664px] left-[838px] w-[157px] h-[157px] object-cover"
          alt="Image"
          src="/figmaAssets/image-9.png"
        />

        <div className="top-[calc(50.00%_-_797px)] left-32 absolute w-5 h-5 bg-black rounded-[10px]" />
        <div className="top-[calc(50.00%_+_484px)] left-[97px] absolute w-5 h-5 bg-black rounded-[10px]" />

        <section className="absolute top-[1878px] left-[calc(50.00%_-_502px)] w-[1000px] font-inter-display-lg font-[number:var(--inter-display-lg-font-weight)] text-black text-[length:var(--inter-display-lg-font-size)] tracking-[var(--inter-display-lg-letter-spacing)] leading-[var(--inter-display-lg-line-height)] [font-style:var(--inter-display-lg-font-style)]">
          Acerca de nosotros
        </section>

        <Card className="flex flex-col w-[478px] h-[203px] items-start gap-3 pt-3 pb-[18px] px-4 absolute top-[1978px] left-[138px] bg-white rounded-xl border-[3px] border-solid border-[#1a1a1a] rotate-180 shadow-small">
          <CardContent className="p-0">
            <img
              className="absolute -top-2.5 left-[calc(50.00%_-_13px)] w-[25px] h-4 -rotate-180"
              alt="Top beak"
              src="/figmaAssets/top-beak.svg"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col w-[478px] h-[203px] items-start gap-3 pt-3 pb-[18px] px-4 absolute top-[1980px] left-[708px] bg-white rounded-xl border-[3px] border-solid border-[#1a1a1a] rotate-180 shadow-small">
          <CardContent className="p-0">
            <img
              className="absolute -top-2.5 left-[calc(50.00%_-_13px)] w-[25px] h-4 -rotate-180"
              alt="Top beak"
              src="/figmaAssets/top-beak.svg"
            />
          </CardContent>
        </Card>

        {teamMembers.map((member, index) => (
          <div key={index}>
            <div
              className={`absolute top-[2042px] ${index === 0 ? "left-[166px]" : "left-[732px]"} w-[424px] [font-family:'Patrick_Hand',Helvetica] font-normal text-[#000000] text-[32px] text-center tracking-[0] leading-7`}
            >
              {member.name}
              <br />
              {member.role}
            </div>
            <div
              className={`${index === 0 ? "left-[351px]" : "left-[922px]"} absolute top-[2211px] w-[52px] h-[52px] flex bg-white rounded-[100px] overflow-hidden border-2 border-solid border-[#1a1a1a]`}
            >
              <img
                className="mt-[13px] w-[48.72px] h-[39px] ml-[1.6px]"
                alt="Intersect"
                src={member.profileIcon}
              />
            </div>
            <div
              className={`absolute top-[2277px] ${index === 0 ? "left-[270px]" : "left-[842px]"} w-[214px] [font-family:'Patrick_Hand',Helvetica] font-normal text-[#000000] text-[32px] text-center tracking-[0] leading-7`}
            >
              {member.linkedin}
            </div>
          </div>
        ))}

        <div className="absolute w-[15.78%] h-0 top-[81.52%] left-[21.56%] bg-black rounded-[40px]" />
        <div className="absolute w-[15.78%] h-0 top-[81.52%] left-[66.17%] bg-black rounded-[40px]" />
      </main>

      <footer className="absolute top-[2444px] left-0 w-full h-[392px]">
        <div className="top-0 h-[392px] bg-[#000000] absolute left-0 w-full" />

        <div className="absolute top-[30px] left-[calc(50.00%_-_640px)] w-full text-center font-inter-display-lg font-[number:var(--inter-display-lg-font-weight)] text-neutral-50 text-[length:var(--inter-display-lg-font-size)] tracking-[var(--inter-display-lg-letter-spacing)] leading-[var(--inter-display-lg-line-height)] [font-style:var(--inter-display-lg-font-style)]">
          Contactanos
        </div>

        <div className="flex flex-col items-center justify-center absolute top-[120px] left-[calc(50.00%_-_200px)] w-[400px]">
          {contactInfo.map((contact, index) => (
            <div key={index} className="flex items-center mb-6 w-full justify-center">
              <img
                className="w-[41px] h-[41px] object-cover mr-4"
                alt="Contact icon"
                src={contact.icon}
              />
              {contact.isLink ? (
                <a
                  className="[font-family:'Patrick_Hand',Helvetica] font-normal text-[#ffffff] text-[28px] tracking-[0] leading-7 underline hover:text-gray-300 transition-colors"
                  href={`mailto:${contact.text}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {contact.text}
                </a>
              ) : (
                <div className="[font-family:'Patrick_Hand',Helvetica] font-normal text-[#ffffff] text-[28px] tracking-[0] leading-7">
                  {contact.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};
export default home;
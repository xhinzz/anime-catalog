"use client";

import { LifeBuoy, HelpCircle, Bug, Mail } from "lucide-react";

const cards = [
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Encontre respostas para as perguntas mais frequentes sobre a plataforma.",
    buttonLabel: "Ver perguntas",
  },
  {
    icon: Bug,
    title: "Reportar Bug",
    description: "Encontrou um problema? Nos ajude a melhorar reportando o que aconteceu.",
    buttonLabel: "Reportar",
  },
  {
    icon: Mail,
    title: "Contato",
    description: "Precisa falar conosco? Entre em contato diretamente com a equipe.",
    buttonLabel: "Enviar mensagem",
  },
];

export default function SuportePage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-4">
        <LifeBuoy className="mr-3 h-5 w-5 text-[#7C3AED]" />
        <h1 className="text-[15px] font-semibold text-[#E8E4F4]">Suporte</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-bold text-[#E8E4F4]">
            Como podemos ajudar?
          </h2>
          <p className="mt-1 text-sm text-[#6B6580]">
            Escolha uma das opções abaixo.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col rounded-xl border border-[#1E1A2B] bg-[#110F1A] p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#161320]">
                  <card.icon className="h-5 w-5 text-[#7C3AED]" />
                </div>
                <h3 className="mt-4 text-[14px] font-semibold text-[#E8E4F4]">
                  {card.title}
                </h3>
                <p className="mt-2 flex-1 text-[12px] leading-relaxed text-[#6B6580]">
                  {card.description}
                </p>
                <button className="mt-5 w-full rounded-lg border border-[#1E1A2B] py-2 text-[12px] font-medium text-[#A8A0B8] transition-colors hover:border-[#7C3AED] hover:text-[#E8E4F4]">
                  {card.buttonLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

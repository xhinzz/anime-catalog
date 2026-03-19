"use client";

import { Crown, Check } from "lucide-react";

const plans = [
  {
    name: "Gratuito",
    price: "R$0",
    period: "/mês",
    description: "Para quem está começando",
    featured: false,
    features: [
      "Catálogo completo de animes",
      "Criar até 3 listas",
      "Busca e filtros básicos",
      "Perfil público",
    ],
    buttonLabel: "Plano atual",
    buttonDisabled: true,
  },
  {
    name: "Premium",
    price: "R$9,90",
    period: "/mês",
    description: "Para os fãs dedicados",
    featured: true,
    features: [
      "Tudo do plano Gratuito",
      "Listas ilimitadas",
      "Sem anúncios",
      "Estatísticas avançadas",
      "Badge exclusiva no perfil",
      "Recomendações personalizadas",
    ],
    buttonLabel: "Assinar Premium",
    buttonDisabled: false,
  },
  {
    name: "Apoiador",
    price: "R$19,90",
    period: "/mês",
    description: "Para quem quer apoiar o projeto",
    featured: false,
    features: [
      "Tudo do plano Premium",
      "Nome na página de apoiadores",
      "Acesso antecipado a novidades",
      "Badge especial de apoiador",
      "Suporte prioritário",
      "Influencie novas features",
    ],
    buttonLabel: "Ser Apoiador",
    buttonDisabled: false,
  },
];

export default function PremiumPage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-4">
        <Crown className="mr-3 h-5 w-5 text-[#7C3AED]" />
        <h1 className="text-[15px] font-semibold text-[#E8E4F4]">Premium</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-[#E8E4F4]">
            Escolha seu plano
          </h2>
          <p className="mt-2 text-sm text-[#6B6580]">
            Desbloqueie recursos exclusivos e apoie o projeto.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-6 ${
                plan.featured
                  ? "border-[#7C3AED] bg-[#110F1A] shadow-[0_0_30px_rgba(45,107,255,0.15)]"
                  : "border-[#1E1A2B] bg-[#110F1A]"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#7C3AED] px-4 py-1 text-[11px] font-semibold text-white">
                  Recomendado
                </div>
              )}

              <h3 className="text-[15px] font-semibold text-[#E8E4F4]">
                {plan.name}
              </h3>
              <p className="mt-1 text-[12px] text-[#6B6580]">
                {plan.description}
              </p>

              <div className="mt-5 flex items-baseline">
                <span className="text-3xl font-bold text-[#E8E4F4]">
                  {plan.price}
                </span>
                <span className="ml-1 text-sm text-[#6B6580]">
                  {plan.period}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[13px] text-[#A8A0B8]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7C3AED]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.buttonDisabled}
                className={`mt-6 w-full rounded-lg py-2.5 text-[13px] font-semibold transition-colors ${
                  plan.featured
                    ? "bg-[#7C3AED] text-white hover:bg-[#7C3AED]/90"
                    : plan.buttonDisabled
                    ? "border border-[#1E1A2B] bg-transparent text-[#6B6580] cursor-default"
                    : "border border-[#1E1A2B] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-[#E8E4F4]"
                }`}
              >
                {plan.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

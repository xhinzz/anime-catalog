"use client";

import { Heart } from "lucide-react";

export default function ApoiadoresPage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-4">
        <Heart className="mr-3 h-5 w-5 text-[#7C3AED]" />
        <h1 className="text-[15px] font-semibold text-[#E8E4F4]">Apoiadores</h1>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#161320]">
          <Heart className="h-10 w-10 text-[#6B6580]" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-[#E8E4F4]">
          Nossos Apoiadores
        </h2>
        <p className="mt-2 max-w-sm text-center text-sm text-[#6B6580]">
          Ainda não há apoiadores. Seja o primeiro a apoiar o projeto e tenha seu nome exibido aqui!
        </p>
      </div>
    </div>
  );
}

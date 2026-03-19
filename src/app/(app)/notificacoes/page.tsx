"use client";

import { Bell } from "lucide-react";

export default function NotificacoesPage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-4">
        <Bell className="mr-3 h-5 w-5 text-[#7C3AED]" />
        <h1 className="text-[15px] font-semibold text-[#E8E4F4]">Notificações</h1>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#161320]">
          <Bell className="h-10 w-10 text-[#6B6580]" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-[#E8E4F4]">
          Nenhuma notificação
        </h2>
        <p className="mt-2 text-sm text-[#6B6580]">
          Quando houver novidades, elas aparecerão aqui.
        </p>
      </div>
    </div>
  );
}

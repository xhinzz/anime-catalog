"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

export default function LocaleSwitch() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LOCALES.find((l) => l.code === locale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#6B6580] hover:bg-white/[0.04] hover:text-[#A8A0B8] transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{current?.label}</span>
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-1 z-50 rounded-lg border border-[#1E1A2B] bg-[#161320] p-1 shadow-xl min-w-[100px]">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[12px] font-medium transition-colors",
                locale === l.code
                  ? "bg-[#7C3AED] text-white"
                  : "text-[#A8A0B8] hover:bg-white/[0.04] hover:text-[#E8E4F4]"
              )}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

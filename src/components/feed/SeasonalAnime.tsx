"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import SectionIcon from "../SectionIcon";

interface Item {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
  episodes: number | null;
  type: string;
}

export default function SeasonalAnime({ onDetail }: { onDetail?: (id: number, type: string) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();

  useEffect(() => {
    fetch("/api/feed/seasonal")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#7C3AED]" />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2.5">
        <SectionIcon color="#F59E0B" variant="bar" />
        <h2 className="text-base font-bold text-[#E8E4F4]">Animes da Temporada</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {items.slice(0, 10).map((item, i) => (
          <div
            key={`${item.mal_id}-${i}`}
            onClick={() => onDetail?.(item.mal_id, "anime")}
            className="group flex-shrink-0 w-[140px] cursor-pointer"
          >
            <div className="overflow-hidden rounded-xl border border-[#1E1A2B] transition-all group-hover:border-[#7C3AED]/40 group-hover:-translate-y-1 group-hover:shadow-lg">
              <div className="relative aspect-[3/4.2] overflow-hidden">
                <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                {item.score && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-[#F59E0B]">
                    <Star className="h-2.5 w-2.5 fill-[#F59E0B]" /> {item.score.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-[12px] font-medium text-[#A8A0B8] group-hover:text-[#E8E4F4] transition-colors leading-tight">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

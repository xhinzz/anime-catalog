"use client";

import { useEffect, useState } from "react";
import SectionIcon from "../SectionIcon";

interface Item {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
  episodes: number | null;
  type: string;
}

export default function UpcomingAnime({ onDetail }: { onDetail?: (id: number, type: string) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed/upcoming")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2.5">
        <SectionIcon color="#7C3AED" variant="bar" />
        <h2 className="text-base font-bold text-[#E8E4F4]">Próximos Lançamentos</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {items.slice(0, 10).map((item, i) => (
          <div
            key={`${item.mal_id}-${i}`}
            onClick={() => onDetail?.(item.mal_id, "anime")}
            className="group flex-shrink-0 w-[140px] cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-xl border border-[#1E1A2B] transition-all group-hover:border-[#7C3AED]/40 group-hover:-translate-y-1 group-hover:shadow-lg">
              <div className="aspect-[3/4.2] overflow-hidden">
                <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6">
                <span className="rounded bg-[#7C3AED]/80 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">Em breve</span>
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

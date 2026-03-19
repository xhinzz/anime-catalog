"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import SectionIcon from "../SectionIcon";

interface Item {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
}

export default function TopManga({ onDetail }: { onDetail?: (id: number, type: string) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed/top-manga")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2.5">
        <SectionIcon color="#F97316" variant="bar" />
        <h2 className="text-base font-bold text-[#E8E4F4]">Top Mangás</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={`${item.mal_id}-${i}`}
            onClick={() => onDetail?.(item.mal_id, "manga")}
            className="group relative overflow-hidden rounded-xl border border-[#1E1A2B] cursor-pointer transition-all hover:border-[#F97316]/30 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="aspect-[3/4.2] overflow-hidden">
              <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F97316] text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {item.score && (
                  <span className="flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-[#F59E0B]">
                    <Star className="h-2.5 w-2.5 fill-[#F59E0B]" /> {item.score.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2.5 pt-8">
              <p className="line-clamp-2 text-[11px] font-semibold text-white leading-tight">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

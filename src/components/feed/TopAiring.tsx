"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import SectionIcon from "../SectionIcon";

interface Item {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
  episodes: number | null;
}

export default function TopAiring({ onDetail }: { onDetail?: (id: number, type: string) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();

  useEffect(() => {
    fetch("/api/feed/airing")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2.5">
        <SectionIcon color="#22C55E" variant="bar" />
        <h2 className="text-base font-bold text-[#E8E4F4]">Em Exibição Agora</h2>
        <span className="ml-1 flex items-center gap-1.5 rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#22C55E] tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" /> LIVE
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item, i) => (
          <div
            key={`${item.mal_id}-${i}`}
            onClick={() => onDetail?.(item.mal_id, "anime")}
            className="group flex items-center gap-3 rounded-xl border border-[#1E1A2B] bg-[#161320] p-2.5 cursor-pointer transition-all hover:border-[#22C55E]/30 hover:bg-[#1E1A2B]"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[12px] font-bold text-[#22C55E]">
              {i + 1}
            </span>
            <img src={item.cover_url} alt="" className="h-14 w-10 flex-shrink-0 rounded-lg object-cover" loading="lazy" />
            <div className="flex-1 min-w-0">
              <h3 className="line-clamp-1 text-[13px] font-semibold text-[#E8E4F4] group-hover:text-[#22C55E] transition-colors">
                {item.title}
              </h3>
              <div className="mt-0.5 flex items-center gap-3 text-[11px] text-[#6B6580]">
                {item.score && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" /> {item.score.toFixed(1)}
                  </span>
                )}
                {item.episodes && <span>{item.episodes} eps</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

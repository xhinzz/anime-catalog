"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

interface AnimeCardProps {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
  type: string;
  isWatched?: boolean;
  isBookmarked?: boolean;
  onToggleWatched?: (id: number) => void;
  onToggleBookmark?: (id: number) => void;
  onDetails?: (id: number, type: string) => void;
}

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect fill='%2312151C' width='200' height='280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B6F85' font-family='sans-serif' font-size='13'%3ESem Imagem%3C/text%3E%3C/svg%3E";

export default function AnimeCard({
  mal_id, title, cover_url, score, type,
  isWatched = false, isBookmarked = false,
  onToggleWatched, onToggleBookmark, onDetails,
}: AnimeCardProps) {
  const [imgSrc, setImgSrc] = useState(cover_url || PLACEHOLDER);

  const { t } = useLocale();

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#1E1A2B] bg-[#161320] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      {/* Bookmark */}
      {onToggleBookmark && (
        <button
          onClick={() => onToggleBookmark(mal_id)}
          className={cn(
            "absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-[14px] transition-all",
            isBookmarked
              ? "bg-[#7C3AED] text-white"
              : "bg-black/50 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-black/80"
          )}
        >
          {isBookmarked ? "✓" : "+"}
        </button>
      )}

      {/* Image */}
      <div className="aspect-[3/4.2] overflow-hidden">
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc(PLACEHOLDER)}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-tight text-[#E8E4F4]">
          {title}
        </h3>
        {score && (
          <div className="flex items-center gap-1 text-[12px] text-[#6B6580]">
            <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
            {score.toFixed(1)}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 mt-1">
          <button
            onClick={() => onDetails?.(mal_id, type)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#7C3AED] px-2 py-1.5 text-[11px] font-semibold text-white uppercase tracking-wide transition-colors hover:bg-[#9B5CFF]"
          >
            {t("detalhes")}
          </button>
          {onToggleWatched && (
            <button
              onClick={() => onToggleWatched(mal_id)}
              className={cn(
                "flex flex-1 items-center justify-center rounded-lg border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all",
                isWatched
                  ? "border-[#7C3AED] bg-[#7C3AED] text-white hover:bg-[#9B5CFF]"
                  : "border-[#2A2538] text-[#6B6580] hover:border-[#7C3AED] hover:text-[#7C3AED]"
              )}
            >
              {isWatched ? t("visto") : t("assistir")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

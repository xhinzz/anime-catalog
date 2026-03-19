"use client";

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

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect fill='%23161320' width='200' height='280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B6580' font-family='sans-serif' font-size='13'%3ESem Imagem%3C/text%3E%3C/svg%3E";

export default function AnimeCard({
  mal_id, title, cover_url, score, type,
  isWatched = false, isBookmarked = false,
  onToggleWatched, onToggleBookmark, onDetails,
}: AnimeCardProps) {
  const [imgSrc, setImgSrc] = useState(cover_url || PLACEHOLDER);
  const { t } = useLocale();

  return (
    <div
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
      onClick={() => onDetails?.(mal_id, type)}
    >
      {/* Full image background */}
      <div className="aspect-[3/4.3] overflow-hidden">
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgSrc(PLACEHOLDER)}
          loading="lazy"
        />
      </div>

      {/* Gradient overlay - always visible at bottom, full on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

      {/* Score badge - top left */}
      {score && (
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-sm px-2 py-1">
          <span className="text-[11px] font-black text-[#F59E0B]">{score.toFixed(1)}</span>
        </div>
      )}

      {/* Bookmark - top right */}
      {onToggleBookmark && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(mal_id); }}
          className={cn(
            "absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold transition-all",
            isBookmarked
              ? "bg-[#7C3AED] text-white"
              : "bg-black/40 backdrop-blur-sm text-white/50 opacity-0 group-hover:opacity-100 hover:bg-[#7C3AED] hover:text-white"
          )}
        >
          {isBookmarked ? "✓" : "+"}
        </button>
      )}

      {/* Content overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-white drop-shadow-lg">
          {title}
        </h3>

        {/* Action buttons - appear on hover */}
        <div className="flex gap-1.5 mt-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); onDetails?.(mal_id, type); }}
            className="flex flex-1 items-center justify-center rounded-lg bg-[#7C3AED] py-2 text-[10px] font-bold text-white uppercase tracking-wider hover:bg-[#9B5CFF] transition-colors"
          >
            {t("detalhes")}
          </button>
          {onToggleWatched && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWatched(mal_id); }}
              className={cn(
                "flex flex-1 items-center justify-center rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all",
                isWatched
                  ? "bg-white/20 backdrop-blur-sm text-white"
                  : "bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white"
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

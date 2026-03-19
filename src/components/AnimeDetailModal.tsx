"use client";

import { useEffect, useState } from "react";
import { X, Star, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailData {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  cover_url: string;
  score: number | null;
  scored_by: number | null;
  synopsis: string;
  type: string;
  status: string;
  episodes: number | null;
  duration: string | null;
  rating: string | null;
  year: number | null;
  season: string | null;
  genres: { id: number; name: string }[];
  studios: string[];
  trailer_url: string | null;
}

interface Props {
  itemId: number;
  itemType: "anime" | "manga";
  onClose: () => void;
}

export default function AnimeDetailModal({ itemId, itemType, onClose }: Props) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // User actions
  const [isWatched, setIsWatched] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [currentEp, setCurrentEp] = useState(0);
  const [totalEp, setTotalEp] = useState<number | null>(null);

  // Rating
  const [userStars, setUserStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [ratingMsg, setRatingMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/jikan/${itemType}/details/${itemId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));

    // Load user states
    fetch(`/api/user/watched/${itemType}/${itemId}`).then((r) => r.json()).then((d) => setIsWatched(d.watched)).catch(() => {});
    fetch(`/api/user/watchlater/${itemType}/${itemId}`).then((r) => r.json()).then((d) => setIsWatchLater(d.saved)).catch(() => {});
    fetch(`/api/user/favorite/${itemType}/${itemId}`).then((r) => r.json()).then((d) => setIsFavorited(d.favorited)).catch(() => {});
    fetch(`/api/user/currently-watching/${itemType}/${itemId}`).then((r) => r.json()).then((d) => {
      setIsWatching(d.watching); setCurrentEp(d.currentEpisode || 0); setTotalEp(d.totalEpisodes);
    }).catch(() => {});
    fetch(`/api/user/rating/${itemType}/${itemId}`).then((r) => r.json()).then((d) => { if (d?.rating) setUserStars(d.rating.stars); }).catch(() => {});
  }, [itemId, itemType]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleAction = async (endpoint: string, isActive: boolean, setter: (v: boolean) => void) => {
    const method = isActive ? "DELETE" : "POST";
    const body = !isActive && data ? { title: data.title, image_url: data.cover_url, score: data.score } : undefined;
    const res = await fetch(`/api/user/${endpoint}/${itemType}/${itemId}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await res.json();
    if (d.success) setter(!isActive);
  };

  const toggleWatching = async () => {
    if (isWatching) {
      await fetch(`/api/user/currently-watching/${itemType}/${itemId}`, { method: "DELETE" });
      setIsWatching(false); setCurrentEp(0);
    } else {
      await fetch(`/api/user/currently-watching/${itemType}/${itemId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data?.title, image_url: data?.cover_url, totalEpisodes: data?.episodes, currentEpisode: 0 }),
      });
      setIsWatching(true); setTotalEp(data?.episodes ?? null);
    }
  };

  const updateEp = async (ep: number) => {
    const newEp = Math.max(0, Math.min(ep, totalEp ?? 9999));
    setCurrentEp(newEp);
    await fetch(`/api/user/currently-watching/${itemType}/${itemId}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentEpisode: newEp }),
    });
  };

  const saveRating = async (stars: number) => {
    setUserStars(stars);
    const res = await fetch(`/api/user/rating/${itemType}/${itemId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, comment: "" }),
    });
    if ((await res.json()).success) {
      setRatingMsg("Salvo!");
      setTimeout(() => setRatingMsg(""), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1E1A2B] bg-[#110F1A] shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-7 w-7 animate-spin text-[#7C3AED]" />
            <span className="ml-3 text-sm text-[#6B6580]">Carregando...</span>
          </div>
        ) : !data ? (
          <div className="py-24 text-center text-[#6B6580]">Erro ao carregar detalhes.</div>
        ) : (
          <div className="p-6">
            {/* Header: cover + info */}
            <div className="flex gap-5">
              <img src={data.cover_url} alt={data.title} className="h-[240px] w-[170px] flex-shrink-0 rounded-xl object-cover shadow-lg" />
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-xl font-bold text-[#E8E4F4] leading-tight">{data.title}</h2>
                {data.title_japanese && <p className="mt-1 text-[13px] text-[#6B6580]">{data.title_japanese}</p>}

                {/* Chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.type && <span className="rounded-md bg-[#7C3AED]/15 px-2.5 py-1 text-[11px] font-semibold text-[#7C3AED]">{data.type}</span>}
                  {data.status && <span className="rounded-md bg-[#161320] px-2.5 py-1 text-[11px] font-medium text-[#A8A0B8] border border-[#1E1A2B]">{data.status}</span>}
                  {data.year && <span className="rounded-md bg-[#161320] px-2.5 py-1 text-[11px] font-medium text-[#A8A0B8] border border-[#1E1A2B]">{data.year}</span>}
                </div>

                {/* Score + meta */}
                <div className="mt-3 flex items-center gap-4 text-[13px] text-[#A8A0B8]">
                  {data.score && (
                    <span className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-[#F59E0B]">{data.score.toFixed(1)}</span>
                      <span className="text-[10px] text-[#6B6580]">/10</span>
                    </span>
                  )}
                  {data.episodes && <span>{data.episodes} {itemType === "anime" ? "eps" : "caps"}</span>}
                  {data.duration && <span>{data.duration}</span>}
                </div>

                {data.studios.length > 0 && (
                  <p className="mt-2 text-[12px] text-[#6B6580]">
                    <span className="font-semibold text-[#A8A0B8]">{itemType === "anime" ? "Estúdio" : "Autor"}</span> · {data.studios.join(", ")}
                  </p>
                )}

                {/* Genres */}
                {data.genres.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {data.genres.map((g) => (
                      <span key={g.id} className="rounded-full bg-[#7C3AED]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#9B7DD4]">{g.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-[#1E1A2B] pt-5">
              <button
                onClick={() => toggleAction("watched", isWatched, setIsWatched)}
                className={cn(
                  "rounded-xl px-4 py-2 text-[12px] font-semibold transition-all",
                  isWatched ? "bg-[#7C3AED] text-white" : "border border-[#2A2538] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-white"
                )}
              >
                {isWatched ? (itemType === "anime" ? "✓ Assistido" : "✓ Lido") : (itemType === "anime" ? "Marcar Assistido" : "Marcar Lido")}
              </button>
              <button
                onClick={() => toggleAction("watchlater", isWatchLater, setIsWatchLater)}
                className={cn(
                  "rounded-xl px-4 py-2 text-[12px] font-semibold transition-all",
                  isWatchLater ? "bg-[#161320] border border-[#7C3AED] text-[#7C3AED]" : "border border-[#2A2538] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-white"
                )}
              >
                {isWatchLater ? (itemType === "anime" ? "✓ Ver Depois" : "✓ Ler Depois") : (itemType === "anime" ? "Ver Depois" : "Ler Depois")}
              </button>
              <button
                onClick={() => toggleAction("favorite", isFavorited, setIsFavorited)}
                className={cn(
                  "rounded-xl px-4 py-2 text-[12px] font-semibold transition-all",
                  isFavorited ? "bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B]" : "border border-[#2A2538] text-[#A8A0B8] hover:border-[#F59E0B] hover:text-[#F59E0B]"
                )}
              >
                {isFavorited ? "★ Favoritado" : "☆ Favoritar"}
              </button>
              <button
                onClick={toggleWatching}
                className={cn(
                  "rounded-xl px-4 py-2 text-[12px] font-semibold transition-all",
                  isWatching
                    ? "bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E]"
                    : "border border-[#2A2538] text-[#A8A0B8] hover:border-[#22C55E] hover:text-[#22C55E]"
                )}
              >
                {isWatching ? (itemType === "anime" ? "▶ Assistindo" : "▶ Lendo") : (itemType === "anime" ? "Assistindo" : "Lendo")}
              </button>
            </div>

            {/* Episode tracker */}
            {isWatching && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#1E1A2B] bg-[#161320] p-2.5">
                <span className="text-[11px] text-[#6B6580]">{itemType === "anime" ? "Ep." : "Cap."}</span>
                <button onClick={() => updateEp(currentEp - 1)} className="flex h-6 w-6 items-center justify-center rounded border border-[#2A2538] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-white text-xs font-bold">−</button>
                <input
                  type="number"
                  value={currentEp}
                  onChange={(e) => updateEp(Number(e.target.value) || 0)}
                  className="w-12 rounded border border-[#2A2538] bg-[#0D0B14] px-1 py-0.5 text-center text-[12px] font-bold text-[#E8E4F4] outline-none focus:border-[#7C3AED] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-[11px] text-[#6B6580]">/ {totalEp ?? "?"}</span>
                <button onClick={() => updateEp(currentEp + 1)} className="flex h-6 w-6 items-center justify-center rounded border border-[#2A2538] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-white text-xs font-bold">+</button>
                {totalEp && (
                  <div className="flex-1 h-1.5 rounded-full bg-[#1E1A2B] overflow-hidden ml-1">
                    <div className="h-full rounded-full bg-[#22C55E] transition-all" style={{ width: `${Math.min(100, (currentEp / totalEp) * 100)}%` }} />
                  </div>
                )}
              </div>
            )}

            {/* Quick rating */}
            <div className="mt-4 flex items-center gap-1 border-t border-[#1E1A2B] pt-4">
              <span className="text-[12px] font-medium text-[#6B6580] mr-2">Avaliar:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => saveRating(s)}
                  onMouseEnter={() => setHoverStars(s)}
                  onMouseLeave={() => setHoverStars(0)}
                  className="p-0.5"
                >
                  <Star className={cn(
                    "h-6 w-6 transition-all",
                    (hoverStars || userStars) >= s
                      ? "fill-[#F59E0B] text-[#F59E0B] scale-110"
                      : "text-[#2A2538] hover:text-[#F59E0B]/50"
                  )} />
                </button>
              ))}
              {ratingMsg && <span className="ml-2 text-[11px] font-medium text-[#22C55E]">{ratingMsg}</span>}
            </div>

            {/* Synopsis */}
            <div className="mt-4 border-t border-[#1E1A2B] pt-4">
              <h3 className="mb-2 text-sm font-bold text-[#7C3AED]">Sinopse</h3>
              <p className="max-h-28 overflow-y-auto text-[13px] leading-relaxed text-[#A8A0B8]">{data.synopsis}</p>
            </div>

            {/* Full details link */}
            <div className="mt-4 border-t border-[#1E1A2B] pt-4 flex justify-center">
              <a
                href={`/details/${itemType}/${data.mal_id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#9B5CFF] transition-colors"
              >
                <ExternalLink className="h-4 w-4" /> Expandir Detalhes
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

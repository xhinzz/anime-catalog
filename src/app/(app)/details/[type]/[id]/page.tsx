"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star, Play, BookOpen, Calendar, ArrowLeft, Loader2, Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailData {
  mal_id: number; title: string; title_japanese: string | null; cover_url: string;
  score: number | null; scored_by: number | null; rank: number | null; popularity: number | null;
  synopsis: string; type: string; source: string | null; status: string;
  episodes: number | null; duration: string | null; rating: string | null;
  year: number | null; season: string | null;
  genres: { id: number; name: string }[]; studios: string[];
  trailer_url: string | null;
  relations: { relation: string; entries: { mal_id: number; type: string; name: string }[] }[];
  themes: { openings: string[]; endings: string[] };
}

interface Character {
  id: number; name: string; image: string; role: string;
  voiceActor: { name: string; image: string; language: string } | null;
}

interface StaffMember {
  id: number; name: string; image: string; positions: string[];
}

interface Stats {
  watching: number; completed: number; on_hold: number; dropped: number; plan_to_watch: number;
  scores: { score: number; votes: number; percentage: number }[];
}

const starLabels = ["", "Péssimo", "Ruim", "Bom", "Ótimo", "Excelente"];
const tabList = ["overview", "characters", "staff", "stats"] as const;
type Tab = (typeof tabList)[number];

export default function DetailsPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const router = useRouter();
  const itemType = type === "manga" ? "manga" : "anime";

  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  const [characters, setCharacters] = useState<Character[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [charsLoaded, setCharsLoaded] = useState(false);
  const [staffLoaded, setStaffLoaded] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // User actions
  const [isWatched, setIsWatched] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [currentEp, setCurrentEp] = useState(0);
  const [totalEp, setTotalEp] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  // Rating
  const [userStars, setUserStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingMsg, setRatingMsg] = useState("");
  const [hasRating, setHasRating] = useState(false);

  useEffect(() => {
    fetch(`/api/jikan/${itemType}/details/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
    // Load user states
    fetch(`/api/user/watched/${itemType}/${id}`).then((r) => r.json()).then((d) => setIsWatched(d.watched)).catch(() => {});
    fetch(`/api/user/watchlater/${itemType}/${id}`).then((r) => r.json()).then((d) => setIsWatchLater(d.saved)).catch(() => {});
    fetch(`/api/user/favorite/${itemType}/${id}`).then((r) => r.json()).then((d) => setIsFavorited(d.favorited)).catch(() => {});
    fetch(`/api/user/currently-watching/${itemType}/${id}`).then((r) => r.json()).then((d) => {
      setIsWatching(d.watching);
      setCurrentEp(d.currentEpisode || 0);
      setTotalEp(d.totalEpisodes);
    }).catch(() => {});
    fetch(`/api/user/rating/${itemType}/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.rating) { setUserStars(d.rating.stars); setComment(d.rating.comment || ""); setHasRating(true); } })
      .catch(() => {});
  }, [itemType, id]);

  // Lazy load tabs
  useEffect(() => {
    if (tab === "characters" && !charsLoaded) {
      fetch(`/api/jikan/${itemType}/details/${id}/characters`).then((r) => r.json()).then(setCharacters).catch(() => {});
      setCharsLoaded(true);
    }
    if (tab === "staff" && !staffLoaded) {
      fetch(`/api/jikan/${itemType}/details/${id}/staff`).then((r) => r.json()).then(setStaff).catch(() => {});
      setStaffLoaded(true);
    }
    if (tab === "stats" && !statsLoaded) {
      fetch(`/api/jikan/${itemType}/details/${id}/stats`).then((r) => r.json()).then(setStats).catch(() => {});
      setStatsLoaded(true);
    }
  }, [tab, itemType, id, charsLoaded, staffLoaded, statsLoaded]);

  const saveRating = async () => {
    if (!userStars) return;
    const res = await fetch(`/api/user/rating/${itemType}/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stars: userStars, comment }) });
    const d = await res.json();
    if (d.success) { setHasRating(true); setRatingMsg("Salvo!"); setTimeout(() => setRatingMsg(""), 3000); }
  };
  const deleteRating = async () => {
    const res = await fetch(`/api/user/rating/${itemType}/${id}`, { method: "DELETE" });
    if ((await res.json()).success) { setUserStars(0); setComment(""); setHasRating(false); setRatingMsg("Removido."); setTimeout(() => setRatingMsg(""), 3000); }
  };

  const toggleWatched = async () => {
    const method = isWatched ? "DELETE" : "POST";
    const body = !isWatched && data ? { title: data.title, image_url: data.cover_url, score: data.score } : undefined;
    const res = await fetch(`/api/user/watched/${itemType}/${id}`, {
      method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined,
    });
    if ((await res.json()).success) { setIsWatched(!isWatched); showAction(isWatched ? "Removido dos assistidos" : "Marcado como assistido"); }
  };

  const toggleWatchLater = async () => {
    const method = isWatchLater ? "DELETE" : "POST";
    const body = !isWatchLater && data ? { title: data.title, image_url: data.cover_url, score: data.score } : undefined;
    const res = await fetch(`/api/user/watchlater/${itemType}/${id}`, {
      method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined,
    });
    if ((await res.json()).success) { setIsWatchLater(!isWatchLater); showAction(isWatchLater ? "Removido da lista" : "Adicionado à lista"); }
  };

  const toggleFavorite = async () => {
    const method = isFavorited ? "DELETE" : "POST";
    const body = !isFavorited && data ? { title: data.title, image_url: data.cover_url } : undefined;
    const res = await fetch(`/api/user/favorite/${itemType}/${id}`, {
      method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined,
    });
    const d = await res.json();
    if (d.success) { setIsFavorited(!isFavorited); showAction(isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos"); }
    else if (d.message) showAction(d.message);
  };

  const showAction = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

  const toggleWatching = async () => {
    if (isWatching) {
      await fetch(`/api/user/currently-watching/${itemType}/${id}`, { method: "DELETE" });
      setIsWatching(false);
      setCurrentEp(0);
      showAction("Removido de Assistindo");
    } else {
      await fetch(`/api/user/currently-watching/${itemType}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data?.title, image_url: data?.cover_url, totalEpisodes: data?.episodes, currentEpisode: 0 }),
      });
      setIsWatching(true);
      setTotalEp(data?.episodes ?? null);
      showAction("Adicionado a Assistindo");
    }
  };

  const updateEpisode = async (ep: number) => {
    const newEp = Math.max(0, Math.min(ep, totalEp ?? 9999));
    setCurrentEp(newEp);
    await fetch(`/api/user/currently-watching/${itemType}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentEpisode: newEp }),
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" /></div>;
  if (!data) return <div className="flex h-screen flex-col items-center justify-center gap-4 text-[#6B6580]"><p>Erro ao carregar.</p><button onClick={() => router.back()} className="text-[#7C3AED] hover:underline text-sm">Voltar</button></div>;

  const statusColors: Record<string, string> = { "Currently Airing": "text-green-400", "Finished Airing": "text-blue-400", "Not yet aired": "text-yellow-400", "Publishing": "text-green-400", "Finished": "text-blue-400" };

  return (
    <div className="h-screen overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#1E1A2B] bg-[#0D0B14]/90 backdrop-blur-md px-6 py-3">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] text-[#6B6580] hover:text-[#E8E4F4]"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <span className="text-[13px] text-[#6B6580]">/</span>
        <span className="text-[13px] font-medium text-[#E8E4F4] truncate">{data.title}</span>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="flex gap-8">
          <img src={data.cover_url} alt={data.title} className="w-[220px] flex-shrink-0 rounded-2xl object-cover shadow-2xl border border-[#1E1A2B]" />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-[#E8E4F4] leading-tight">{data.title}</h1>
            {data.title_japanese && <p className="mt-1.5 text-[15px] text-[#6B6580]">{data.title_japanese}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {data.type && <span className="rounded-md bg-[#7C3AED]/15 px-3 py-1.5 text-[12px] font-semibold text-[#7C3AED]">{data.type}</span>}
              {data.status && <span className={cn("rounded-md bg-[#161320] px-3 py-1.5 text-[12px] font-medium border border-[#1E1A2B]", statusColors[data.status] || "text-[#A8A0B8]")}>{data.status}</span>}
              {data.year && <span className="rounded-md bg-[#161320] px-3 py-1.5 text-[12px] font-medium text-[#A8A0B8] border border-[#1E1A2B]">{data.season ? `${data.season} ` : ""}{data.year}</span>}
              {data.source && <span className="rounded-md bg-[#161320] px-3 py-1.5 text-[12px] font-medium text-[#A8A0B8] border border-[#1E1A2B]">{data.source}</span>}
              {data.rating && <span className="rounded-md bg-[#161320] px-3 py-1.5 text-[12px] font-medium text-[#A8A0B8] border border-[#1E1A2B]">{data.rating}</span>}
            </div>
            {/* Stats - clean text-based design, no icons */}
            <div className="mt-5 flex flex-wrap gap-4">
              {data.score && (
                <div className="rounded-xl border border-[#1E1A2B] bg-[#161320] px-4 py-3 min-w-[90px]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#F59E0B] tracking-tight">{data.score.toFixed(1)}</span>
                    <span className="text-[10px] font-medium text-[#6B6580]">/10</span>
                  </div>
                  <p className="text-[10px] text-[#6B6580] mt-0.5">{data.scored_by?.toLocaleString()} votos</p>
                </div>
              )}
              {data.rank && (
                <div className="rounded-xl border border-[#1E1A2B] bg-[#161320] px-4 py-3 min-w-[80px]">
                  <span className="text-2xl font-black text-[#7C3AED] tracking-tight">#{data.rank}</span>
                  <p className="text-[10px] text-[#6B6580] mt-0.5">Ranking</p>
                </div>
              )}
              {data.popularity && (
                <div className="rounded-xl border border-[#1E1A2B] bg-[#161320] px-4 py-3 min-w-[80px]">
                  <span className="text-2xl font-black text-[#22C55E] tracking-tight">#{data.popularity}</span>
                  <p className="text-[10px] text-[#6B6580] mt-0.5">Popularidade</p>
                </div>
              )}
              {data.episodes && (
                <div className="rounded-xl border border-[#1E1A2B] bg-[#161320] px-4 py-3 min-w-[80px]">
                  <span className="text-2xl font-black text-[#E8E4F4] tracking-tight">{data.episodes}</span>
                  <p className="text-[10px] text-[#6B6580] mt-0.5">{itemType === "anime" ? "Episódios" : "Capítulos"}</p>
                </div>
              )}
              {data.duration && (
                <div className="rounded-xl border border-[#1E1A2B] bg-[#161320] px-4 py-3">
                  <span className="text-lg font-bold text-[#E8E4F4] tracking-tight">{data.duration}</span>
                  <p className="text-[10px] text-[#6B6580] mt-0.5">Duração</p>
                </div>
              )}
            </div>
            {/* Studio / Author */}
            {data.studios.length > 0 && (
              <p className="mt-4 text-[13px] text-[#A8A0B8]">
                <span className="font-semibold text-[#E8E4F4]">{itemType === "anime" ? "Estúdio" : "Autor"}</span>
                <span className="mx-2 text-[#2A2538]">·</span>
                {data.studios.join(", ")}
              </p>
            )}
            {/* Genres as pills */}
            {data.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {data.genres.map((g) => (
                  <span key={g.id} className="rounded-full bg-[#7C3AED]/10 px-3 py-1 text-[11px] font-medium text-[#9B7DD4] hover:bg-[#7C3AED]/20 transition-colors cursor-default">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={toggleWatched}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all",
                  isWatched
                    ? "bg-[#7C3AED] text-white hover:bg-[#6D2ED8]"
                    : "border border-[#2A2538] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-white"
                )}
              >
                {isWatched ? (itemType === "anime" ? "✓ Assistido" : "✓ Lido") : (itemType === "anime" ? "Marcar como Assistido" : "Marcar como Lido")}
              </button>
              <button
                onClick={toggleWatchLater}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all",
                  isWatchLater
                    ? "bg-[#161320] border border-[#7C3AED] text-[#7C3AED]"
                    : "border border-[#2A2538] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-white"
                )}
              >
                {isWatchLater ? (itemType === "anime" ? "✓ Assistir Depois" : "✓ Ler Depois") : (itemType === "anime" ? "Assistir Depois" : "Ler Depois")}
              </button>
              <button
                onClick={toggleFavorite}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all",
                  isFavorited
                    ? "bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B]"
                    : "border border-[#2A2538] text-[#A8A0B8] hover:border-[#F59E0B] hover:text-[#F59E0B]"
                )}
              >
                {isFavorited ? "★ Favoritado" : "☆ Favoritar"}
              </button>
              <button
                onClick={toggleWatching}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all",
                  isWatching
                    ? "bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E]"
                    : "border border-[#2A2538] text-[#A8A0B8] hover:border-[#22C55E] hover:text-[#22C55E]"
                )}
              >
                {isWatching ? (itemType === "anime" ? "▶ Assistindo" : "▶ Lendo") : (itemType === "anime" ? "Assistindo Agora" : "Lendo Agora")}
              </button>
            </div>

            {/* Episode tracker */}
            {isWatching && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#1E1A2B] bg-[#161320] p-3">
                <span className="text-[12px] font-medium text-[#6B6580]">
                  {itemType === "anime" ? "Episódio" : "Capítulo"}:
                </span>
                <button
                  onClick={() => updateEpisode(currentEp - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2538] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-white text-sm font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={currentEp}
                  onChange={(e) => updateEpisode(Number(e.target.value) || 0)}
                  className="w-14 rounded-md border border-[#2A2538] bg-[#0D0B14] px-2 py-1 text-center text-[13px] font-bold text-[#E8E4F4] outline-none focus:border-[#7C3AED] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-[12px] text-[#6B6580]">/ {totalEp ?? "?"}</span>
                <button
                  onClick={() => updateEpisode(currentEp + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2538] text-[#A8A0B8] hover:border-[#7C3AED] hover:text-white text-sm font-bold"
                >
                  +
                </button>
                {/* Progress bar */}
                {totalEp && (
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-[#1E1A2B] overflow-hidden">
                      <div className="h-full rounded-full bg-[#22C55E] transition-all" style={{ width: `${Math.min(100, (currentEp / totalEp) * 100)}%` }} />
                    </div>
                    <span className="text-[11px] font-medium text-[#6B6580]">{Math.round((currentEp / totalEp) * 100)}%</span>
                  </div>
                )}
              </div>
            )}

            {actionMsg && (
              <p className="mt-2 text-[12px] font-medium text-[#22C55E]">{actionMsg}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex border-b border-[#1E1A2B]">
          {(["overview", "characters", ...(itemType === "anime" ? ["staff"] : []), "stats"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("relative px-5 py-3 text-[13px] font-medium capitalize", tab === t ? "text-[#7C3AED]" : "text-[#6B6580] hover:text-[#A8A0B8]")}>
              {t === "overview" ? "Visão Geral" : t === "characters" ? "Personagens" : t === "staff" ? "Equipe" : "Estatísticas"}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t bg-[#7C3AED]" />}
            </button>
          ))}
        </div>

        {/* TAB: Overview */}
        {tab === "overview" && (
          <div className="mt-6 space-y-6">
            {/* Synopsis */}
            <div className="rounded-2xl border border-[#1E1A2B] bg-[#110F1A] p-6">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#E8E4F4]"><BookOpen className="h-5 w-5 text-[#7C3AED]" /> Sinopse</h2>
              <p className="text-[14px] leading-relaxed text-[#A8A0B8] whitespace-pre-line">{data.synopsis}</p>
            </div>

            {/* Relations */}
            {data.relations.length > 0 && (
              <div className="rounded-2xl border border-[#1E1A2B] bg-[#110F1A] p-6">
                <h2 className="mb-4 text-base font-bold text-[#7C3AED]">Relações</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.relations.map((r, i) => r.entries.map((e, j) => (
                    <div key={`${i}-${j}`} className="flex items-center gap-3 rounded-xl bg-[#161320] p-3 border border-[#1E1A2B]">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase text-[#7C3AED]">{r.relation}</span>
                        <p className="text-[13px] font-medium text-[#E8E4F4] line-clamp-1">{e.name}</p>
                        <span className="text-[11px] text-[#6B6580]">{e.type}</span>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            )}

            {/* Trailer */}
            {data.trailer_url && (
              <div className="rounded-2xl border border-[#1E1A2B] bg-[#110F1A] overflow-hidden">
                <h2 className="flex items-center gap-2 px-6 pt-5 pb-3 text-base font-bold text-[#E8E4F4]"><Play className="h-5 w-5 text-[#7C3AED]" /> Trailer</h2>
                <div className="aspect-video"><iframe src={data.trailer_url} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
              </div>
            )}

            {/* Themes */}
            {(data.themes.openings.length > 0 || data.themes.endings.length > 0) && (
              <div className="rounded-2xl border border-[#1E1A2B] bg-[#110F1A] p-6">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#E8E4F4]"><Music className="h-5 w-5 text-[#7C3AED]" /> Músicas</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {data.themes.openings.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-[12px] font-bold uppercase text-[#7C3AED]">Openings</h3>
                      <div className="space-y-1.5">{data.themes.openings.map((t, i) => <p key={i} className="text-[12px] text-[#A8A0B8] line-clamp-1">{t}</p>)}</div>
                    </div>
                  )}
                  {data.themes.endings.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-[12px] font-bold uppercase text-[#7C3AED]">Endings</h3>
                      <div className="space-y-1.5">{data.themes.endings.map((t, i) => <p key={i} className="text-[12px] text-[#A8A0B8] line-clamp-1">{t}</p>)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="rounded-2xl border border-[#1E1A2B] bg-[#110F1A] p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#E8E4F4]"><Star className="h-5 w-5 text-[#7C3AED]" /> Sua Avaliação</h2>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setUserStars(s)} onMouseEnter={() => setHoverStars(s)} onMouseLeave={() => setHoverStars(0)} className="group p-0.5">
                    <Star className={cn("h-8 w-8 transition-all", (hoverStars || userStars) >= s ? "fill-[#F59E0B] text-[#F59E0B] scale-110" : "text-[#2A2538] group-hover:text-[#F59E0B]/50")} />
                  </button>
                ))}
                <span className="ml-3 text-[13px] font-medium text-[#A8A0B8]">{starLabels[hoverStars || userStars] || "Selecione"}</span>
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comentário (opcional)..." className="mt-4 w-full rounded-xl border border-[#1E1A2B] bg-[#0D0B14] px-4 py-3 text-[13px] text-[#E8E4F4] outline-none placeholder:text-[#6B6580] focus:border-[#7C3AED] resize-none" rows={3} />
              <div className="mt-3 flex items-center gap-3">
                <button onClick={saveRating} disabled={!userStars} className="rounded-xl bg-[#7C3AED] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#9B5CFF] disabled:opacity-40">Salvar</button>
                {hasRating && <button onClick={deleteRating} className="rounded-xl border border-red-500/30 px-5 py-2.5 text-[13px] font-medium text-red-400 hover:bg-red-500/10">Remover</button>}
                {ratingMsg && <span className="text-[13px] font-medium text-[#22C55E]">{ratingMsg}</span>}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Characters */}
        {tab === "characters" && (
          <div className="mt-6">
            {characters.length === 0 ? (
              <div className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#7C3AED]" /><p className="mt-2 text-sm text-[#6B6580]">Carregando personagens...</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {characters.map((c) => (
                  <div key={c.id} className="flex items-center rounded-xl border border-[#1E1A2B] bg-[#110F1A] overflow-hidden">
                    {/* Character */}
                    <div className="flex flex-1 items-center gap-3 p-3">
                      <img src={c.image} alt={c.name} className="h-16 w-12 flex-shrink-0 rounded-lg object-cover" loading="lazy" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#E8E4F4] line-clamp-1">{c.name}</p>
                        <p className={cn("text-[11px] font-medium", c.role === "Main" ? "text-[#7C3AED]" : "text-[#6B6580]")}>{c.role}</p>
                      </div>
                    </div>
                    {/* Voice Actor */}
                    {c.voiceActor && (
                      <div className="flex flex-1 items-center justify-end gap-3 p-3 border-l border-[#1E1A2B]">
                        <div className="min-w-0 text-right">
                          <p className="text-[13px] font-medium text-[#E8E4F4] line-clamp-1">{c.voiceActor.name}</p>
                          <p className="text-[11px] text-[#6B6580]">{c.voiceActor.language}</p>
                        </div>
                        <img src={c.voiceActor.image} alt={c.voiceActor.name} className="h-16 w-12 flex-shrink-0 rounded-lg object-cover" loading="lazy" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Staff */}
        {tab === "staff" && (
          <div className="mt-6">
            {staff.length === 0 ? (
              <div className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#7C3AED]" /><p className="mt-2 text-sm text-[#6B6580]">Carregando equipe...</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-[#1E1A2B] bg-[#110F1A] p-3">
                    <img src={s.image} alt={s.name} className="h-16 w-12 flex-shrink-0 rounded-lg object-cover" loading="lazy" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#E8E4F4]">{s.name}</p>
                      <p className="text-[11px] text-[#7C3AED]">{s.positions.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Stats */}
        {tab === "stats" && (
          <div className="mt-6">
            {!stats ? (
              <div className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#7C3AED]" /></div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Status Distribution */}
                <div className="rounded-2xl border border-[#1E1A2B] bg-[#110F1A] p-6">
                  <h3 className="mb-4 text-base font-bold text-[#E8E4F4]">Distribuição de Status</h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {[
                      { label: itemType === "anime" ? "Assistindo" : "Lendo", value: stats.watching, color: "bg-green-500" },
                      { label: "Completo", value: stats.completed, color: "bg-blue-500" },
                      { label: "Em espera", value: stats.on_hold, color: "bg-yellow-500" },
                      { label: "Desistiu", value: stats.dropped, color: "bg-red-500" },
                      { label: "Planejando", value: stats.plan_to_watch, color: "bg-purple-500" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <span className={cn("inline-block rounded-full px-3 py-1 text-[11px] font-bold text-white", s.color)}>{s.label}</span>
                        <p className="mt-1 text-[12px] font-bold text-[#E8E4F4]">{s.value.toLocaleString()}</p>
                        <p className="text-[10px] text-[#6B6580]">Users</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="rounded-2xl border border-[#1E1A2B] bg-[#110F1A] p-6">
                  <h3 className="mb-4 text-base font-bold text-[#E8E4F4]">Distribuição de Notas</h3>
                  <div className="space-y-2">
                    {stats.scores.sort((a, b) => b.score - a.score).map((s) => {
                      const maxPct = Math.max(...stats.scores.map((x) => x.percentage), 1);
                      const barW = (s.percentage / maxPct) * 100;
                      const colors = ["", "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#A3E635", "#84CC16", "#22C55E", "#10B981", "#06B6D4", "#7C3AED"];
                      return (
                        <div key={s.score} className="flex items-center gap-3">
                          <span className="w-4 text-right text-[12px] font-bold text-[#E8E4F4]">{s.score}</span>
                          <div className="flex-1 h-5 rounded bg-[#1E1A2B] overflow-hidden">
                            <div className="h-full rounded transition-all" style={{ width: `${barW}%`, backgroundColor: colors[s.score] || "#7C3AED" }} />
                          </div>
                          <span className="w-16 text-right text-[11px] text-[#6B6580]">{s.percentage.toFixed(1)}%</span>
                          <span className="w-16 text-right text-[11px] text-[#6B6580]">{s.votes.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

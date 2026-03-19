"use client";

import { useEffect, useState, useCallback } from "react";
// No icon imports needed for tabs
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import NewsFeed from "@/components/NewsFeed";
import SeasonalAnime from "@/components/feed/SeasonalAnime";
import TopAiring from "@/components/feed/TopAiring";
import UpcomingAnime from "@/components/feed/UpcomingAnime";
import TopManga from "@/components/feed/TopManga";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

type ItemType = "anime";

interface AnimeItem {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
  episodes: number | null;
  type: string;
}

interface Genre {
  id: number;
  name: string;
}

// No tabs - feed shows anime by default

export default function FeedPage() {
  const { t } = useLocale();
  // Feed is anime-only
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreOpen, setGenreOpen] = useState(false);
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [detailModal, setDetailModal] = useState<{ id: number; type: "anime" | "manga" } | null>(null);

  const itemType: ItemType = "anime";

  const fetchItems = useCallback(async (p: number) => {
    setLoading(true);
    try {
      let url: string;
      if (query) {
        url = `/api/jikan/${itemType}/search?q=${encodeURIComponent(query)}&page=${p}&limit=18`;
      } else if (selectedGenre) {
        url = `/api/jikan/${itemType}/genre/${selectedGenre}?page=${p}&limit=18&order_by=${sortBy}&sort=${sortOrder}`;
      } else {
        url = `/api/jikan/${itemType}/popular?page=${p}&limit=18&order_by=${sortBy}&sort=${sortOrder}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
      setTotalPages(data.pagination?.last_visible_page || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [itemType, query, selectedGenre, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
    fetchItems(1);
  }, [fetchItems]);

  useEffect(() => {
    fetchItems(page);
  }, [page, fetchItems]);

  useEffect(() => {
    fetch(`/api/jikan/${itemType}/genres`)
      .then((r) => r.json())
      .then((d) => setGenres(d || []))
      .catch(() => setGenres([]));
  }, [itemType]);

  // No tab change needed

  const handleSearch = () => {
    setSelectedGenre(null);
    setPage(1);
    fetchItems(1);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* No tabs - direct content */}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* News */}
        {/* Feed sections - only show on default anime view */}
        {!query && !selectedGenre && (
          <>
            <NewsFeed />
            <SeasonalAnime onDetail={(id, type) => setDetailModal({ id, type: type as "anime" | "manga" })} />
            <TopAiring onDetail={(id, type) => setDetailModal({ id, type: type as "anime" | "manga" })} />
            <UpcomingAnime onDetail={(id, type) => setDetailModal({ id, type: type as "anime" | "manga" })} />
            <TopManga onDetail={(id, type) => setDetailModal({ id, type: type as "anime" | "manga" })} />
          </>
        )}

        <h2 className="mb-5 text-lg font-bold text-[#E8E4F4]">
          {query
            ? `${t("resultadosPara")} "${query}"`
            : selectedGenre
            ? genres.find((g) => g.id === selectedGenre)?.name
            : `${t("animes")} ${t("populares")}`}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B6580]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
            <span className="ml-3 text-sm">{t("carregando")}</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-[#6B6580]">
            <p className="text-sm">{t("nenhumResultado")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <AnimeCard
                key={item.mal_id}
                {...item}
                type={itemType}
                onDetails={(id, t) => setDetailModal({ id, type: t as "anime" | "manga" })}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-[#1E1A2B] px-3 py-1.5 text-[12px] font-medium text-[#6B6580] hover:bg-[#7C3AED] hover:text-white disabled:opacity-30"
            >
              {t("anterior")}
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                    p === page
                      ? "bg-[#7C3AED] text-white"
                      : "border border-[#1E1A2B] text-[#6B6580] hover:bg-[#7C3AED] hover:text-white"
                  )}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-[#1E1A2B] px-3 py-1.5 text-[12px] font-medium text-[#6B6580] hover:bg-[#7C3AED] hover:text-white disabled:opacity-30"
            >
              {t("proximo")}
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <AnimeDetailModal
          itemId={detailModal.id}
          itemType={detailModal.type}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
}

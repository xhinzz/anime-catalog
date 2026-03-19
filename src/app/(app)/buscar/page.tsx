"use client";

import { useState } from "react";
import { Search, Film, BookOpen, Users, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SearchType = "anime" | "manga" | "users";

interface AnimeResult {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
  type: string;
}

interface UserResult {
  id: number;
  username: string;
  profile_image_url: string;
}

const searchTabs: { key: SearchType; label: string; icon: typeof Film }[] = [
  { key: "anime", label: "Animes", icon: Film },
  { key: "manga", label: "Mangás", icon: BookOpen },
  { key: "users", label: "Usuários", icon: Users },
];

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("anime");
  const [animeResults, setAnimeResults] = useState<AnimeResult[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);

    try {
      if (type === "users") {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setUserResults(data.users || []);
        setAnimeResults([]);
      } else {
        const res = await fetch(`/api/jikan/${type}/search?q=${encodeURIComponent(q)}&limit=20`);
        const data = await res.json();
        setAnimeResults(data.items || []);
        setUserResults([]);
      }
    } catch {
      setAnimeResults([]);
      setUserResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-[#1E1A2B] bg-[#110F1A] px-8 py-5">
        <h1 className="text-lg font-bold text-[#E8E4F4]">Buscar</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Search input */}
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center rounded-2xl border border-[#1E1A2B] bg-[#110F1A] px-5 focus-within:border-[#7C3AED]">
            <Search className="h-5 w-5 text-[#6B6580]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="Buscar animes, mangás ou usuários..."
              autoFocus
              className="w-full bg-transparent px-4 py-4 text-[15px] text-[#E8E4F4] outline-none placeholder:text-[#6B6580]"
            />
          </div>

          {/* Type tabs */}
          <div className="mt-4 flex gap-1 border-b border-[#1E1A2B]">
            {searchTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setType(tab.key); setSearched(false); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-colors",
                  type === tab.key ? "text-[#7C3AED]" : "text-[#6B6580] hover:text-[#A8A0B8]"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {type === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t bg-[#7C3AED]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mx-auto mt-6 max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
              <span className="ml-3 text-sm text-[#6B6580]">Buscando...</span>
            </div>
          ) : !searched ? (
            <div className="py-20 text-center">
              <Search className="mx-auto mb-3 h-12 w-12 text-[#6B6580]/40" />
              <h3 className="text-sm font-medium text-[#6B6580]">Digite algo para buscar</h3>
            </div>
          ) : type === "users" ? (
            userResults.length === 0 ? (
              <div className="py-20 text-center text-sm text-[#6B6580]">Nenhum usuário encontrado.</div>
            ) : (
              <div className="space-y-2">
                {userResults.map((u) => (
                  <Link
                    key={u.id}
                    href={`/user/${u.username}`}
                    className="flex items-center gap-4 rounded-xl border border-[#1E1A2B] bg-[#161320] px-5 py-4 transition-colors hover:bg-[#1E1A2B]"
                  >
                    <img
                      src={u.profile_image_url}
                      alt={u.username}
                      className="h-11 w-11 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.jpg"; }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#E8E4F4]">{u.username}</p>
                      <p className="text-[12px] text-[#6B6580]">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : animeResults.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#6B6580]">Nenhum resultado encontrado.</div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-4">
              {animeResults.map((item) => (
                <Link
                  key={item.mal_id}
                  href={`/details/${type}/${item.mal_id}`}
                  className="overflow-hidden rounded-xl border border-[#1E1A2B] bg-[#161320] transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#7C3AED]/40"
                >
                  <div className="aspect-[3/4.2] overflow-hidden">
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="line-clamp-2 text-[12px] font-semibold text-[#E8E4F4]">{item.title}</h4>
                    {item.score && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-[#6B6580]">
                        <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                        {item.score.toFixed(1)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

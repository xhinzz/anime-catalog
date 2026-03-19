"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X, Search, Star, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface ListData {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  username: string;
  items: { malId: number; type: string; title: string | null; imageUrl: string | null }[];
}

interface SearchResult {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
}

export default function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [list, setList] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);

  // Add item modal
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("anime");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const isOwner = session?.user && list && (session.user as Record<string, unknown>).username === list.username;

  const loadList = () => {
    fetch(`/api/user/lists/${listId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setList(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadList(); }, [listId]);

  const doSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/jikan/${searchType}/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
    const data = await res.json();
    setSearchResults(data.items || []);
    setSearching(false);
  };

  const addItem = async (item: SearchResult) => {
    await fetch(`/api/user/lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ malId: item.mal_id, type: searchType, title: item.title, imageUrl: item.cover_url }),
    });
    loadList();
  };

  const removeItem = async (malId: number, type: string) => {
    await fetch(`/api/user/lists/${listId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ malId, type }),
    });
    loadList();
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" /></div>;
  if (!list) return <div className="flex h-screen items-center justify-center text-[#6B6580]">Lista não encontrada.</div>;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#6B6580] hover:text-[#E8E4F4]"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-[15px] font-bold text-[#E8E4F4]">{list.name}</h1>
            <p className="text-[11px] text-[#6B6580]">por @{list.username} · {list.items.length} itens</p>
          </div>
        </div>
        {isOwner && (
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#9B5CFF]">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        )}
      </div>

      {/* Description */}
      {list.description && (
        <div className="border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-3">
          <p className="text-[13px] text-[#A8A0B8]">{list.description}</p>
        </div>
      )}

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {list.items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#6B6580]">Esta lista está vazia.</p>
            {isOwner && (
              <button onClick={() => setAddOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#9B5CFF]">
                <Plus className="h-4 w-4" /> Adicionar animes
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
            {list.items.map((item) => (
              <div key={`${item.type}-${item.malId}`} className="group relative overflow-hidden rounded-xl border border-[#1E1A2B] bg-[#161320] transition-all hover:-translate-y-1 hover:shadow-lg">
                <a href={`/details/${item.type}/${item.malId}`}>
                  <div className="aspect-[3/4.2] overflow-hidden">
                    <img src={item.imageUrl || ""} alt={item.title || ""} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-[11px] font-semibold text-[#E8E4F4] leading-tight">{item.title}</p>
                    <p className="mt-0.5 text-[10px] text-[#6B6580] uppercase">{item.type}</p>
                  </div>
                </a>
                {isOwner && (
                  <button
                    onClick={() => removeItem(item.malId, item.type)}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add item modal */}
      {addOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setAddOpen(false); }}>
          <div className="w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl border border-[#1E1A2B] bg-[#110F1A] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1A2B]">
              <h2 className="text-base font-bold text-[#E8E4F4]">Adicionar a "{list.name}"</h2>
              <button onClick={() => setAddOpen(false)} className="text-[#6B6580] hover:text-[#E8E4F4]"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-4">
              <div className="flex gap-2">
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="rounded-lg border border-[#1E1A2B] bg-[#0D0B14] px-3 py-2 text-[12px] text-[#A8A0B8] outline-none">
                  <option value="anime">Anime</option>
                  <option value="manga">Mangá</option>
                </select>
                <div className="flex-1 flex items-center rounded-lg border border-[#1E1A2B] bg-[#0D0B14] px-3 focus-within:border-[#7C3AED]">
                  <Search className="h-4 w-4 text-[#6B6580]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    placeholder="Buscar..."
                    className="w-full bg-transparent px-2 py-2 text-[12px] text-[#E8E4F4] outline-none placeholder:text-[#6B6580]"
                  />
                </div>
                <button onClick={doSearch} className="rounded-lg bg-[#7C3AED] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#9B5CFF]">
                  Buscar
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {searching ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[#7C3AED]" /></div>
              ) : searchResults.length === 0 ? (
                <p className="py-8 text-center text-[12px] text-[#6B6580]">Busque um anime ou mangá para adicionar.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((item) => {
                    const alreadyIn = list.items.some((i) => i.malId === item.mal_id && i.type === searchType);
                    return (
                      <div key={item.mal_id} className="flex items-center gap-3 rounded-xl bg-[#161320] p-3 border border-[#1E1A2B]">
                        <img src={item.cover_url} alt="" className="h-14 w-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[#E8E4F4] line-clamp-1">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.score && <span className="flex items-center gap-1 text-[11px] text-[#6B6580]"><Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />{item.score.toFixed(1)}</span>}
                            <span className="text-[10px] text-[#6B6580] uppercase">{searchType}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => !alreadyIn && addItem(item)}
                          disabled={alreadyIn}
                          className={alreadyIn
                            ? "rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#6B6580] border border-[#1E1A2B]"
                            : "rounded-lg bg-[#7C3AED] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#9B5CFF]"
                          }
                        >
                          {alreadyIn ? "Adicionado" : "Adicionar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { List, Plus, Trash2, X, Loader2 } from "lucide-react";

interface UserListItem {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  itemCount: number;
  preview: string[];
  updatedAt: string;
}

export default function ListasPage() {
  const { data: session } = useSession();
  const [lists, setLists] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");

  const loadLists = () => {
    fetch("/api/user/lists")
      .then((r) => r.json())
      .then((d) => { setLists(d.lists || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (session) loadLists();
    else setLoading(false);
  }, [session]);

  const createList = async () => {
    if (!newName.trim()) { setCreateErr("Nome obrigatório."); return; }
    setCreating(true);
    setCreateErr("");
    const res = await fetch("/api/user/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.success) {
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      loadLists();
    } else {
      setCreateErr(data.message || "Erro ao criar lista.");
    }
  };

  const deleteList = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta lista?")) return;
    await fetch(`/api/user/lists/${id}`, { method: "DELETE" });
    loadLists();
  };

  if (!session) {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex items-center border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-4">
          <List className="mr-3 h-5 w-5 text-[#7C3AED]" />
          <h1 className="text-[15px] font-semibold text-[#E8E4F4]">Listas</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-[#6B6580] text-sm">Faça login para criar listas.</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-4">
        <div className="flex items-center">
          <List className="mr-3 h-5 w-5 text-[#7C3AED]" />
          <h1 className="text-[15px] font-semibold text-[#E8E4F4]">Minhas Listas</h1>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#9B5CFF] transition-colors"
        >
          <Plus className="h-4 w-4" /> Nova Lista
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
          </div>
        ) : lists.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#6B6580]">Você ainda não criou nenhuma lista.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#9B5CFF]"
            >
              <Plus className="h-4 w-4" /> Criar primeira lista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {lists.map((list) => (
              <div key={list.id} className="group rounded-xl border border-[#1E1A2B] bg-[#161320] overflow-hidden hover:border-[#7C3AED]/30 transition-colors">
                {/* Preview images */}
                <div className="h-24 bg-[#110F1A] flex">
                  {list.preview.length > 0 ? (
                    list.preview.map((img, i) => (
                      <div key={i} className="flex-1 overflow-hidden">
                        <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-[#2A2538]">
                      <List className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <a href={`/listas/${list.id}`} className="text-[14px] font-bold text-[#E8E4F4] hover:text-[#7C3AED] transition-colors">
                        {list.name}
                      </a>
                      {list.description && <p className="mt-1 text-[12px] text-[#6B6580] line-clamp-2">{list.description}</p>}
                    </div>
                    <button
                      onClick={() => deleteList(list.id)}
                      className="ml-2 text-[#6B6580] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Excluir lista"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B6580]">
                    <span>{list.itemCount} itens</span>
                    <span>{list.isPublic ? "Pública" : "Privada"}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Create new card */}
            <button
              onClick={() => setCreateOpen(true)}
              className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1E1A2B] hover:border-[#7C3AED]/50 transition-colors"
            >
              <Plus className="h-8 w-8 text-[#7C3AED]/50" />
              <span className="mt-2 text-[12px] text-[#6B6580]">Nova lista</span>
            </button>
          </div>
        )}
      </div>

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setCreateOpen(false); }}>
          <div className="w-full max-w-md rounded-2xl border border-[#1E1A2B] bg-[#110F1A] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1A2B]">
              <h2 className="text-base font-bold text-[#E8E4F4]">Nova Lista</h2>
              <button onClick={() => setCreateOpen(false)} className="text-[#6B6580] hover:text-[#E8E4F4]"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#A8A0B8]">Nome da lista</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Melhores Animes de 2024"
                  maxLength={100}
                  autoFocus
                  className="w-full rounded-xl border border-[#1E1A2B] bg-[#0D0B14] px-4 py-3 text-[13px] text-[#E8E4F4] outline-none focus:border-[#7C3AED] placeholder:text-[#6B6580]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#A8A0B8]">Descrição (opcional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Uma breve descrição..."
                  rows={2}
                  maxLength={300}
                  className="w-full rounded-xl border border-[#1E1A2B] bg-[#0D0B14] px-4 py-3 text-[13px] text-[#E8E4F4] outline-none focus:border-[#7C3AED] resize-none placeholder:text-[#6B6580]"
                />
              </div>
              {createErr && <p className="text-[12px] font-medium text-red-400">{createErr}</p>}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#1E1A2B]">
              <button onClick={() => setCreateOpen(false)} className="rounded-xl border border-[#1E1A2B] px-5 py-2.5 text-[13px] font-medium text-[#6B6580] hover:bg-white/5">
                Cancelar
              </button>
              <button
                onClick={createList}
                disabled={creating}
                className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#9B5CFF] disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

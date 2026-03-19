"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, User, Palette, Bell, AlertTriangle, Loader2 } from "lucide-react";

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-[#7C3AED]" : "bg-[#1E1A2B]"}`}>
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

interface UserData {
  username: string;
  email: string;
  createdAt: string;
  emailVerified: boolean;
  discord: { id: string; username: string | null; avatar: string | null } | null;
}

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifNewEpisodes, setNotifNewEpisodes] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Email verification
  const [verifyStep, setVerifyStep] = useState<"idle" | "sent" | "verified">("idle");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifySending, setVerifySending] = useState(false);

  // Email change
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeMsg, setEmailChangeMsg] = useState("");

  const sendCode = async () => {
    setVerifySending(true);
    setVerifyMsg("");
    const res = await fetch("/api/user/email/send-code", { method: "POST" });
    const data = await res.json();
    setVerifySending(false);
    if (data.success) { setVerifyStep("sent"); setVerifyMsg("Código enviado para seu email!"); }
    else setVerifyMsg(data.message || "Erro ao enviar.");
  };

  const confirmCode = async () => {
    setVerifySending(true);
    setVerifyMsg("");
    const res = await fetch("/api/user/email/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: verifyCode }),
    });
    const data = await res.json();
    setVerifySending(false);
    if (data.success) {
      setVerifyStep("verified");
      setVerifyMsg("Email verificado!");
      setUser((u) => u ? { ...u, emailVerified: true } : u);
    } else setVerifyMsg(data.message || "Código inválido.");
  };

  const changeEmail = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailChangeMsg("Email inválido.");
      return;
    }
    setVerifySending(true);
    setEmailChangeMsg("");
    const res = await fetch("/api/user/email/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
    });
    const data = await res.json();
    setVerifySending(false);
    if (data.success) {
      setEmailChangeMsg("Email atualizado! Verifique o novo email.");
      setEditingEmail(false);
      setVerifyStep("idle");
      setVerifyMsg("");
      // Force session refresh would be needed for session.user.email,
      // but we update local display
      setUser((u) => u ? { ...u, emailVerified: false } : u);
    } else {
      setEmailChangeMsg(data.message || "Erro ao trocar email.");
    }
  };

  useEffect(() => {
    if (!session?.user) { setLoading(false); return; }
    const username = (session.user as Record<string, unknown>).username as string;
    fetch(`/api/users/${username}/profile`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) setUser({ username: d.username, email: "", createdAt: d.createdAt, emailVerified: d.emailVerified, discord: d.discord });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    const saved = localStorage.getItem("app-theme");
    if (saved) setTheme(saved as "dark" | "light");
  }, []);

  const changeTheme = (t: "dark" | "light") => {
    setTheme(t);
    localStorage.setItem("app-theme", t);
    // Apply theme to document
    if (t === "light") {
      document.documentElement.style.setProperty("--color-bg-primary", "#f5f3ff");
      document.documentElement.style.setProperty("--color-bg-secondary", "#ede9fe");
      document.documentElement.style.setProperty("--color-bg-card", "#ffffff");
      document.documentElement.style.setProperty("--color-text-primary", "#1e1b2e");
      document.documentElement.style.setProperty("--color-text-secondary", "#6b6580");
    } else {
      document.documentElement.style.setProperty("--color-bg-primary", "#0D0B14");
      document.documentElement.style.setProperty("--color-bg-secondary", "#110F1A");
      document.documentElement.style.setProperty("--color-bg-card", "#161320");
      document.documentElement.style.setProperty("--color-text-primary", "#E8E4F4");
      document.documentElement.style.setProperty("--color-text-secondary", "#A8A0B8");
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-[#6B6580]">
        <p className="text-sm">Faça login para acessar as configurações.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center border-b border-[#1E1A2B] bg-[#110F1A] px-6 py-4">
        <Settings className="mr-3 h-5 w-5 text-[#7C3AED]" />
        <h1 className="text-[15px] font-semibold text-[#E8E4F4]">Configurações</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Conta */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-[14px] font-semibold text-[#E8E4F4]">Conta</h2>
            </div>
            <div className="rounded-xl border border-[#1E1A2B] bg-[#110F1A] divide-y divide-[#1E1A2B]">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] text-[#6B6580]">Username</p>
                  <p className="mt-0.5 text-[13px] font-medium text-[#E8E4F4]">{user?.username || session.user?.name}</p>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-[#6B6580]">Email</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="text-[13px] font-medium text-[#E8E4F4]">{session.user?.email || "—"}</p>
                      {user?.emailVerified ? (
                        <span className="rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">Verificado</span>
                      ) : (
                        <span className="rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[10px] font-bold text-[#F59E0B]">Não verificado</span>
                      )}
                    </div>
                  </div>
                  {/* Change email button - only if not verified */}
                  {!user?.emailVerified && !editingEmail && (
                    <button
                      onClick={() => { setEditingEmail(true); setNewEmail(session.user?.email || ""); setEmailChangeMsg(""); }}
                      className="rounded-lg border border-[#1E1A2B] px-3 py-1.5 text-[12px] font-medium text-[#A8A0B8] hover:border-[#7C3AED] hover:text-[#E8E4F4]"
                    >
                      Trocar email
                    </button>
                  )}
                </div>

                {/* Change email form */}
                {editingEmail && !user?.emailVerified && (
                  <div className="mt-3">
                    <p className="mb-2 text-[12px] text-[#A8A0B8]">Digite o novo email:</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="novo@email.com"
                        className="flex-1 rounded-lg border border-[#1E1A2B] bg-[#0D0B14] px-3 py-2 text-[13px] text-[#E8E4F4] outline-none focus:border-[#7C3AED] placeholder:text-[#6B6580]"
                      />
                      <button
                        onClick={changeEmail}
                        disabled={verifySending}
                        className="rounded-lg bg-[#7C3AED] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#9B5CFF] disabled:opacity-50"
                      >
                        {verifySending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Salvar"}
                      </button>
                      <button onClick={() => { setEditingEmail(false); setEmailChangeMsg(""); }} className="text-[11px] text-[#6B6580] hover:text-[#A8A0B8]">
                        Cancelar
                      </button>
                    </div>
                    {emailChangeMsg && (
                      <p className={`mt-2 text-[12px] font-medium ${emailChangeMsg.includes("atualizado") ? "text-[#22C55E]" : "text-red-400"}`}>
                        {emailChangeMsg}
                      </p>
                    )}
                  </div>
                )}

                {/* Verification flow */}
                {!user?.emailVerified && !editingEmail && verifyStep === "idle" && (
                  <button
                    onClick={sendCode}
                    disabled={verifySending}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#9B5CFF] disabled:opacity-50"
                  >
                    {verifySending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Enviar código de verificação
                  </button>
                )}
                {!user?.emailVerified && !editingEmail && verifyStep === "sent" && (
                  <div className="mt-3">
                    <p className="mb-2 text-[12px] text-[#A8A0B8]">Digite o código de 6 dígitos enviado para seu email:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        placeholder="000000"
                        className="w-32 rounded-lg border border-[#1E1A2B] bg-[#0D0B14] px-3 py-2 text-center font-mono text-[16px] font-bold tracking-[4px] text-[#E8E4F4] outline-none focus:border-[#7C3AED]"
                      />
                      <button
                        onClick={confirmCode}
                        disabled={verifySending || verifyCode.length !== 6}
                        className="rounded-lg bg-[#7C3AED] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#9B5CFF] disabled:opacity-50"
                      >
                        {verifySending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verificar"}
                      </button>
                      <button onClick={sendCode} disabled={verifySending} className="text-[11px] text-[#6B6580] hover:text-[#7C3AED]">
                        Reenviar
                      </button>
                    </div>
                  </div>
                )}
                {verifyMsg && !editingEmail && (
                  <p className={`mt-2 text-[12px] font-medium ${user?.emailVerified || verifyStep === "verified" ? "text-[#22C55E]" : verifyMsg.includes("Erro") || verifyMsg.includes("incorreto") || verifyMsg.includes("expirado") ? "text-red-400" : "text-[#7C3AED]"}`}>
                    {verifyMsg}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] text-[#6B6580]">Membro desde</p>
                  <p className="mt-0.5 text-[13px] font-medium text-[#E8E4F4]">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Discord */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.225-1.993a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.098.246-.198.373-.292a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg>
              <h2 className="text-[14px] font-semibold text-[#E8E4F4]">Contas vinculadas</h2>
            </div>
            <div className="rounded-xl border border-[#1E1A2B] bg-[#110F1A] px-5 py-4">
              {user?.discord ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.discord.avatar && <img src={user.discord.avatar} alt="" className="h-9 w-9 rounded-full" />}
                    <div>
                      <p className="text-[13px] font-semibold text-[#5865F2]">{user.discord.username}</p>
                      <p className="text-[10px] text-[#6B6580]">Discord conectado</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch("/api/user/discord/disconnect", { method: "POST" });
                      setUser((u) => u ? { ...u, discord: null } : u);
                    }}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[12px] font-medium text-red-400 hover:bg-red-500/10"
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#E8E4F4]">Discord</p>
                    <p className="mt-0.5 text-[12px] text-[#6B6580]">Vincule sua conta para exibir no perfil</p>
                  </div>
                  <a
                    href="/api/user/discord/connect"
                    className="flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#4752C4] transition-colors"
                  >
                    Conectar
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Aparência */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-[14px] font-semibold text-[#E8E4F4]">Aparência</h2>
            </div>
            <div className="rounded-xl border border-[#1E1A2B] bg-[#110F1A] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#E8E4F4]">Tema</p>
                  <p className="mt-0.5 text-[12px] text-[#6B6580]">Escolha entre tema escuro ou claro</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeTheme("dark")}
                    className={`rounded-lg px-4 py-1.5 text-[12px] font-medium transition-colors ${theme === "dark" ? "bg-[#7C3AED] text-white" : "border border-[#1E1A2B] text-[#6B6580] hover:text-[#A8A0B8]"}`}
                  >
                    Escuro
                  </button>
                  <button
                    onClick={() => changeTheme("light")}
                    className={`rounded-lg px-4 py-1.5 text-[12px] font-medium transition-colors ${theme === "light" ? "bg-[#7C3AED] text-white" : "border border-[#1E1A2B] text-[#6B6580] hover:text-[#A8A0B8]"}`}
                  >
                    Claro
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Notificações */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-[14px] font-semibold text-[#E8E4F4]">Notificações</h2>
            </div>
            <div className="rounded-xl border border-[#1E1A2B] bg-[#110F1A] divide-y divide-[#1E1A2B]">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-[#E8E4F4]">Novos episódios</p>
                  <p className="mt-0.5 text-[12px] text-[#6B6580]">Alertas quando novos episódios forem lançados</p>
                </div>
                <Toggle enabled={notifNewEpisodes} onToggle={() => setNotifNewEpisodes(!notifNewEpisodes)} />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-[#E8E4F4]">Atualizações da plataforma</p>
                  <p className="mt-0.5 text-[12px] text-[#6B6580]">Novidades e melhorias</p>
                </div>
                <Toggle enabled={notifUpdates} onToggle={() => setNotifUpdates(!notifUpdates)} />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-[#E8E4F4]">Notificações por email</p>
                  <p className="mt-0.5 text-[12px] text-[#6B6580]">Receba notificações por email</p>
                </div>
                <Toggle enabled={notifEmail} onToggle={() => setNotifEmail(!notifEmail)} />
              </div>
            </div>
          </section>

          {/* Zona de Perigo */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="text-[14px] font-semibold text-red-500">Zona de Perigo</h2>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-[#110F1A] px-5 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#E8E4F4]">Excluir conta</p>
                  <p className="mt-0.5 text-[12px] text-[#6B6580]">Essa ação é permanente e não pode ser desfeita.</p>
                </div>
                <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-500/20">
                  Excluir minha conta
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

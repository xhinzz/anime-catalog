"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou senha inválidos.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0B14] px-6">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED] opacity-[0.04] blur-[120px]" />
        <div className="absolute left-1/4 top-1/4 h-48 w-48 rounded-full bg-[#7C3AED] opacity-[0.04] blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src="/logo.png" alt="AnimeList" width={40} height={40} className="rounded-xl" />
          <span className="text-lg font-bold tracking-tight text-white">
            Anime<span className="text-[#7C3AED]">List</span>
          </span>
        </div>

        <div className="rounded-2xl border border-[#1E1A2B] bg-[#110F1A] p-8">
          <h1 className="mb-2 text-xl font-bold text-white">Entrar</h1>
          <p className="mb-6 text-sm text-[#6B6580]">Acesse sua conta para continuar</p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#A8A0B8]">Email</label>
              <div className="flex items-center rounded-xl border border-[#1E1A2B] bg-[#110F1A] px-3 focus-within:border-[#7C3AED]">
                <Mail className="h-4 w-4 text-[#6B6580]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#6B6580]"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#A8A0B8]">Senha</label>
              <div className="flex items-center rounded-xl border border-[#1E1A2B] bg-[#110F1A] px-3 focus-within:border-[#7C3AED]">
                <Lock className="h-4 w-4 text-[#6B6580]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#6B6580]"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-3 text-sm font-bold text-white transition-colors hover:bg-[#9B5CFF] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>Entrar <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[#6B6580]">
            Não tem conta?{" "}
            <Link href="/register" className="font-medium text-[#7C3AED] hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

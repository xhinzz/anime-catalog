"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Home, User, Search, Bell, ListChecks, Crown,
  Heart, HelpCircle, Settings, LogOut, LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";
import LocaleSwitch from "./LocaleSwitch";
import Image from "next/image";

const navItems = [
  { href: "/", icon: Home, tKey: "feed" },
  { href: "/perfil", icon: User, tKey: "perfil", authOnly: true },
  { href: "/buscar", icon: Search, tKey: "buscar" },
  { href: "/notificacoes", icon: Bell, tKey: "notificacoes", authOnly: true },
  { href: "/listas", icon: ListChecks, tKey: "listas" },
  { href: "/premium", icon: Crown, tKey: "premium", special: "premium" },
  { href: "/apoiadores", icon: Heart, tKey: "apoiadores" },
  { href: "/suporte", icon: HelpCircle, tKey: "suporte" },
  { href: "/configuracoes", icon: Settings, tKey: "configuracoes" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLocale();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Fetch user profile for avatar
  useEffect(() => {
    if (session?.user) {
      const username = (session.user as Record<string, unknown>).username as string;
      if (username) {
        fetch(`/api/users/${username}/profile`)
          .then((r) => r.ok ? r.json() : null)
          .then((d) => {
            if (d) {
              setAvatarUrl(d.profileImageUrl !== "/default-avatar.jpg" ? d.profileImageUrl : null);
              setDisplayName(d.displayName);
            }
          })
          .catch(() => {});
      }
    }
  }, [session]);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[210px] flex-col border-r border-[#1E1A2B] bg-[#0D0B14]">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-[#1E1A2B]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="AnimeList" width={28} height={28} className="rounded-lg" />
          <span className="text-[13px] font-bold tracking-tight text-white">
            Anime<span className="text-[#7C3AED]">List</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          if (item.authOnly && !session) return null;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const href =
            item.href === "/perfil" && session
              ? `/user/${(session.user as Record<string, unknown>).username}`
              : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-all",
                isActive
                  ? "bg-[#7C3AED] text-white"
                  : item.special === "premium"
                  ? "text-[#F59E0B] hover:bg-[#F59E0B]/10"
                  : "text-[#6B6580] hover:bg-white/[0.04] hover:text-[#A8A0B8]"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {t(item.tKey)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: locale + user */}
      <div className="border-t border-[#1E1A2B] px-3 py-2">
        <LocaleSwitch />
      </div>
      <div className="border-t border-[#1E1A2B] px-3 py-3">
        {session ? (
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-white/[0.04]">
            {/* Avatar */}
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#7C3AED]/20 flex-shrink-0 flex items-center justify-center text-[#7C3AED] text-[12px] font-bold">
                {session.user?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">
                {displayName || session.user?.name}
              </p>
              <p className="text-[10px] text-[#6B6580] truncate">
                @{session.user?.name}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-[#6B6580] hover:text-[#EF4444] transition-colors"
              title={t("sair")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#6B6580] hover:bg-white/[0.04] hover:text-white"
          >
            <LogIn className="h-[18px] w-[18px]" />
            {t("entrar")}
          </Link>
        )}
      </div>
    </aside>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import DesktopNav from "./DesktopNav";
import { Button } from "../ui/button";
import MobileNav from "./MobileNav";

const Header = () => {
  const supabase = createClient();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // セッションを取得
  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getInitialSession();

    // セッション（ログイン/ログアウト）が変更されたらセッションを更新
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="bg-white shadow-sm border-b px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-gray-800"
        >
          <BookOpen className="w-6 h-6 text-blue-600" />
          WordMate
        </Link>

        {/* デスクトップナビゲーション */}
        <DesktopNav session={session} isActive={isActive} />

        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* モバイルナビゲーション */}
      {isMobileMenuOpen && (
        <MobileNav
          session={session}
          isActive={isActive}
          closeMenu={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;

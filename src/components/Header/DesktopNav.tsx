"use client";

import Link from "next/link";
import { Home, BookOpen, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutButton from "./LogoutButton";
import type { Session } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

const DesktopNav = ({
  session,
  isActive,
}: {
  session: Session | null;
  isActive: (path: string) => boolean;
}) => {
  const router = useRouter();
  const username =
    session?.user.user_metadata.full_name || session?.user.email?.split("@")[0];

  return (
    <nav className="hidden md:flex items-center gap-2">
      <Link href="/">
        <Button
          variant={isActive("/") ? "default" : "ghost"}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          検索
        </Button>
      </Link>

      <Link href="/wordbook">
        <Button
          variant={isActive("/wordbook") ? "default" : "ghost"}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          単語帳
        </Button>
      </Link>

      {/* ユーザーがログインしている場合 */}

      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <User className="w-4 h-4" />
              {username}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-full">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{username}</p>
                <p className="text-xs leading-none text-gray-500">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                router.push("/settings");
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>パスワードを変更する</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // ユーザーがログインしていない場合
        <Link href="/auth">
          <Button
            variant={isActive("/auth") ? "default" : "ghost"}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            ログイン
          </Button>
        </Link>
      )}
    </nav>
  );
};

export default DesktopNav;

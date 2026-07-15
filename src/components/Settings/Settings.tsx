"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Trash2, ChevronRight } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

export default function Settings() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/auth");
      } else {
        const email = data.session.user.email || "";
        const name =
          data.session.user.user_metadata.full_name ||
          email.split("@")[0] ||
          "";
        setUserEmail(email);
        setUsername(name);
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">アカウント設定</h1>
          <p className="text-gray-600 mb-8">
            Manage your account settings and preferences
          </p>

          {/* ユーザー情報 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">ユーザー情報</h2>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="text-lg font-medium">{username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium">{userEmail}</p>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* パスワード変更セクション */}
          <div className="mb-8">
            <Link href="/settings/change-password">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="font-semibold">パスワードを変更する</h2>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          </div>

          <Separator className="my-8" />

          {/* アカウント削除セクション */}
          <div>
            <Link href="/settings/delete-account">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <h2 className="font-semibold text-red-600">
                      アカウントを削除する
                    </h2>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
